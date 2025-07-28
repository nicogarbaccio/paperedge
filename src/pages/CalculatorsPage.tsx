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
import { UnitBettingCalculator } from "@/components/calculators/UnitBettingCalculator";
import { ParlayCalculator } from "@/components/calculators/ParlayCalculator";
import { ArbitrageCalculator } from "@/components/calculators/ArbitrageCalculator";

// Betting odds conversion utilities
function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  } else {
    return 100 / Math.abs(americanOdds) + 1;
  }
}

function decimalToAmerican(decimalOdds: number): number {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
}

function decimalToFractional(decimalOdds: number): string {
  const fractional = decimalOdds - 1;

  // Convert to fraction
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const denominator = 1000;
  const numerator = Math.round(fractional * denominator);
  const divisor = gcd(numerator, denominator);

  return `${numerator / divisor}/${denominator / divisor}`;
}

function fractionalToDecimal(fractional: string): number {
  const parts = fractional.split("/");
  if (parts.length !== 2) return 1;

  const numerator = parseFloat(parts[0]);
  const denominator = parseFloat(parts[1]);

  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return 1;

  return numerator / denominator + 1;
}

function decimalToImplied(decimalOdds: number): number {
  return (1 / decimalOdds) * 100;
}

function impliedToDecimal(impliedProbability: number): number {
  return 100 / impliedProbability;
}

function calculatePayout(
  stake: number,
  decimalOdds: number
): { toWin: number; payout: number } {
  const toWin = stake * (decimalOdds - 1);
  const payout = stake * decimalOdds;
  return { toWin, payout };
}

export function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState<string>("odds");
  const [betAmount, setBetAmount] = useState<string>("10");
  const [americanOdds, setAmericanOdds] = useState<string>("");
  const [decimalOdds, setDecimalOdds] = useState<string>("");
  const [fractionalOdds, setFractionalOdds] = useState<string>("");
  const [impliedOdds, setImpliedOdds] = useState<string>("");

  const [results, setResults] = useState<{ toWin: number; payout: number }>({
    toWin: 0,
    payout: 0,
  });

  const calculators = [
    {
      id: "odds",
      name: "Betting Odds",
      description: "Calculate payouts from odds",
    },
    {
      id: "unit",
      name: "To Win a Unit",
      description: "Calculate bet size to win specific units",
    },
    {
      id: "parlay",
      name: "Parlay Calculator",
      description: "Combine multiple bets into one parlay",
    },
    {
      id: "arbitrage",
      name: "Arbitrage/Hedge",
      description: "Find arbitrage opportunities or hedge bets",
    },
  ];

  // Update all odds formats when one changes
  const updateOddsFromAmerican = (value: string) => {
    setAmericanOdds(value);
    if (value && !isNaN(Number(value))) {
      const american = Number(value);
      const decimal = americanToDecimal(american);
      const fractional = decimalToFractional(decimal);
      const implied = decimalToImplied(decimal);

      setDecimalOdds(decimal.toFixed(2));
      setFractionalOdds(fractional);
      setImpliedOdds(implied.toFixed(1));
    }
  };

  const updateOddsFromDecimal = (value: string) => {
    setDecimalOdds(value);
    if (value && !isNaN(Number(value))) {
      const decimal = Number(value);
      const american = decimalToAmerican(decimal);
      const fractional = decimalToFractional(decimal);
      const implied = decimalToImplied(decimal);

      setAmericanOdds(american > 0 ? `+${american}` : american.toString());
      setFractionalOdds(fractional);
      setImpliedOdds(implied.toFixed(1));
    }
  };

  const updateOddsFromFractional = (value: string) => {
    setFractionalOdds(value);
    if (value && value.includes("/")) {
      const decimal = fractionalToDecimal(value);
      const american = decimalToAmerican(decimal);
      const implied = decimalToImplied(decimal);

      setDecimalOdds(decimal.toFixed(2));
      setAmericanOdds(american > 0 ? `+${american}` : american.toString());
      setImpliedOdds(implied.toFixed(1));
    }
  };

  const updateOddsFromImplied = (value: string) => {
    setImpliedOdds(value);
    if (value && !isNaN(Number(value))) {
      const implied = Number(value);
      const decimal = impliedToDecimal(implied);
      const american = decimalToAmerican(decimal);
      const fractional = decimalToFractional(decimal);

      setDecimalOdds(decimal.toFixed(2));
      setAmericanOdds(american > 0 ? `+${american}` : american.toString());
      setFractionalOdds(fractional);
    }
  };

  // Calculate results whenever bet amount or odds change
  useEffect(() => {
    const stake = parseFloat(betAmount);
    const decimal = parseFloat(decimalOdds);

    if (!isNaN(stake) && !isNaN(decimal) && stake > 0 && decimal > 0) {
      setResults(calculatePayout(stake, decimal));
    } else {
      setResults({ toWin: 0, payout: 0 });
    }
  }, [betAmount, decimalOdds]);

  const handleReset = () => {
    setBetAmount("10");
    setAmericanOdds("");
    setDecimalOdds("");
    setFractionalOdds("");
    setImpliedOdds("");
    setResults({ toWin: 0, payout: 0 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Calculators</h1>
        <p className="text-text-secondary">
          Betting calculators and tools to help with your analysis
        </p>
      </div>

      {/* Calculator Navigation */}
      <div className="flex flex-wrap gap-2 p-4 bg-surface rounded-lg border border-border">
        {calculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalculator(calc.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCalculator === calc.id
                ? "bg-accent text-accent-foreground"
                : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 hover:text-text-primary"
            }`}
          >
            <div className="text-left">
              <div className="font-semibold">{calc.name}</div>
              <div className="text-xs opacity-75">{calc.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Betting Odds Calculator */}
      {activeCalculator === "odds" && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Betting Odds Calculator
            </CardTitle>
            <CardDescription>
              The betting odds calculator allows you to input your stake & odds
              in American, Decimal, or Fractional formats to quickly calculate
              the payout for your bets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bet Amount */}
            <div className="space-y-2 text-center">
              <Label htmlFor="bet-amount">Bet Amount</Label>
              <div className="max-w-xs mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-text-secondary text-lg">$</span>
                  </div>
                  <Input
                    id="bet-amount"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="text-lg font-medium text-center pl-8"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Odds Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="american-odds">American Odds</Label>
                <Input
                  id="american-odds"
                  type="text"
                  value={americanOdds}
                  onChange={(e) => updateOddsFromAmerican(e.target.value)}
                  placeholder="e.g., +110 or -150"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decimal-odds">Decimal Odds</Label>
                <Input
                  id="decimal-odds"
                  type="number"
                  value={decimalOdds}
                  onChange={(e) => updateOddsFromDecimal(e.target.value)}
                  placeholder="e.g., 2.10"
                  step="0.01"
                  min="1"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fractional-odds">Fractional Odds</Label>
                <Input
                  id="fractional-odds"
                  type="text"
                  value={fractionalOdds}
                  onChange={(e) => updateOddsFromFractional(e.target.value)}
                  placeholder="e.g., 11/10"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implied-odds">Implied Odds</Label>
                <Input
                  id="implied-odds"
                  type="number"
                  value={impliedOdds}
                  onChange={(e) => updateOddsFromImplied(e.target.value)}
                  placeholder="e.g., 47.6"
                  step="0.1"
                  min="0"
                  max="100"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Results */}
            <Card className="bg-surface-secondary border-border">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Label className="text-sm text-text-secondary">
                      To Win
                    </Label>
                    <div className="text-2xl font-bold text-text-primary">
                      ${results.toWin > 0 ? results.toWin.toFixed(2) : "–"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-text-secondary">
                      Payout
                    </Label>
                    <div className="text-2xl font-bold text-text-primary">
                      ${results.payout > 0 ? results.payout.toFixed(2) : "–"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button onClick={handleReset} variant="outline" className="px-8">
                RESET
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unit Betting Calculator */}
      {activeCalculator === "unit" && <UnitBettingCalculator />}

      {/* Parlay Calculator */}
      {activeCalculator === "parlay" && <ParlayCalculator />}

      {/* Arbitrage/Hedge Calculator */}
      {activeCalculator === "arbitrage" && <ArbitrageCalculator />}
    </div>
  );
}
