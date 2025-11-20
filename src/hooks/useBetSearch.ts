import { useMemo } from "react";
import { Bet } from "./useNotebook";
import { SearchFilters } from "@/components/BetSearch";
import { parseLocalDate } from "@/lib/utils";

export type SortOrder = "date-desc" | "date-asc" | "status" | "wager";

export function useBetSearch(bets: Bet[], filters: SearchFilters, sortOrder: SortOrder = "date-desc") {
  const filteredBets = useMemo(() => {
    const filtered = bets.filter((bet) => {
      // Text search filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const description = bet.description.toLowerCase();
        if (!description.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && bet.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        // Parse dates in local timezone to avoid UTC conversion issues
        const betDate = parseLocalDate(bet.date);
        const fromDate = parseLocalDate(filters.dateFrom);
        
        if (betDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        // Parse dates in local timezone to avoid UTC conversion issues
        const betDate = parseLocalDate(bet.date);
        const toDate = parseLocalDate(filters.dateTo);
        
        // Set to end of day for inclusive comparison
        toDate.setHours(23, 59, 59, 999);
        if (betDate > toDate) {
          return false;
        }
      }

      // Odds range filter
      if (filters.oddsMin !== null && bet.odds < filters.oddsMin) {
        return false;
      }

      if (filters.oddsMax !== null && bet.odds > filters.oddsMax) {
        return false;
      }

      // Wager amount range filter
      if (filters.wagerMin !== null && bet.wager_amount < filters.wagerMin) {
        return false;
      }

      if (filters.wagerMax !== null && bet.wager_amount > filters.wagerMax) {
        return false;
      }

      return true;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "date-desc":
          // Most recent first
          return b.date.localeCompare(a.date);

        case "date-asc":
          // Oldest first
          return a.date.localeCompare(b.date);

        case "status":
          // Sort by status: pending, won, lost, push
          const statusOrder = { pending: 0, won: 1, lost: 2, push: 3 };
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          // Secondary sort by date (most recent first)
          return b.date.localeCompare(a.date);

        case "wager":
          // Highest wager first
          if (b.wager_amount !== a.wager_amount) {
            return b.wager_amount - a.wager_amount;
          }
          // Secondary sort by date (most recent first)
          return b.date.localeCompare(a.date);

        default:
          return 0;
      }
    });

    return sorted;
  }, [bets, filters, sortOrder]);

  return {
    filteredBets,
    totalBets: bets.length,
    filteredCount: filteredBets.length,
  };
} 