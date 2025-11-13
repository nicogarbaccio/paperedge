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
interface ArbitrageInputs {
  totalStake: number;
  sideAOdds: string;
  sideBOdds: string;
}

interface ArbitrageResult {
  sideAStake: number;
  sideBStake: number;
  sideAReturn: number;
  sideBReturn: number;
  guaranteedProfit: number;
  profitMargin: number;
  isArbitrage: boolean;
}

interface ArbitrageValidationErrors {
  totalStake?: string;
  sideAOdds?: string;
  sideBOdds?: string;
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

function calculateArbitrage(
  sideAOdds: number,
  sideBOdds: number,
  totalStake: number
): ArbitrageResult {
  const sideADecimal = americanToDecimal(sideAOdds);
  const sideBDecimal = americanToDecimal(sideBOdds);
  
  // Calculate implied probabilities
  const sideAImplied = 1 / sideADecimal;
  const sideBImplied = 1 / sideBDecimal;
  const totalImplied = sideAImplied + sideBImplied;
  
  // Check if arbitrage opportunity exists
  const isArbitrage = totalImplied < 1;
  
  // Calculate optimal stake distribution
  const sideAStake = (sideAImplied / totalImplied) * totalStake;
  const sideBStake = (sideBImplied / totalImplied) * totalStake;
  
  // Calculate returns
  const sideAReturn = sideAStake * sideADecimal;
  const sideBReturn = sideBStake * sideBDecimal;
  
  // Calculate guaranteed profit
  const guaranteedProfit = Math.min(sideAReturn, sideBReturn) - totalStake;
  const profitMargin = (guaranteedProfit / totalStake) * 100;

  return {
    sideAStake,
    sideBStake,
    sideAReturn,
    sideBReturn,
    guaranteedProfit,
    profitMargin,
    isArbitrage,
  };
}

function validateInputs(inputs: ArbitrageInputs): ArbitrageValidationErrors {
  const errors: ArbitrageValidationErrors = {};

  if (isNaN(inputs.totalStake) || inputs.totalStake <= 0) {
    errors.totalStake = "Please enter a valid total stake";
  }

  if (!inputs.sideAOdds.trim() || parseAmericanOdds(inputs.sideAOdds) === null) {
    errors.sideAOdds = "Please enter valid odds";
  }

  if (!inputs.sideBOdds.trim() || parseAmericanOdds(inputs.sideBOdds) === null) {
    errors.sideBOdds = "Please enter valid odds";
  }

  return errors;
}

export function ArbitrageCalculator() {
  const [totalStake, setTotalStake] = useState<string>("1000");
  const [sideAOdds, setSideAOdds] = useState<string>("");
  const [sideBOdds, setSideBOdds] = useState<string>("");
  const [result, setResult] = useState<ArbitrageResult | null>(null);
  const [errors, setErrors] = useState<ArbitrageValidationErrors>({});

  // Calculate results in real-time
  useEffect(() => {
    const inputs: ArbitrageInputs = {
      totalStake: parseFloat(totalStake) || 0,
      sideAOdds: sideAOdds.trim(),
      sideBOdds: sideBOdds.trim(),
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    // Calculate if no errors
    if (Object.keys(validationErrors).length === 0) {
      const sideAParsed = parseAmericanOdds(inputs.sideAOdds);
      const sideBParsed = parseAmericanOdds(inputs.sideBOdds);

      if (sideAParsed !== null && sideBParsed !== null && inputs.totalStake > 0) {
        const arbResult = calculateArbitrage(sideAParsed, sideBParsed, inputs.totalStake);
        setResult(arbResult);
      }
    } else {
      setResult(null);
    }
  }, [totalStake, sideAOdds, sideBOdds]);

  const handleClear = () => {
    setTotalStake("1000");
    setSideAOdds("");
    setSideBOdds("");
    setResult(null);
    setErrors({});
  };

  const copyResult = () => {
    if (result) {
      const text = `Arbitrage Calculator Results:
Total Stake: $${parseFloat(totalStake).toFixed(2)}

Side A Bet: $${result.sideAStake.toFixed(2)} at ${sideAOdds}
Side B Bet: $${result.sideBStake.toFixed(2)} at ${sideBOdds}

Returns:
Side A Win: $${result.sideAReturn.toFixed(2)}
Side B Win: $${result.sideBReturn.toFixed(2)}

Guaranteed Profit: $${result.guaranteedProfit.toFixed(2)}
Profit Margin: ${result.profitMargin.toFixed(2)}%
${result.isArbitrage ? "✅ Arbitrage Opportunity" : "❌ No Arbitrage"}`;

      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Arbitrage Calculator
        </CardTitle>
        <CardDescription>
          Find opportunities to bet on all outcomes of an event across different sportsbooks to guarantee a profit regardless of the result
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explanation */}
        <div className="text-sm text-text-secondary bg-surface-secondary p-3 rounded-lg border border-border">
          <strong>Arbitrage:</strong> Find opportunities to bet on all outcomes of an event
          across different sportsbooks to guarantee a profit regardless of the result.
        </div>

        {/* Total Stake */}
        <div className="space-y-2">
          <Label htmlFor="total-stake">Total Amount to Bet:</Label>
          <div className="relative max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-lg">$</span>
            </div>
            <Input
              id="total-stake"
              type="number"
              value={totalStake}
              onChange={(e) => setTotalStake(e.target.value)}
              placeholder="1000.00"
              className={cn(
                "text-lg font-medium pl-8",
                errors.totalStake && "border-loss focus-visible:ring-loss"
              )}
              min="0"
              step="0.01"
              data-testid="arb-total-stake"
            />
          </div>
          {errors.totalStake && (
            <p className="text-sm text-loss">{errors.totalStake}</p>
          )}
        </div>

        {/* Odds Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="side-a-odds">Side A Odds:</Label>
            <Input
              id="side-a-odds"
              type="text"
              value={sideAOdds}
              onChange={(e) => setSideAOdds(e.target.value)}
              placeholder="e.g., +150, -110"
              className={cn(
                "text-lg font-mono",
                errors.sideAOdds && "border-loss focus-visible:ring-loss"
              )}
              data-testid="arb-side-a-odds"
            />
            {errors.sideAOdds && (
              <p className="text-sm text-loss">{errors.sideAOdds}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="side-b-odds">Side B Odds:</Label>
            <Input
              id="side-b-odds"
              type="text"
              value={sideBOdds}
              onChange={(e) => setSideBOdds(e.target.value)}
              placeholder="e.g., +150, -110"
              className={cn(
                "text-lg font-mono",
                errors.sideBOdds && "border-loss focus-visible:ring-loss"
              )}
              data-testid="arb-side-b-odds"
            />
            {errors.sideBOdds && (
              <p className="text-sm text-loss">{errors.sideBOdds}</p>
            )}
          </div>
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
                    result.isArbitrage
                      ? "bg-profit/10 text-profit border border-profit"
                      : "bg-loss/10 text-loss border border-loss"
                  )}>
                    {result.isArbitrage ? "✅ Arbitrage Opportunity" : "❌ No Arbitrage"}
                  </div>
                </div>

                {/* Main Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">Side A Bet</Label>
                    <div className="text-xl font-bold text-text-primary">
                      ${result.sideAStake.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Side B Bet</Label>
                    <div className="text-xl font-bold text-text-primary">
                      ${result.sideBStake.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Guaranteed Profit</Label>
                    <div className={cn(
                      "text-xl font-bold",
                      result.guaranteedProfit > 0 ? "text-profit" : "text-loss"
                    )}>
                      ${result.guaranteedProfit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Profit Margin</Label>
                    <div className={cn(
                      "text-xl font-bold",
                      result.profitMargin > 0 ? "text-profit" : "text-loss"
                    )}>
                      {result.profitMargin.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Detailed Returns */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Potential Returns:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">Side A wins:</span>
                      <span className="font-mono text-profit">
                        ${result.sideAReturn.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">Side B wins:</span>
                      <span className="font-mono text-profit">
                        ${result.sideBReturn.toFixed(2)}
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