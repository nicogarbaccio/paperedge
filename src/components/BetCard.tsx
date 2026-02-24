import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { CustomColumn } from '@/hooks/useNotebook';
import { CustomFieldCells, NotesFields, processCustomFields } from '@/components/BetCustomFieldsGrid';
import {
  formatCurrency,
  formatDate,
  getStatusColorClass,
} from '@/lib/utils';

interface BetCardProps {
  bet: {
    id: string;
    date: string;
    description: string;
    odds: number;
    wager_amount: number;
    status: 'pending' | 'won' | 'lost' | 'push';
    return_amount: number | null;
  };
  customColumns: CustomColumn[];
  betCustomData: Record<string, Record<string, string>>;
  isBulkEditMode: boolean;
  isSelected: boolean;
  onToggleSelection: (betId: string) => void;
  onEdit: (bet: BetCardProps['bet']) => void;
  gameName?: string | null;
  leagueName?: string;
  onAddBetToGame?: (gameName: string, date: string, league?: string) => void;
  showGameName?: boolean;
}

export function BetCard({
  bet,
  customColumns,
  betCustomData,
  isBulkEditMode,
  isSelected,
  onToggleSelection,
  onEdit,
  gameName,
  leagueName,
  onAddBetToGame,
  showGameName = true,
}: BetCardProps) {
  const displayGameName = showGameName ? gameName : null;
  const hasAddToGame = displayGameName && onAddBetToGame;

  const { gridFields, notesFields } = processCustomFields(
    customColumns,
    betCustomData[bet.id] || {}
  );

  return (
    <div
      data-testid="bet-card"
      className={`flex flex-col space-y-3 p-4 border rounded-lg transition-all cursor-pointer ${
        isBulkEditMode && isSelected
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-accent/50 hover:bg-surface-secondary/30'
      }`}
      onClick={() => {
        if (isBulkEditMode) {
          onToggleSelection(bet.id);
        } else {
          onEdit(bet);
        }
      }}
    >
      {/* Header: Game name, description, status + optional Add to Game */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isBulkEditMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(bet.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0"
              data-testid="bet-card-checkbox"
            />
          )}
          <div className="flex-1 min-w-0">
            {displayGameName && (
              <p className="text-xs text-accent font-medium mb-1">
                {displayGameName}
              </p>
            )}
            <h3 className="font-medium text-text-primary" data-testid="bet-card-description">
              {bet.description}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasAddToGame && (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={(e) => {
                e.stopPropagation();
                onAddBetToGame(displayGameName, bet.date, leagueName);
              }}
              data-testid="add-bet-to-game-button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Bet to Game
            </Button>
          )}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColorClass(
              bet.status
            )} bg-surface-secondary/30`}
            data-testid="bet-card-status"
          >
            {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Unified grid: custom fields + metrics */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm"
        data-testid="bet-custom-fields-grid"
      >
        <CustomFieldCells fields={gridFields} />
        <div>
          <p className="text-text-secondary text-xs">Date</p>
          <p className="font-medium" data-testid="bet-card-date">
            {formatDate(bet.date)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Odds</p>
          <p className="font-medium" data-testid="bet-card-odds">
            {bet.odds > 0 ? '+' : ''}
            {bet.odds}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Wager</p>
          <p className="font-medium" data-testid="bet-card-wager">
            {formatCurrency(bet.wager_amount)}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Return</p>
          <p
            className={`font-medium ${
              bet.status === 'won'
                ? 'text-profit'
                : bet.status === 'lost'
                ? 'text-loss'
                : 'text-text-secondary'
            }`}
            data-testid="bet-card-return"
          >
            {bet.status === 'pending'
              ? 'Pending'
              : bet.status === 'push'
              ? 'Push'
              : bet.status === 'won' && bet.return_amount
              ? formatCurrency(bet.return_amount)
              : bet.status === 'lost'
              ? `-${formatCurrency(bet.wager_amount)}`
              : '-'}
          </p>
        </div>
      </div>

      {/* Notes below the grid */}
      <NotesFields fields={notesFields} />

      {/* Mobile-only Add to Game button */}
      {hasAddToGame && (
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:hidden"
          onClick={(e) => {
            e.stopPropagation();
            onAddBetToGame(displayGameName, bet.date, leagueName);
          }}
          data-testid="add-bet-to-game-button-mobile"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add to Game
        </Button>
      )}
    </div>
  );
}
