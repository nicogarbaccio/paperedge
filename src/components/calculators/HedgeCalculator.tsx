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
import { cn } from "@/lib/utils";

// Types
interface HedgeInputs {
  originalBet: number;
  originalOdds: string;
  hedgeOdds: string;
}

interface HedgeResult {
  hedgeStake: number;
  originalReturn: number;
  hedgeReturn: number;
  guaranteedWin: number;
  maxPossibleWin: number;
  profitMargin: number;
  isProfitable: boolean;
}

interface HedgeValidationErrors {
  originalBet?: string;
  originalOdds?: string;
  hedgeOdds?: string;
}

// Utility functions for odds conversion
function parseAmericanOdds(oddsString: string): number | null {
  const trimmed = oddsString.trim();

  if (trimmed.startsWith("+")) {
    const num = parseInt(trimmed.substring(1));
    return !isNaN(num) && num > 0 ? num : null;
  }

  if (trimmed.startsWith("-")) {
    const num = parseInt(trimmed.substring(1));
    return !isNaN(num) && num > 0 ? -num : null;
  }

  const num = parseInt(trimmed);
  return !isNaN(num) && num > 0 ? num : null;
}

function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  } else {
    return 100 / Math.abs(americanOdds) + 1;
  }
}

function calculateHedge(
  originalBet: number,
  originalOdds: number,
  hedgeOdds: number
): HedgeResult {
  const originalDecimal = americanToDecimal(originalOdds);
  const hedgeDecimal = americanToDecimal(hedgeOdds);

  // Calculate potential return from original bet
  const originalReturn = originalBet * originalDecimal;

  // Calculate hedge stake needed to guarantee same profit regardless of outcome
  const hedgeStake = (originalReturn - originalBet) / (hedgeDecimal - 1);

  // Calculate returns for both scenarios
  const originalWinReturn = originalReturn;
  const hedgeWinReturn = hedgeStake * hedgeDecimal;

  // Calculate guaranteed profit (what we get minus total invested)
  const totalInvested = originalBet + hedgeStake;
  const guaranteedWin = Math.min(originalWinReturn, hedgeWinReturn) - totalInvested;
  const maxPossibleWin = Math.max(originalWinReturn - hedgeStake, hedgeWinReturn - originalBet);

  return {
    hedgeStake,
    originalReturn: originalWinReturn,
    hedgeReturn: hedgeWinReturn,
    guaranteedWin,
    maxPossibleWin,
    profitMargin: (guaranteedWin / totalInvested) * 100,
    isProfitable: guaranteedWin > 0,
  };
}

function validateInputs(inputs: HedgeInputs): HedgeValidationErrors {
  const errors: HedgeValidationErrors = {};

  if (!inputs.originalBet || isNaN(inputs.originalBet) || inputs.originalBet <= 0) {
    errors.originalBet = "Please enter a valid original bet amount";
  }
  if (!inputs.originalOdds || parseAmericanOdds(inputs.originalOdds) === null) {
    errors.originalOdds = "Please enter valid original odds";
  }
  if (!inputs.hedgeOdds.trim() || parseAmericanOdds(inputs.hedgeOdds) === null) {
    errors.hedgeOdds = "Please enter valid hedge odds";
  }

  return errors;
}

export function HedgeCalculator() {
  const [originalBet, setOriginalBet] = useState<string>("100");
  const [originalOdds, setOriginalOdds] = useState<string>("");
  const [hedgeOdds, setHedgeOdds] = useState<string>("");
  const [result, setResult] = useState<HedgeResult | null>(null);
  const [errors, setErrors] = useState<HedgeValidationErrors>({});

  // Calculate results in real-time
  useEffect(() => {
    const inputs: HedgeInputs = {
      originalBet: parseFloat(originalBet) || 0,
      originalOdds: originalOdds.trim(),
      hedgeOdds: hedgeOdds.trim(),
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    // Calculate if no errors
    if (Object.keys(validationErrors).length === 0) {
      const originalParsed = parseAmericanOdds(inputs.originalOdds);
      const hedgeParsed = parseAmericanOdds(inputs.hedgeOdds);

      if (originalParsed !== null && hedgeParsed !== null && inputs.originalBet > 0) {
        const hedgeResult = calculateHedge(inputs.originalBet, originalParsed, hedgeParsed);
        setResult(hedgeResult);
      }
    } else {
      setResult(null);
    }
  }, [originalBet, originalOdds, hedgeOdds]);

  const handleClear = () => {
    setOriginalBet("100");
    setOriginalOdds("");
    setHedgeOdds("");
    setResult(null);
    setErrors({});
  };

  const copyResult = () => {
    if (result) {
      const text = `Hedge Calculator Results:
Original Bet: $${originalBet} at ${originalOdds}
Hedge Bet: $${result.hedgeStake.toFixed(2)} at ${hedgeOdds}

Guaranteed Win: $${result.guaranteedWin.toFixed(2)}
Max Possible Win: $${result.maxPossibleWin.toFixed(2)}`;

      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Hedge Calculator
        </CardTitle>
        <CardDescription>
          Calculate how much to bet on the opposite outcome to guarantee a profit or minimize losses from your original bet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explanation */}
        <div className="text-sm text-text-secondary bg-surface-secondary p-3 rounded-lg border border-border">
          <strong>Hedge:</strong> Calculate how much to bet on the opposite outcome
          to guarantee a profit or minimize losses from your original bet.
        </div>

        {/* Original Bet Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="original-bet">Original Bet Amount:</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-text-secondary text-lg">$</span>
              </div>
              <Input
                id="original-bet"
                type="number"
                value={originalBet}
                onChange={(e) => setOriginalBet(e.target.value)}
                placeholder="100.00"
                className={cn(
                  "text-lg font-medium pl-8",
                  errors.originalBet && "border-loss focus-visible:ring-loss"
                )}
                min="0"
                step="0.01"
                data-testid="hedge-original-bet"
              />
            </div>
            {errors.originalBet && (
              <p className="text-sm text-loss">{errors.originalBet}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="original-odds">Original Odds:</Label>
            <Input
              id="original-odds"
              type="text"
              value={originalOdds}
              onChange={(e) => setOriginalOdds(e.target.value)}
              placeholder="e.g., +150, -110"
              className={cn(
                "text-lg font-mono",
                errors.originalOdds && "border-loss focus-visible:ring-loss"
              )}
              data-testid="hedge-original-odds"
            />
            {errors.originalOdds && (
              <p className="text-sm text-loss">{errors.originalOdds}</p>
            )}
          </div>
        </div>

        {/* Hedge Odds Input */}
        <div className="space-y-2">
          <Label htmlFor="hedge-odds">Hedge Odds:</Label>
          <Input
            id="hedge-odds"
            type="text"
            value={hedgeOdds}
            onChange={(e) => setHedgeOdds(e.target.value)}
            placeholder="e.g., +150, -110"
            className={cn(
              "text-lg font-mono",
              errors.hedgeOdds && "border-loss focus-visible:ring-loss"
            )}
            data-testid="hedge-odds"
          />
          {errors.hedgeOdds && (
            <p className="text-sm text-loss">{errors.hedgeOdds}</p>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <Card className="bg-surface-secondary border-border">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Status Indicator */}
                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    result.isProfitable
                      ? "bg-profit/10 text-profit border border-profit"
                      : "bg-loss/10 text-loss border border-loss"
                  )}>
                    {result.isProfitable ? "✅ Profitable Hedge" : "⚠️ Negative Hedge"}
                  </div>
                </div>

                {/* Main Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">Hedge Bet Amount</Label>
                    <div className="text-xl font-bold text-text-primary">
                      ${result.hedgeStake.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Guaranteed Win</Label>
                    <div className={cn(
                      "text-xl font-bold",
                      result.guaranteedWin > 0 ? "text-profit" : "text-loss"
                    )}>
                      ${result.guaranteedWin.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Max Possible Win</Label>
                    <div className="text-xl font-bold text-profit">
                      ${result.maxPossibleWin.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Detailed Returns */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Potential Returns:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">Original bet wins:</span>
                      <span className="font-mono text-profit">
                        ${result.originalReturn.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">Hedge bet wins:</span>
                      <span className="font-mono text-profit">
                        ${result.hedgeReturn.toFixed(2)}
                      </span>
                    </div>
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
