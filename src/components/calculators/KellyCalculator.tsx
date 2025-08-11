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
import { KellyInputs, KellyResult, KellyValidationErrors } from "./types";

// Utility functions for Kelly Criterion calculations
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

function decimalToImpliedProbability(decimal: number): number {
  return 1 / decimal;
}

function calculateKelly(winProb: number, decimalOdds: number): number {
  const b = decimalOdds - 1; // Net odds received
  const p = winProb; // Probability of winning
  const q = 1 - p; // Probability of losing

  return (b * p - q) / b;
}

function calculateExpectedValue(
  betAmount: number,
  winProb: number,
  decimalOdds: number
): number {
  const winAmount = betAmount * (decimalOdds - 1);
  const loseAmount = -betAmount;

  return winProb * winAmount + (1 - winProb) * loseAmount;
}

function calculateKellyResult(inputs: KellyInputs): KellyResult | null {
  const bettingOdds = parseAmericanOdds(inputs.bettingBookOdds);
  const sharpOdds = parseAmericanOdds(inputs.sharpBookOdds);

  if (bettingOdds === null || sharpOdds === null) {
    return null;
  }

  const bettingDecimal = americanToDecimal(bettingOdds);
  const sharpDecimal = americanToDecimal(sharpOdds);

  const bettingBookImpliedProb = decimalToImpliedProbability(bettingDecimal);
  const sharpBookImpliedProb = decimalToImpliedProbability(sharpDecimal);

  // Calculate edge (sharp book probability represents the "true" probability)
  const edge = sharpBookImpliedProb - bettingBookImpliedProb;

  // Calculate Kelly percentage
  const kellyPercentage = calculateKelly(sharpBookImpliedProb, bettingDecimal);

  // Apply Kelly fraction (e.g., 25% of full Kelly)
  const adjustedKellyPercentage = kellyPercentage * inputs.kellyFraction;

  // Calculate recommended bet amount
  const recommendedBetAmount = Math.max(
    0,
    adjustedKellyPercentage * inputs.bankroll
  );

  // Apply maximum bet percentage cap
  const maxBetAmount = (inputs.maxBetPercentage / 100) * inputs.bankroll;
  const finalBetAmount = Math.min(recommendedBetAmount, maxBetAmount);

  // Calculate expected value
  const expectedValue = calculateExpectedValue(
    finalBetAmount,
    sharpBookImpliedProb,
    bettingDecimal
  );

  return {
    bettingBookImpliedProb: bettingBookImpliedProb * 100,
    sharpBookImpliedProb: sharpBookImpliedProb * 100,
    edge: edge * 100,
    kellyPercentage: kellyPercentage * 100,
    recommendedBetAmount,
    finalBetAmount,
    expectedValue,
    isPositiveEdge: edge > 0,
    maxBetReached:
      finalBetAmount === maxBetAmount && recommendedBetAmount > maxBetAmount,
  };
}

function validateInputs(inputs: KellyInputs): KellyValidationErrors {
  const errors: KellyValidationErrors = {};

  // Count empty fields
  const emptyFields = [
    !inputs.bettingBookLine.trim(),
    !inputs.bettingBookOdds.trim(),
    !inputs.sharpBookLine.trim(),
    !inputs.sharpBookOdds.trim(),
    inputs.bankroll <= 0 || isNaN(inputs.bankroll),
  ].filter(Boolean).length;

  if (emptyFields >= 1) {
    errors.general = "Please fill in all required fields";
    return errors;
  }

  // Validate betting book odds
  if (
    inputs.bettingBookOdds.trim() &&
    parseAmericanOdds(inputs.bettingBookOdds) === null
  ) {
    errors.bettingBookOdds =
      "Please enter valid American odds (e.g., +100, -110)";
  }

  // Validate sharp book odds
  if (
    inputs.sharpBookOdds.trim() &&
    parseAmericanOdds(inputs.sharpBookOdds) === null
  ) {
    errors.sharpBookOdds =
      "Please enter valid American odds (e.g., +100, -110)";
  }

  // Validate bankroll
  if (isNaN(inputs.bankroll) || inputs.bankroll <= 0) {
    errors.bankroll = "Please enter a valid positive bankroll amount";
  }

  // Validate max bet percentage
  if (
    isNaN(inputs.maxBetPercentage) ||
    inputs.maxBetPercentage <= 0 ||
    inputs.maxBetPercentage > 100
  ) {
    errors.maxBetPercentage =
      "Please enter a valid percentage between 0.1% and 100%";
  }

  // Validate Kelly fraction
  if (
    isNaN(inputs.kellyFraction) ||
    inputs.kellyFraction <= 0 ||
    inputs.kellyFraction > 1
  ) {
    errors.kellyFraction = "Please enter a valid fraction between 0.1 and 1.0";
  }

  return errors;
}

export function KellyCalculator() {
  const [bettingBookLine, setBettingBookLine] = useState<string>("");
  const [bettingBookOdds, setBettingBookOdds] = useState<string>("");
  const [sharpBookLine, setSharpBookLine] = useState<string>("");
  const [sharpBookOdds, setSharpBookOdds] = useState<string>("");
  const [bankroll, setBankroll] = useState<string>("1000");
  const [maxBetPercentage, setMaxBetPercentage] = useState<string>("5");
  const [kellyFraction, setKellyFraction] = useState<string>("0.25");
  const [result, setResult] = useState<KellyResult | null>(null);
  const [errors, setErrors] = useState<KellyValidationErrors>({});

  // Kelly fraction presets
  const kellyPresets = [
    { label: "Conservative (25%)", value: 0.25 },
    { label: "Moderate (50%)", value: 0.5 },
    { label: "Aggressive (75%)", value: 0.75 },
    { label: "Full Kelly (100%)", value: 1.0 },
  ];

  // Calculate results in real-time
  useEffect(() => {
    const inputs: KellyInputs = {
      bettingBookLine: bettingBookLine.trim(),
      bettingBookOdds: bettingBookOdds.trim(),
      sharpBookLine: sharpBookLine.trim(),
      sharpBookOdds: sharpBookOdds.trim(),
      bankroll: parseFloat(bankroll) || 0,
      maxBetPercentage: parseFloat(maxBetPercentage) || 5,
      kellyFraction: parseFloat(kellyFraction) || 0.25,
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    // Calculate if no errors
    if (Object.keys(validationErrors).length === 0) {
      const kellyResult = calculateKellyResult(inputs);
      setResult(kellyResult);
    } else {
      setResult(null);
    }
  }, [
    bettingBookLine,
    bettingBookOdds,
    sharpBookLine,
    sharpBookOdds,
    bankroll,
    maxBetPercentage,
    kellyFraction,
  ]);

  const handleClear = () => {
    setBettingBookLine("");
    setBettingBookOdds("");
    setSharpBookLine("");
    setSharpBookOdds("");
    setBankroll("1000");
    setMaxBetPercentage("5");
    setKellyFraction("0.25");
    setResult(null);
    setErrors({});
  };

  const copyResult = () => {
    if (result) {
      const text = `Kelly Criterion Calculator Results:

Betting Book: ${bettingBookLine} at ${bettingBookOdds}
Sharp Book: ${sharpBookLine} at ${sharpBookOdds}

Analysis:
Betting Book Implied Probability: ${result.bettingBookImpliedProb.toFixed(2)}%
Sharp Book Implied Probability: ${result.sharpBookImpliedProb.toFixed(2)}%
Edge: ${result.edge.toFixed(2)}%

Kelly Recommendation:
Kelly Percentage: ${result.kellyPercentage.toFixed(2)}%
Recommended Bet: $${result.finalBetAmount.toFixed(2)}
Expected Value: $${result.expectedValue.toFixed(2)}

${
  result.isPositiveEdge
    ? "✅ Positive Edge - Bet Recommended"
    : "❌ Negative Edge - No Bet Recommended"
}
${result.maxBetReached ? "⚠️ Bet capped at maximum percentage" : ""}`;

      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Kelly Criterion Calculator
        </CardTitle>
        <CardDescription>
          Calculate optimal bet sizing based on line discrepancies between your
          betting book and sharp reference books
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div className="p-3 rounded-md bg-loss/10 border border-loss text-loss text-sm">
            {errors.general}
          </div>
        )}

        {/* How Kelly Works Explanation */}
        <div className="text-sm text-text-secondary bg-surface-secondary p-4 rounded-lg border border-border">
          <strong>How it works:</strong> The Kelly Criterion helps determine
          optimal bet sizing by comparing the implied probability from your
          betting book against sharp reference books. When there's a positive
          edge (sharp book probability {">"} betting book probability), Kelly
          recommends a bet size proportional to your edge and bankroll.
        </div>

        {/* Betting Book Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Betting Book
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="betting-line">Line/Market:</Label>
              <Input
                id="betting-line"
                type="text"
                value={bettingBookLine}
                onChange={(e) => setBettingBookLine(e.target.value)}
                placeholder="e.g., Under 19.5 total points"
                className={cn(
                  "text-base",
                  errors.bettingBookLine &&
                    "border-loss focus-visible:ring-loss"
                )}
              />
              {errors.bettingBookLine && (
                <p className="text-sm text-loss">{errors.bettingBookLine}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="betting-odds">Odds:</Label>
              <Input
                id="betting-odds"
                type="text"
                value={bettingBookOdds}
                onChange={(e) => setBettingBookOdds(e.target.value)}
                placeholder="e.g., +100, -110"
                className={cn(
                  "text-base font-mono",
                  errors.bettingBookOdds &&
                    "border-loss focus-visible:ring-loss"
                )}
              />
              {errors.bettingBookOdds && (
                <p className="text-sm text-loss">{errors.bettingBookOdds}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sharp Reference Book Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Sharp Reference Book
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sharp-line">Comparable Line/Market:</Label>
              <Input
                id="sharp-line"
                type="text"
                value={sharpBookLine}
                onChange={(e) => setSharpBookLine(e.target.value)}
                placeholder="e.g., Under 17.5 total points"
                className={cn(
                  "text-base",
                  errors.sharpBookLine && "border-loss focus-visible:ring-loss"
                )}
              />
              {errors.sharpBookLine && (
                <p className="text-sm text-loss">{errors.sharpBookLine}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sharp-odds">Odds:</Label>
              <Input
                id="sharp-odds"
                type="text"
                value={sharpBookOdds}
                onChange={(e) => setSharpBookOdds(e.target.value)}
                placeholder="e.g., +106, -115"
                className={cn(
                  "text-base font-mono",
                  errors.sharpBookOdds && "border-loss focus-visible:ring-loss"
                )}
              />
              {errors.sharpBookOdds && (
                <p className="text-sm text-loss">{errors.sharpBookOdds}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bankroll Management Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Bankroll Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankroll">Total Bankroll:</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-text-secondary text-lg">$</span>
                </div>
                <Input
                  id="bankroll"
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(e.target.value)}
                  placeholder="1000"
                  className={cn(
                    "text-base font-medium pl-8",
                    errors.bankroll && "border-loss focus-visible:ring-loss"
                  )}
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.bankroll && (
                <p className="text-sm text-loss">{errors.bankroll}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-bet">Maximum Bet %:</Label>
              <div className="relative">
                <Input
                  id="max-bet"
                  type="number"
                  value={maxBetPercentage}
                  onChange={(e) => setMaxBetPercentage(e.target.value)}
                  placeholder="5"
                  className={cn(
                    "text-base font-medium pr-8",
                    errors.maxBetPercentage &&
                      "border-loss focus-visible:ring-loss"
                  )}
                  min="0.1"
                  max="100"
                  step="0.1"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-text-secondary text-lg">%</span>
                </div>
              </div>
              {errors.maxBetPercentage && (
                <p className="text-sm text-loss">{errors.maxBetPercentage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kelly-fraction">Kelly Fraction:</Label>
              <Input
                id="kelly-fraction"
                type="number"
                value={kellyFraction}
                onChange={(e) => setKellyFraction(e.target.value)}
                placeholder="0.25"
                className={cn(
                  "text-base font-medium",
                  errors.kellyFraction && "border-loss focus-visible:ring-loss"
                )}
                min="0.1"
                max="1"
                step="0.05"
              />
              {errors.kellyFraction && (
                <p className="text-sm text-loss">{errors.kellyFraction}</p>
              )}
            </div>
          </div>

          {/* Kelly Fraction Presets */}
          <div className="space-y-2">
            <span className="text-sm text-text-secondary">
              Kelly Fraction Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {kellyPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setKellyFraction(preset.value.toString())}
                  className="h-8 px-3 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Display */}
        {result && (
          <Card className="bg-surface-secondary border-border">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Status Indicator */}
                <div className="text-center">
                  <div
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      result.isPositiveEdge
                        ? "bg-profit/10 text-profit border border-profit"
                        : "bg-loss/10 text-loss border border-loss"
                    )}
                  >
                    {result.isPositiveEdge
                      ? "✅ Positive Edge - Bet Recommended"
                      : "❌ Negative Edge - No Bet Recommended"}
                  </div>
                  {result.maxBetReached && (
                    <div className="mt-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-500/10 text-orange-500 border border-orange-500">
                        ⚠️ Bet capped at maximum percentage
                      </div>
                    </div>
                  )}
                </div>

                {/* Probability Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Betting Book Probability
                    </Label>
                    <div className="text-xl font-bold text-text-primary">
                      {result.bettingBookImpliedProb.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Sharp Book Probability
                    </Label>
                    <div className="text-xl font-bold text-text-primary">
                      {result.sharpBookImpliedProb.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">Edge</Label>
                    <div
                      className={cn(
                        "text-xl font-bold",
                        result.edge > 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {result.edge > 0 ? "+" : ""}
                      {result.edge.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Kelly Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Kelly Percentage
                    </Label>
                    <div className="text-xl font-bold text-text-primary">
                      {result.kellyPercentage.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Recommended Bet
                    </Label>
                    <div className="text-2xl font-bold text-accent">
                      ${result.finalBetAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Expected Value
                    </Label>
                    <div
                      className={cn(
                        "text-xl font-bold",
                        result.expectedValue > 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      ${result.expectedValue > 0 ? "+" : ""}
                      {result.expectedValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {result.isPositiveEdge && (
                  <div className="text-center p-4 bg-surface rounded-lg border border-border">
                    <p className="text-text-primary leading-relaxed">
                      Based on the line discrepancy, you have a{" "}
                      <span className="font-semibold text-profit">
                        {result.edge.toFixed(2)}% edge
                      </span>
                      . Kelly recommends betting{" "}
                      <span className="font-semibold text-accent">
                        ${result.finalBetAmount.toFixed(2)}
                      </span>
                      {parseFloat(kellyFraction) < 1 && (
                        <span>
                          {" "}
                          ({(parseFloat(kellyFraction) * 100).toFixed(0)}% of
                          full Kelly)
                        </span>
                      )}{" "}
                      with an expected value of{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          result.expectedValue > 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        ${result.expectedValue > 0 ? "+" : ""}
                        {result.expectedValue.toFixed(2)}
                      </span>
                      .
                    </p>
                  </div>
                )}

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
