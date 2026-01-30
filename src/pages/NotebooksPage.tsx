import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useMemo } from "react";
import { Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNotebooks } from "@/hooks/useNotebooks";
import { CreateNotebookDialog } from "@/components/CreateNotebookDialog";
import { useToast } from "@/hooks/useToast";
import { NotebooksSkeleton } from "@/components/skeletons/NotebooksSkeleton";
import { StaggeredGrid } from "@/components/ui/StaggeredList";
import { NotebookCard } from "@/components/NotebookCard";
import { SortableNotebookCard } from "@/components/SortableNotebookCard";

type SortOption = 'custom' | 'alphabetical' | 'newest' | 'oldest' | 'color';

export function NotebooksPage() {
  const { notebooks, loading, error, createNotebook, reorderNotebooks } = useNotebooks();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Default to "newest" sort on mobile to prevent accidental drags, "custom" otherwise
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'newest';
    }
    return 'custom';
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedNotebooks = useMemo(() => {
    const sorted = [...notebooks];
    switch (sortOption) {
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'color':
         return sorted.sort((a, b) => {
           const colorA = a.color || '';
           const colorB = b.color || '';
           return colorA.localeCompare(colorB);
         });
      case 'custom':
      default:
        // Assuming notebooks are already sorted by display_order from the hook
        // But we should ensure stable sort by display_order if not
        return sorted.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
  }, [notebooks, sortOption]);

  const activeNotebook = useMemo(
    () => sortedNotebooks.find((n) => n.id === activeId),
    [activeId, sortedNotebooks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sortedNotebooks.findIndex((n) => n.id === active.id);
      const newIndex = sortedNotebooks.findIndex((n) => n.id === over.id);

      const newOrder = arrayMove(sortedNotebooks, oldIndex, newIndex);
      reorderNotebooks(newOrder);
      
      toast({
        title: "Notebook moved",
        description: "The notebook order has been updated.",
        variant: "success",
      });
    }
  };

  const handleCreateNotebook = async (data: {
    name: string;
    description?: string;
    starting_bankroll: number;
    color?: string;
    unit_size: number;
  }) => {
    await createNotebook(data);
    toast({
      title: "Notebook created",
      description: `"${data.name}" has been successfully created.`,
      variant: "success",
    });
  };

  if (loading) {
    return <NotebooksSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-loss mb-2">Error loading notebooks</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-text-primary"
            data-testid="notebooks-page-title"
          >
            Notebooks
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your betting strategies and track performance
          </p>
        </div>
        {/* Controls */}
        {notebooks.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="h-10 pl-3 pr-8 bg-surface border border-border rounded-md text-sm text-text-primary focus:ring-2 focus:ring-accent focus:outline-none appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="custom">Custom Order</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="color">Color</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-3 h-4 w-4 text-text-secondary pointer-events-none" />
             </div>
            <Button
              className="flex items-center space-x-2 flex-1 sm:flex-none justify-center"
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="create-notebook-button"
            >
              <Plus className="h-4 w-4" />
              <span>New Notebook</span>
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {notebooks.length === 0 ? (
        // Clean empty state with single create button
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-testid="notebooks-empty-state"
        >
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Create Your First Notebook
            </h2>
            <p className="text-text-secondary mb-8 text-lg leading-relaxed">
              Start tracking your betting strategies and analyze your
              performance with detailed insights.
            </p>
            <Button
              size="lg"
              onClick={() => setIsCreateDialogOpen(true)}
              className="px-8 py-3 text-base"
              data-testid="create-notebook-button"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Notebook
            </Button>
          </div>
        </div>
      ) : (
        // Notebooks grid
        <>
          {sortOption === 'custom' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedNotebooks.map(n => n.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedNotebooks.map((notebook) => (
                    <SortableNotebookCard key={notebook.id} notebook={notebook} />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                 {activeNotebook ? (
                   <div className="cursor-grabbing">
                     <NotebookCard
                       notebook={activeNotebook}
                       className="shadow-2xl rotate-3 scale-105 opacity-90"
                     />
                   </div>
                 ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <StaggeredGrid
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="notebooks-grid"
              columns={3}
              staggerDelay={70}
            >
              {sortedNotebooks.map((notebook) => (
                <NotebookCard key={notebook.id} notebook={notebook} />
              ))}
            </StaggeredGrid>
          )}
        </>
      )}

      {/* Create Notebook Dialog */}
      <CreateNotebookDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateNotebook={handleCreateNotebook}
      />
    </div>
  );
}
