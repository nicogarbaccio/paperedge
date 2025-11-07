import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const faqs: FAQItem[] = [
  {
    id: "what-is-paperedge",
    question: "What is PaperEdge?",
    answer:
      "PaperEdge is a comprehensive betting management application that allows you to track and analyze your betting strategies without risking real money. It's designed for 'paper betting' - meaning you can test strategies, track hypothetical wagers, and analyze performance to determine profitability before putting actual money on the line.",
  },
  {
    id: "what-can-i-track",
    question: "What can I track with PaperEdge?",
    answer:
      "You can track: \n\n- Individual wagers with custom fields\n- Multiple betting strategies across different sports\n- Performance analytics and trends\n- Profit/loss calculations\n- Calendar views of your betting activity\n- Arbitrage opportunities\n- Parlay calculations\n- Unit-based betting strategies",
  },
  {
    id: "why-not-pikkit",
    question: "Why not just use existing betting platforms like Pikkit?",
    answer:
      "The whole point of PaperEdge is 'paper betting' - allowing you to track and test strategies without risking any actual money. This lets you determine whether a strategy is profitable before investing real funds. Traditional betting platforms require real money wagers, while PaperEdge focuses purely on strategy development and analysis.",
  },
  {
    id: "organize-strategies",
    question: "How do I organize my different betting strategies?",
    answer:
      "PaperEdge allows you to create multiple betting notebooks, each dedicated to different strategies or sports. This helps you keep your various approaches organized and makes it easier to analyze the performance of specific strategies independently.",
  },
  {
    id: "analytics",
    question: "What kind of analytics does PaperEdge provide?",
    answer:
      "The platform offers: \n\n- Interactive charts showing performance trends\n- Detailed profit/loss visualizations\n- Calendar views of betting activity\n- Performance analysis across different time periods\n- Strategy comparison tools\n- Success rate tracking",
  },
  {
    id: "calculators",
    question: "Does PaperEdge have betting calculators?",
    answer:
      "Yes! PaperEdge includes advanced betting calculators for: \n\n- **Arbitrage opportunities** - Find risk-free betting scenarios\n- **Parlay calculations** - Calculate potential payouts for multiple bets\n- **Unit-based betting** - Manage bankroll using betting units\n- Custom betting scenarios",
  },
  {
    id: "account-tracker",
    question: "How does the tracker work?",
    answer:
      "The account tracker is a simple tool that allows you to track your betting across multiple accounts. Platforms like Pikkit don't allow you to track your activity on offshore sites like Betonline, BetUS, MyBookie, etc. And you can only track one account at a time. So if you have multiple accounts, you can track them all in one place and see your overall activity!",
  },
  {
    id: "mobile-friendly",
    question: "Is PaperEdge mobile-friendly?",
    answer:
      "Absolutely! You can access and manage your betting notebooks, add wagers, and view analytics seamlessly on any device.",
  },
  {
    id: "security",
    question: "How secure is my data?",
    answer:
      "PaperEdge uses Supabase for authentication and database services, providing: \n\n- Secure user accounts with robust authentication\n- Real-time data synchronization\n- Industry-standard security practices\n- Reliable data backup and storage",
  },
  {
    id: "real-accounts",
    question: "Do I need to connect my real betting accounts?",
    answer:
      "Nope! Since PaperEdge is designed for paper betting, you don't need to connect any real betting accounts or deposit actual money. Everything is tracked hypothetically to help you develop and test strategies.",
  },
  {
    id: "multiple-sports",
    question: "Can I track multiple sports?",
    answer:
      "Yes, you can create separate notebooks for different sports or even different strategies within the same sport. This flexibility allows you to organize your tracking exactly how you want.",
  },
  {
    id: "realtime-sync",
    question: "How does real-time synchronization work?",
    answer:
      "Any changes you make to your betting notebooks, whether adding new wagers or updating existing ones, are instantly synchronized across all your devices. This means you can start tracking on your phone and continue on your computer without missing any data.",
  },
  {
    id: "limits",
    question: "Is there a limit to how many bets I can track?",
    answer:
      "PaperEdge is designed to handle your complete betting strategy development needs. You can track as many hypothetical wagers as needed across multiple notebooks and strategies.",
  },
  {
    id: "vs-spreadsheets",
    question: "What makes PaperEdge different from spreadsheet tracking?",
    answer:
      "While spreadsheets can track basic information, PaperEdge offers: \n\n- Purpose-built betting calculators\n- Interactive visualizations and charts\n- Mobile-optimized interface\n- Real-time synchronization across devices\n- Advanced analytics and trend identification\n- Organized notebook system\n- Calendar views and time-based analysis",
  },
  {
    id: "export",
    question: "Can I export my data?",
    answer: "Not right now, but we're working on it!",
  },
  {
    id: "starting-bankroll",
    question: "What is the starting bankroll and why do I need to set it?",
    answer:
      "The starting bankroll represents your hypothetical initial investment for a betting strategy. It serves as a baseline to measure your strategy's performance over time. As you add and settle bets, your current bankroll will change, and you can see if you're growing or depleting your initial investment. This helps you evaluate whether a strategy is profitable before risking real money.",
  },
  {
    id: "bankroll-negative",
    question: "What happens if my notebook bankroll goes to zero or negative?",
    answer:
      "If your betting strategy loses your entire starting bankroll, the notebook will continue to track your bets and show the negative balance. This is important data - it tells you the strategy isn't profitable. Remember, PaperEdge is for testing strategies without real money, so you can learn from these results without financial loss. You can always start a new notebook with a fresh strategy or adjust your approach based on what you've learned.\n\nThink of the progress bar on your notebook like a health bar in a video game:\n• Green (100%+): Healthy and profitable - your strategy is winning!\n• Yellow (90-100%): Minor damage - small loss but still recoverable\n• Orange (75-90%): Moderate damage - concerning losses, adjust your approach\n• Red (below 75%): Critical damage - strategy is struggling and needs a major rethink!",
  },
];

export function FAQsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash) as HTMLDetailsElement | null;
    if (el) el.open = true;
  }, []);

  return (
    <div className="space-y-6" data-testid="faqs-page">
      <div>
        <h1
          className="text-3xl font-bold text-text-primary"
          data-testid="faqs-page-title"
        >
          FAQs
        </h1>
        <p className="text-text-secondary">
          Common questions and quick answers.
        </p>
      </div>

      <div className="max-w-xl">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs…"
          aria-label="Search FAQs"
          data-testid="faqs-search-input"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <div
              role="status"
              aria-live="polite"
              className="text-text-secondary"
            >
              No results. Try a different search.
            </div>
          ) : (
            filtered.map((f) => (
              <details
                key={f.id}
                id={f.id}
                className="group border border-border rounded-lg px-4 py-3"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none marker:content-none">
                  <span className="font-medium">{f.question}</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {f.answer}
                </div>
                {/* no copy link button per request */}
              </details>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FAQsPage;
