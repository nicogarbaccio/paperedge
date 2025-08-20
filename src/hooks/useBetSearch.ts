import { useMemo } from "react";
import { Bet } from "./useNotebook";
import { SearchFilters } from "@/components/BetSearch";
import { parseLocalDate } from "@/lib/utils";

export function useBetSearch(bets: Bet[], filters: SearchFilters) {
  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
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
  }, [bets, filters]);

  return {
    filteredBets,
    totalBets: bets.length,
    filteredCount: filteredBets.length,
  };
} 