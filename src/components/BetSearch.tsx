import { useState, useEffect } from "react";
import { Search, X, Filter, Calendar, DollarSign, Percent } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { DateInput } from "@/components/ui/DateInput";

export interface SearchFilters {
  query: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  oddsMin: number | null;
  oddsMax: number | null;
  wagerMin: number | null;
  wagerMax: number | null;
}

interface BetSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalBets: number;
  filteredCount: number;
}

export function BetSearch({
  filters,
  onFiltersChange,
  totalBets,
  filteredCount,
}: BetSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(filters.query);

  // Sync local query with parent filters when parent clears it
  useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

  // Debounced search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== filters.query) {
        onFiltersChange({ ...filters, query: localQuery });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, filters, onFiltersChange]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const formatDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const setTodayFilter = () => {
    const today = new Date();
    const todayStr = formatDateString(today);
    onFiltersChange({
      ...filters,
      dateFrom: todayStr,
      dateTo: todayStr
    });
  };

  const setYesterdayFilter = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateString(yesterday);
    onFiltersChange({
      ...filters,
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr
    });
  };

  const setThisWeekFilter = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(today);
    // Start from Sunday
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    onFiltersChange({
      ...filters,
      dateFrom: formatDateString(startOfWeek),
      dateTo: formatDateString(today)
    });
  };

  const setLast30DaysFilter = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    onFiltersChange({
      ...filters,
      dateFrom: formatDateString(thirtyDaysAgo),
      dateTo: formatDateString(today)
    });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      oddsMin: null,
      oddsMax: null,
      wagerMin: null,
      wagerMax: null,
    };
    onFiltersChange(clearedFilters);
    setLocalQuery("");
  };

  const hasActiveFilters = () => {
    return (
      filters.query ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.oddsMin !== null ||
      filters.oddsMax !== null ||
      filters.wagerMin !== null ||
      filters.wagerMax !== null
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.status) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.oddsMin !== null || filters.oddsMax !== null) count++;
    if (filters.wagerMin !== null || filters.wagerMax !== null) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none z-10" />
        <Input
          type="text"
          placeholder="Search bets by description..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-12 pr-10"
          data-testid="bet-search-input"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setLocalQuery("")}
            data-testid="bet-search-clear-button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle and Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2"
            data-testid="bet-filters-toggle-button"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-medium" data-testid="bet-filters-active-count">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-text-secondary hover:text-text-primary"
              data-testid="bet-filters-clear-button"
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="text-sm text-text-secondary" data-testid="bet-search-results-count">
          Showing {filteredCount} of {totalBets} bets
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-surface-secondary/30" data-testid="bet-filters-panel">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              data-testid="bet-filter-status-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="push">Push</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Date Range</span>
            </Label>

            {/* Quick Date Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setTodayFilter}
                className="text-xs h-8 px-3"
                data-testid="bet-filter-today-button"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={setYesterdayFilter}
                className="text-xs h-8 px-3"
                data-testid="bet-filter-yesterday-button"
              >
                Yesterday
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={setThisWeekFilter}
                className="text-xs h-8 px-3"
                data-testid="bet-filter-this-week-button"
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={setLast30DaysFilter}
                className="text-xs h-8 px-3"
                data-testid="bet-filter-last-30-days-button"
              >
                Last 30 Days
              </Button>
            </div>

            {/* Custom Date Range Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                value={filters.dateFrom}
                onChange={(value) => updateFilter("dateFrom", value)}
                placeholder="Start date"
                data-testid="bet-filter-date-from"
              />
              <DateInput
                value={filters.dateTo}
                onChange={(value) => updateFilter("dateTo", value)}
                placeholder="End date"
                data-testid="bet-filter-date-to"
              />
            </div>
          </div>

          {/* Odds Range */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Percent className="h-4 w-4" />
              <span>Odds Range</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Min"
                value={filters.oddsMin || ""}
                onChange={(e) =>
                  updateFilter(
                    "oddsMin",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                data-testid="bet-filter-odds-min"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.oddsMax || ""}
                onChange={(e) =>
                  updateFilter(
                    "oddsMax",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                data-testid="bet-filter-odds-max"
              />
            </div>
          </div>

          {/* Wager Range */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Wager Amount Range</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Minimum wager"
                value={filters.wagerMin || ""}
                onChange={(e) =>
                  updateFilter(
                    "wagerMin",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                data-testid="bet-filter-wager-min"
              />
              <Input
                type="number"
                placeholder="Maximum wager"
                value={filters.wagerMax || ""}
                onChange={(e) =>
                  updateFilter(
                    "wagerMax",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                data-testid="bet-filter-wager-max"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
