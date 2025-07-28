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
import { ArbitrageInputs, ArbitrageResult, ArbitrageValidationErrors } from "./types";

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

function calculateHedge(
  originalBet: number,
  originalOdds: number,
  hedgeOdds: number
): ArbitrageResult {
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
    sideAStake: originalBet,
    sideBStake: hedgeStake,
    sideAReturn: originalWinReturn,
    sideBReturn: hedgeWinReturn,
    guaranteedProfit: guaranteedWin,
    profitMargin: (guaranteedWin / totalInvested) * 100,
    isArbitrage: guaranteedWin > 0,
    hedgeResult: {
      hedgeStake,
      guaranteedWin,
      maxPossibleWin,
    },
  };
}

function validateInputs(
  inputs: ArbitrageInputs,
  mode: 'arbitrage' | 'hedge'
): ArbitrageValidationErrors {
  const errors: ArbitrageValidationErrors = {};

  if (mode === 'arbitrage') {
    if (isNaN(inputs.totalStake) || inputs.totalStake <= 0) {
      errors.totalStake = "Please enter a valid total stake";
    }
  } else {
    if (!inputs.originalBet || isNaN(inputs.originalBet) || inputs.originalBet <= 0) {
      errors.originalBet = "Please enter a valid original bet amount";
    }
    if (!inputs.originalOdds || parseAmericanOdds(inputs.originalOdds) === null) {
      errors.originalOdds = "Please enter valid original odds";
    }
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
  const [mode, setMode] = useState<'arbitrage' | 'hedge'>('arbitrage');
  const [totalStake, setTotalStake] = useState<string>("1000");
  const [originalBet, setOriginalBet] = useState<string>("100");
  const [originalOdds, setOriginalOdds] = useState<string>("");
  const [sideAOdds, setSideAOdds] = useState<string>("");
  const [sideBOdds, setSideBOdds] = useState<string>("");
  const [result, setResult] = useState<ArbitrageResult | null>(null);
  const [errors, setErrors] = useState<ArbitrageValidationErrors>({});

  // Calculate results in real-time
  useEffect(() => {
    const inputs: ArbitrageInputs = {
      totalStake: parseFloat(totalStake) || 0,
      originalBet: parseFloat(originalBet) || 0,
      originalOdds: originalOdds.trim(),
      sideAOdds: sideAOdds.trim(),
      sideBOdds: sideBOdds.trim(),
      mode,
    };

    const validationErrors = validateInputs(inputs, mode);
    setErrors(validationErrors);

    // Calculate if no errors
    if (Object.keys(validationErrors).length === 0) {
      const sideAParsed = parseAmericanOdds(inputs.sideAOdds);
      const sideBParsed = parseAmericanOdds(inputs.sideBOdds);

      if (sideAParsed !== null && sideBParsed !== null) {
        if (mode === 'arbitrage' && inputs.totalStake > 0) {
          const arbResult = calculateArbitrage(sideAParsed, sideBParsed, inputs.totalStake);
          setResult(arbResult);
        } else if (mode === 'hedge' && inputs.originalBet && inputs.originalOdds) {
          const originalParsed = parseAmericanOdds(inputs.originalOdds);
          if (originalParsed !== null) {
            const hedgeResult = calculateHedge(inputs.originalBet, originalParsed, sideBParsed);
            setResult(hedgeResult);
          }
        }
      }
    } else {
      setResult(null);
    }
  }, [mode, totalStake, originalBet, originalOdds, sideAOdds, sideBOdds]);

  const handleClear = () => {
    setTotalStake("1000");
    setOriginalBet("100");
    setOriginalOdds("");
    setSideAOdds("");
    setSideBOdds("");
    setResult(null);
    setErrors({});
  };

  const copyResult = () => {
    if (result) {
      if (mode === 'arbitrage') {
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
      } else if (result.hedgeResult) {
        const text = `Hedge Calculator Results:
Original Bet: $${originalBet} at ${originalOdds}
Hedge Bet: $${result.hedgeResult.hedgeStake.toFixed(2)} at ${sideBOdds}

Guaranteed Win: $${result.hedgeResult.guaranteedWin.toFixed(2)}
Max Possible Win: $${result.hedgeResult.maxPossibleWin.toFixed(2)}`;

        navigator.clipboard.writeText(text);
      }
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Arbitrage/Hedge Calculator
        </CardTitle>
        <CardDescription>
          Calculate arbitrage opportunities or hedge existing bets to guarantee profits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2 p-4 bg-surface rounded-lg border border-border">
          <button
            onClick={() => setMode('arbitrage')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              mode === 'arbitrage'
                ? "bg-accent text-accent-foreground"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary"
            )}
          >
            <div className="text-left">
              <div className="font-semibold">Arbitrage</div>
              <div className="text-xs opacity-75">Find profitable opportunities</div>
            </div>
          </button>
          <button
            onClick={() => setMode('hedge')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              mode === 'hedge'
                ? "bg-accent text-accent-foreground"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary"
            )}
          >
            <div className="text-left">
              <div className="font-semibold">Hedge</div>
              <div className="text-xs opacity-75">Secure profits from existing bets</div>
            </div>
          </button>
        </div>

        {/* Mode-specific Content */}
        {mode === 'arbitrage' && (
          <div className="space-y-4">
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
                />
              </div>
              {errors.totalStake && (
                <p className="text-sm text-loss">{errors.totalStake}</p>
              )}
            </div>
          </div>
        )}

        {mode === 'hedge' && (
          <div className="space-y-4">
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
                />
                {errors.originalOdds && (
                  <p className="text-sm text-loss">{errors.originalOdds}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Odds Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="side-a-odds">
              {mode === 'arbitrage' ? 'Side A Odds:' : 'Original Side Odds:'}
            </Label>
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
            />
            {errors.sideAOdds && (
              <p className="text-sm text-loss">{errors.sideAOdds}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="side-b-odds">
              {mode === 'arbitrage' ? 'Side B Odds:' : 'Hedge Odds:'}
            </Label>
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
                    {result.isArbitrage ? "✅ Profitable Opportunity" : "❌ No Arbitrage/Hedge"}
                  </div>
                </div>

                {/* Main Results */}
                {mode === 'arbitrage' ? (
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
                ) : result.hedgeResult && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <Label className="text-sm text-text-secondary">Hedge Bet Amount</Label>
                      <div className="text-xl font-bold text-text-primary">
                        ${result.hedgeResult.hedgeStake.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-text-secondary">Guaranteed Win</Label>
                      <div className={cn(
                        "text-xl font-bold",
                        result.hedgeResult.guaranteedWin > 0 ? "text-profit" : "text-loss"
                      )}>
                        ${result.hedgeResult.guaranteedWin.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-text-secondary">Max Possible Win</Label>
                      <div className="text-xl font-bold text-profit">
                        ${result.hedgeResult.maxPossibleWin.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Returns */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Potential Returns:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">
                        {mode === 'arbitrage' ? 'Side A wins:' : 'Original bet wins:'}
                      </span>
                      <span className="font-mono text-profit">
                        ${result.sideAReturn.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-surface rounded border border-border">
                      <span className="text-text-primary">
                        {mode === 'arbitrage' ? 'Side B wins:' : 'Hedge bet wins:'}
                      </span>
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