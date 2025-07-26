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
import { CalculatorInputs, CalculationResult, ValidationErrors } from "./types";

// Utility functions for odds validation and calculation
function parseOdds(oddsString: string): number | null {
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

function calculateWager(targetWin: number, odds: number): number {
  if (odds < 0) {
    // Negative odds (favorites): wager = (targetWin * Math.abs(oddsValue)) / 100
    return (targetWin * Math.abs(odds)) / 100;
  } else {
    // Positive odds (underdogs): wager = (targetWin * 100) / oddsValue
    return (targetWin * 100) / odds;
  }
}

function validateInputs(inputs: CalculatorInputs): ValidationErrors {
  const errors: ValidationErrors = {};

  // Count empty fields
  const emptyFields = [
    inputs.unitSize === 0 || isNaN(inputs.unitSize),
    inputs.unitsToWin === 0 || isNaN(inputs.unitsToWin),
    !inputs.odds.trim(),
  ].filter(Boolean).length;

  if (emptyFields >= 1) {
    errors.general = "Please fill in all fields";
    return errors;
  }

  // Validate unit size
  if (isNaN(inputs.unitSize) || inputs.unitSize <= 0) {
    errors.unitSize = "Please enter a valid unit size";
  }

  // Validate units to win
  if (isNaN(inputs.unitsToWin) || inputs.unitsToWin <= 0) {
    errors.unitsToWin = "Please enter valid units to win";
  }

  // Validate odds format
  if (inputs.odds.trim() && parseOdds(inputs.odds) === null) {
    errors.odds = "Please enter valid odds (e.g. -120, +100, or 100)";
  }

  return errors;
}

export function UnitBettingCalculator() {
  const [unitSize, setUnitSize] = useState<string>("");
  const [unitsToWin, setUnitsToWin] = useState<string>("");
  const [odds, setOdds] = useState<string>("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Preset unit sizes for quick selection
  const presets = [1, 5, 10, 25, 50, 100];

  // Real-time validation and calculation
  useEffect(() => {
    const inputs: CalculatorInputs = {
      unitSize: parseFloat(unitSize) || 0,
      unitsToWin: parseFloat(unitsToWin) || 0,
      odds: odds.trim(),
    };

    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    // Calculate if no errors and all fields are filled
    if (
      Object.keys(validationErrors).length === 0 &&
      inputs.unitSize > 0 &&
      inputs.unitsToWin > 0 &&
      inputs.odds.trim()
    ) {
      const parsedOdds = parseOdds(inputs.odds);
      if (parsedOdds !== null) {
        const targetWin = inputs.unitSize * inputs.unitsToWin;
        const wager = calculateWager(targetWin, parsedOdds);
        const totalWinnings = wager + targetWin;

        setResult({
          wager,
          targetWin,
          totalWinnings,
          unitsToWin: inputs.unitsToWin,
        });
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [unitSize, unitsToWin, odds]);

  const handleClear = () => {
    setUnitSize("");
    setUnitsToWin("");
    setOdds("");
    setResult(null);
    setErrors({});
  };

  const handlePresetClick = (preset: number) => {
    setUnitSize(preset.toString());
  };

  const copyResult = () => {
    if (result) {
      const text = `Bet: $${result.wager.toFixed(
        2
      )}\n\nTo win $${result.targetWin.toFixed(2)} (${result.unitsToWin} unit${
        result.unitsToWin !== 1 ? "s" : ""
      }), you should bet $${result.wager.toFixed(
        2
      )}. Your total winnings would be $${result.totalWinnings.toFixed(2)}.`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          To Win a Unit Calculator
        </CardTitle>
        <CardDescription>
          Calculate the exact bet amount needed to win a specific number of
          units based on your unit size and odds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div className="p-3 rounded-md bg-loss/10 border border-loss text-loss text-sm">
            {errors.general}
          </div>
        )}

        {/* Unit Size Input with Presets */}
        <div className="space-y-3">
          <Label htmlFor="unit-size">Unit Size (In dollars):</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary text-lg">$</span>
            </div>
            <Input
              id="unit-size"
              type="number"
              value={unitSize}
              onChange={(e) => setUnitSize(e.target.value)}
              placeholder="Enter your unit size"
              className={cn(
                "text-lg font-medium pl-8",
                errors.unitSize && "border-loss focus-visible:ring-loss"
              )}
              min="0"
              step="0.01"
              aria-describedby={errors.unitSize ? "unit-size-error" : undefined}
            />
          </div>
          {errors.unitSize && (
            <p id="unit-size-error" className="text-sm text-loss">
              {errors.unitSize}
            </p>
          )}

          {/* Quick Presets */}
          <div className="text-center space-y-2">
            <span className="text-sm text-text-secondary">Quick presets:</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className="h-8 px-3 text-xs"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Units to Win Input */}
        <div className="space-y-2">
          <Label htmlFor="units-to-win">Units to Win:</Label>
          <Input
            id="units-to-win"
            type="number"
            value={unitsToWin}
            onChange={(e) => setUnitsToWin(e.target.value)}
            placeholder="Enter units to win"
            className={cn(
              "text-lg font-medium",
              errors.unitsToWin && "border-loss focus-visible:ring-loss"
            )}
            min="0"
            step="0.1"
            aria-describedby={
              errors.unitsToWin ? "units-to-win-error" : undefined
            }
          />
          {errors.unitsToWin && (
            <p id="units-to-win-error" className="text-sm text-loss">
              {errors.unitsToWin}
            </p>
          )}
        </div>

        {/* Odds Input */}
        <div className="space-y-2">
          <Label htmlFor="odds">Odds:</Label>
          <Input
            id="odds"
            type="text"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            placeholder="Enter the odds (e.g. -120)"
            className={cn(
              "text-lg font-mono",
              errors.odds && "border-loss focus-visible:ring-loss"
            )}
            aria-describedby={errors.odds ? "odds-error" : undefined}
          />
          {errors.odds && (
            <p id="odds-error" className="text-sm text-loss">
              {errors.odds}
            </p>
          )}
          <p className="text-xs text-text-secondary">
            Examples: -120 (favorite), +150 (underdog), or 100
          </p>
        </div>

        {/* Results Display */}
        {result && (
          <Card className="bg-surface-secondary border-border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Label className="text-sm text-text-secondary">
                    Bet Amount
                  </Label>
                  <div className="text-3xl font-bold text-accent">
                    ${result.wager.toFixed(2)}
                  </div>
                </div>

                <div className="text-center p-4 bg-surface rounded-lg border border-border">
                  <p className="text-text-primary leading-relaxed">
                    To win{" "}
                    <span className="font-semibold text-accent">
                      ${result.targetWin.toFixed(2)}
                    </span>{" "}
                    ({result.unitsToWin} unit
                    {result.unitsToWin !== 1 ? "s" : ""}), you should bet{" "}
                    <span className="font-semibold text-accent">
                      ${result.wager.toFixed(2)}
                    </span>
                    . Your total winnings would be{" "}
                    <span className="font-semibold text-accent">
                      ${result.totalWinnings.toFixed(2)}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <Button onClick={copyResult} variant="outline" size="sm">
                    Copy Result
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleClear} variant="outline" className="px-8">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
