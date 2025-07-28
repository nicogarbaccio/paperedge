import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  americanToDecimal,
  getImpliedProbability,
  isValidAmericanOdds,
  formatOdds,
} from "@/lib/betting";
import { ParlayLeg, ParlayResult, ParlayValidationErrors } from "./types";

// Utility functions
function parseAmericanOdds(oddsString: string): number | null {
  const trimmed = oddsString.trim();

  // Handle positive odds with explicit + sign
  if (trimmed.startsWith("+")) {
    const num = parseInt(trimmed.substring(1));
    return !isNaN(num) && num > 0 ? num : null;
  }

  // Handle negative odds
  if (trimmed.startsWith("-")) {
    const num = parseInt(trimmed.substring(1));
    return !isNaN(num) && num > 0 ? -num : null;
  }

  // Handle odds without sign (treat as positive)
  const num = parseInt(trimmed);
  return !isNaN(num) && num > 0 ? num : null;
}

function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
}

function calculateParlayOdds(legs: ParlayLeg[]): ParlayResult | null {
  // Validate all legs have valid odds
  const validLegs = legs.filter((leg) => leg.odds.trim() !== "");
  if (validLegs.length < 2) return null;

  const decimalOdds: number[] = [];
  const individualProbabilities: number[] = [];

  for (const leg of validLegs) {
    const americanOdds = parseAmericanOdds(leg.odds);
    if (americanOdds === null || !isValidAmericanOdds(americanOdds)) {
      return null;
    }

    const decimal = americanToDecimal(americanOdds);
    decimalOdds.push(decimal);
    individualProbabilities.push(getImpliedProbability(americanOdds));
  }

  // Calculate combined odds
  const combinedDecimalOdds = decimalOdds.reduce((acc, odds) => acc * odds, 1);
  const combinedAmericanOdds = decimalToAmerican(combinedDecimalOdds);
  const overallProbability = (1 / combinedDecimalOdds) * 100;

  return {
    combinedDecimalOdds,
    combinedAmericanOdds,
    totalPayout: 0, // Will be calculated with wager amount
    profit: 0, // Will be calculated with wager amount
    overallProbability,
    individualProbabilities,
  };
}

export function ParlayCalculator() {
  const [wager, setWager] = useState<string>("100");
  const [legs, setLegs] = useState<ParlayLeg[]>([
    { id: "1", description: "", odds: "" },
    { id: "2", description: "", odds: "" },
  ]);
  const [result, setResult] = useState<ParlayResult | null>(null);
  const [errors, setErrors] = useState<ParlayValidationErrors>({});

  // Calculate parlay results in real-time
  useEffect(() => {
    const wagerAmount = parseFloat(wager) || 0;
    const parlayResult = calculateParlayOdds(legs);

    // Validation
    const newErrors: ParlayValidationErrors = {};

    if (wagerAmount <= 0) {
      newErrors.wager = "Please enter a valid wager amount";
    }

    const validLegs = legs.filter((leg) => leg.odds.trim() !== "").length;
    if (validLegs < 2) {
      newErrors.legs = "Please enter odds for at least 2 legs";
    }

    // Check for invalid odds
    const hasInvalidOdds = legs.some((leg) => {
      if (leg.odds.trim() === "") return false;
      const americanOdds = parseAmericanOdds(leg.odds);
      return americanOdds === null || !isValidAmericanOdds(americanOdds);
    });

    if (hasInvalidOdds) {
      newErrors.legs = "Please enter valid American odds for all legs";
    }

    setErrors(newErrors);

    // Set result if everything is valid
    if (
      Object.keys(newErrors).length === 0 &&
      parlayResult &&
      wagerAmount > 0
    ) {
      const totalPayout = wagerAmount * parlayResult.combinedDecimalOdds;
      const profit = totalPayout - wagerAmount;

      setResult({
        ...parlayResult,
        totalPayout,
        profit,
      });
    } else {
      setResult(null);
    }
  }, [wager, legs]);

  const addLeg = () => {
    if (legs.length < 10) {
      const newId = (
        Math.max(...legs.map((leg) => parseInt(leg.id))) + 1
      ).toString();
      setLegs([...legs, { id: newId, description: "", odds: "" }]);
    }
  };

  const removeLeg = (id: string) => {
    if (legs.length > 2) {
      setLegs(legs.filter((leg) => leg.id !== id));
    }
  };

  const updateLeg = (id: string, field: keyof ParlayLeg, value: string) => {
    setLegs(
      legs.map((leg) => (leg.id === id ? { ...leg, [field]: value } : leg))
    );
  };

  const handleClear = () => {
    setWager("100");
    setLegs([
      { id: "1", description: "", odds: "" },
      { id: "2", description: "", odds: "" },
    ]);
    setResult(null);
    setErrors({});
  };

  const copyResult = () => {
    if (result) {
      const legsList = legs
        .filter((leg) => leg.odds.trim() !== "")
        .map((leg) => `• ${leg.description || "Leg"}: ${leg.odds}`)
        .join("\n");

      const text = `Parlay Bet: $${parseFloat(wager).toFixed(
        2
      )}\n\nLegs:\n${legsList}\n\nCombined Odds: ${formatOdds(
        result.combinedAmericanOdds
      )}\nPotential Payout: $${result.totalPayout.toFixed(
        2
      )}\nProfit: $${result.profit.toFixed(
        2
      )}\nWin Probability: ${result.overallProbability.toFixed(1)}%`;

      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Parlay Calculator</CardTitle>
        <CardDescription>
          Combine multiple bets into one parlay and calculate the combined odds,
          potential payout, and win probability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Error Messages */}
        {(errors.general || errors.legs) && (
          <div className="p-3 rounded-md bg-loss/10 border border-loss text-loss text-sm">
            {errors.general || errors.legs}
          </div>
        )}

        {/* Wager Amount */}
        <div className="space-y-2">
          <Label htmlFor="wager">Wager Amount:</Label>
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-lg">$</span>
            </div>
            <Input
              id="wager"
              type="number"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              placeholder="100.00"
              className={cn(
                "text-lg font-medium pl-8",
                errors.wager && "border-loss focus-visible:ring-loss"
              )}
              min="0"
              step="0.01"
            />
          </div>
          {errors.wager && <p className="text-sm text-loss">{errors.wager}</p>}
        </div>

        {/* Parlay Legs */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Parlay Legs:</Label>

          <div className="space-y-3">
            {legs.map((leg, index) => (
              <Card key={leg.id} className="bg-surface-secondary border-border">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 text-sm font-medium text-text-secondary">
                      Leg {index + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Bet description (optional)"
                        value={leg.description}
                        onChange={(e) =>
                          updateLeg(leg.id, "description", e.target.value)
                        }
                        className="text-sm"
                      />
                      <Input
                        placeholder="Odds (e.g., -110, +150)"
                        value={leg.odds}
                        onChange={(e) =>
                          updateLeg(leg.id, "odds", e.target.value)
                        }
                        className="text-sm font-mono"
                      />
                    </div>

                    {legs.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLeg(leg.id)}
                        className="flex-shrink-0 h-9 w-9 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Leg Button */}
          {legs.length < 10 && (
            <Button
              variant="outline"
              onClick={addLeg}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Leg
            </Button>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <Card className="bg-surface-secondary border-border">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Main Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Combined Odds
                    </Label>
                    <div className="text-xl font-bold text-accent">
                      {formatOdds(result.combinedAmericanOdds)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Potential Payout
                    </Label>
                    <div className="text-xl font-bold text-text-primary">
                      ${result.totalPayout.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Profit
                    </Label>
                    <div className="text-xl font-bold text-profit">
                      ${result.profit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Win Probability
                    </Label>
                    <div className="text-xl font-bold text-text-primary">
                      {result.overallProbability.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Individual Probabilities */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Individual Leg Probabilities:
                  </Label>
                  <div className="space-y-1">
                    {legs
                      .filter((leg) => leg.odds.trim() !== "")
                      .map((leg, index) => (
                        <div
                          key={leg.id}
                          className="flex justify-between items-center text-sm py-1"
                        >
                          <span className="text-text-primary">
                            {leg.description || `Leg ${index + 1}`}: {leg.odds}
                          </span>
                          <span className="text-text-secondary font-mono">
                            {result.individualProbabilities[index]?.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center">
                  <Button onClick={copyResult} variant="outline" size="sm">
                    Copy Result
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clear Button */}
        <div className="flex justify-center">
          <Button onClick={handleClear} variant="outline" className="px-8">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
