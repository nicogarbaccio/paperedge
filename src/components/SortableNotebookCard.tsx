import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NotebookCard } from './NotebookCard';
import { Notebook } from '@/hooks/useNotebooks';
import { memo, useMemo } from 'react';

interface SortableNotebookCardProps {
  notebook: Notebook;
}

export const SortableNotebookCard = memo(function SortableNotebookCard({ notebook }: SortableNotebookCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: notebook.id });

  const style = useMemo(() => ({
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0 : 1,
  }), [transform, transition, isDragging]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full touch-none">
      {/*
        We disable pointer events on the card content while dragging to prevent
        interaction with the Link inside. Remove duplicate opacity control.
      */}
      <div className={`h-full ${isDragging ? "pointer-events-none" : ""}`}>
          <NotebookCard notebook={notebook} className="h-full" />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Same comparison logic as NotebookCard to prevent unnecessary re-renders
  return (
    prevProps.notebook.id === nextProps.notebook.id &&
    prevProps.notebook.name === nextProps.notebook.name &&
    prevProps.notebook.description === nextProps.notebook.description &&
    prevProps.notebook.color === nextProps.notebook.color &&
    prevProps.notebook.current_bankroll === nextProps.notebook.current_bankroll &&
    prevProps.notebook.bet_count === nextProps.notebook.bet_count &&
    prevProps.notebook.win_rate === nextProps.notebook.win_rate &&
    prevProps.notebook.total_pl === nextProps.notebook.total_pl &&
    prevProps.notebook.roi === nextProps.notebook.roi &&
    prevProps.notebook.starting_bankroll === nextProps.notebook.starting_bankroll
    // display_order and updated_at are IGNORED
  );
});
