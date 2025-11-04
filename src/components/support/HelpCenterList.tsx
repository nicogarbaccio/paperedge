import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ChevronDown,
  Search,
  BookOpen,
  Zap,
  Shield,
  Wrench,
  Lightbulb,
} from "lucide-react";

interface HelpArticle {
  id: string;
  category: "getting-started" | "features" | "troubleshooting" | "advanced";
  title: string;
  description: string;
  content: string;
  keywords: string[];
}

const CATEGORIES = {
  "getting-started": { label: "Getting Started", icon: BookOpen },
  features: { label: "Features", icon: Zap },
  troubleshooting: { label: "Troubleshooting", icon: Wrench },
  advanced: { label: "Advanced", icon: Shield },
};

type CategoryKey = keyof typeof CATEGORIES;

export function HelpCenterList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(
    null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const HELP_ARTICLES: HelpArticle[] = [
    // Getting Started
    {
      id: "gs-1",
      category: "getting-started",
      title: "Welcome to PaperEdge",
      description: "Get started with paper betting and strategy development",
      content: `PaperEdge is a comprehensive paper betting platform designed for traders and betting enthusiasts who want to test strategies before committing real money.

**Key Features:**
- Track hypothetical bets across multiple strategies
- Analyze performance with detailed analytics
- Use built-in calculators for complex betting scenarios
- Organize strategies with custom notebooks

**Getting Started:**
1. Create your first notebook from the Notebooks page
2. Start adding wagers to track your strategy performance
3. Use Analytics to review your results
4. Refine your strategy based on insights`,
      keywords: ["welcome", "getting", "started", "paper", "betting"],
    },
    {
      id: "gs-2",
      category: "getting-started",
      title: "Creating Your First Notebook",
      description: "Learn how to set up a betting notebook",
      content: `A notebook in PaperEdge is a container for organizing your bets by strategy, sport, or time period.

**To Create a Notebook:**
1. Go to Notebooks page
2. Click "Create Notebook" button
3. Enter a name (e.g., "NFL 2024 Strategy")
4. Optional: Add a description and choose a color
5. Click Create

**Best Practices:**
- Use descriptive names that reflect your strategy
- Choose colors to easily distinguish strategies
- Create separate notebooks for different sports or approaches
- Name notebooks with dates for seasonal tracking`,
      keywords: ["notebook", "create", "organization", "setup"],
    },
    {
      id: "gs-3",
      category: "getting-started",
      title: "Adding Your First Bet",
      description: "How to track a wager in your notebook",
      content: `Tracking bets in PaperEdge is simple and flexible. Each bet can include custom fields to match your tracking needs.

**Basic Fields:**
- **Date**: When you placed the bet
- **Description**: What the bet is (e.g., "Lakers vs Celtics Over 215.5")
- **Odds**: The betting odds you received
- **Wager Amount**: How much you bet
- **Status**: Pending, Won, Lost, or Push
- **Return Amount**: What you received back (optional)

**Adding Custom Fields:**
1. Click "Add Custom Field" in your notebook
2. Choose field type: Text, Number, or Select
3. Name your field and set options
4. Custom fields appear on all bets in that notebook

**Tips:**
- Add fields relevant to your strategy
- Use descriptive names for easy reference
- Consider tracking player injuries, weather, line movements, etc.`,
      keywords: ["bet", "wager", "adding", "custom", "fields", "track"],
    },

    // Features
    {
      id: "f-1",
      category: "features",
      title: "Understanding the Analytics Dashboard",
      description: "Deep dive into performance analytics",
      content: `The Analytics page provides comprehensive insights into your betting performance.

**Key Metrics:**
- **Total Wagers**: Count of all bets placed
- **Win Rate**: Percentage of bets that won
- **ROI**: Return on Investment (profit divided by total wagered)
- **Profit/Loss**: Net profit or loss over time
- **Average Odds**: Average odds received across all bets

**Charts:**
- **Performance Trend**: See how your P/L changes over time
- **Win/Loss Distribution**: Visualize your winning vs losing bets
- **Odds Analysis**: Understand which odds ranges work best for you

**Filters:**
- Filter by notebook to analyze specific strategies
- Filter by time period to track seasonal performance
- Compare multiple periods to identify trends`,
      keywords: ["analytics", "dashboard", "performance", "metrics", "roi"],
    },
    {
      id: "f-2",
      category: "features",
      title: "Using the Built-in Calculators",
      description: "Master PaperEdge's calculator tools",
      content: `PaperEdge includes powerful calculators to help with betting decisions.

**Arbitrage Calculator:**
- Find risk-free betting opportunities
- Input odds from different sportsbooks
- Calculate guaranteed profit scenarios

**Parlay Calculator:**
- Calculate potential payouts for multiple bets
- Understand compound odds
- Plan your bet sizing

**Unit Betting Calculator:**
- Manage bankroll using the unit system
- Calculate unit size based on your bankroll
- Determine wager amounts by units

**Kelly Criterion Calculator:**
- Optimize bet sizing based on your win rate
- Balance growth vs risk
- Improve bankroll management

**Tips:**
- Use calculators before placing bets
- Test strategies with different scenarios
- Update your metrics regularly for accuracy`,
      keywords: ["calculator", "arbitrage", "parlay", "kelly", "unit"],
    },
    {
      id: "f-3",
      category: "features",
      title: "Calendar View and Account Tracker",
      description: "Visualize your betting activity",
      content: `PaperEdge offers multiple ways to view and track your betting activity.

**Calendar View:**
- See your bets displayed on a calendar
- Identify patterns in your betting schedule
- Spot busy periods or cold streaks
- Click dates to see specific bets

**Account Tracker:**
- Track multiple betting accounts in one place
- Organize by sportsbook or account type
- See daily P/L for each account
- Compare performance across accounts

**Per-Account Views:**
- Access individual account calendars
- Track specific account performance
- Analyze account-specific strategies`,
      keywords: ["calendar", "tracker", "accounts", "view", "activity"],
    },

    // Troubleshooting
    {
      id: "ts-1",
      category: "troubleshooting",
      title: "Bets Not Appearing in Analytics",
      description: "Troubleshoot missing bets in reports",
      content: `If your bets aren't showing up in analytics or dashboard:

**Check These Items:**
1. **Status**: Make sure bets have a status (Pending, Won, Lost, Push)
2. **Dates**: Verify the date range in filters
3. **Notebook**: Confirm you're viewing the correct notebook
4. **Filters**: Check that you haven't applied filters that exclude bets
5. **Refresh**: Try refreshing the page

**If Still Missing:**
- Reload the browser completely
- Clear browser cache
- Try a different browser
- Contact support with notebook name and bet details`,
      keywords: [
        "bets",
        "missing",
        "analytics",
        "troubleshoot",
        "not",
        "appearing",
      ],
    },
    {
      id: "ts-2",
      category: "troubleshooting",
      title: "Syncing Issues Across Devices",
      description: "Fix synchronization problems",
      content: `PaperEdge uses real-time sync, but sometimes updates may lag.

**If Changes Aren't Syncing:**
1. Check your internet connection
2. Refresh the page on all devices
3. Sign out and sign back in
4. Clear browser cache and cookies
5. Try a different browser

**To Verify Sync:**
1. Make a change on one device
2. Open PaperEdge on another device
3. Refresh after 5-10 seconds
4. Changes should appear

**Contact Support If:**
- Changes disappear when you refresh
- You see conflicting data on different devices
- Sync issues persist after clearing cache`,
      keywords: ["sync", "synchronization", "devices", "troubleshoot"],
    },

    // Advanced
    {
      id: "adv-1",
      category: "advanced",
      title: "Advanced Notebook Organization",
      description: "Organize complex betting strategies",
      content: `Master advanced notebook techniques for maximum organization.

**Naming Conventions:**
- Start with sport: "NFL_", "NBA_", "NCAAF_"
- Include year: "NFL_2024_"
- Add strategy: "NFL_2024_Moneyline", "NFL_2024_Spreads"
- Example: "NFL_2024_Q1_HomeTeams"

**Color Strategy:**
- Use colors by sport or season
- Group related strategies with same color
- Reserve specific colors for high-priority strategies

**Custom Field Strategy:**
- Create consistent field names across notebooks
- Use Select fields for standardized options
- Consider tracking: Line movement, Injuries, Weather, Confidence level

**Archive Old Notebooks:**
- Keep current season separate from previous years
- Maintain historical data for trend analysis
- Reference previous seasons for strategy validation`,
      keywords: ["advanced", "organization", "strategy", "naming", "fields"],
    },
    {
      id: "adv-2",
      category: "advanced",
      title: "Extracting Insights from Your Data",
      description: "Analyze patterns and improve your strategy",
      content: `Use PaperEdge data to make better betting decisions.

**What to Analyze:**
- **Win Rate by Odds Range**: Which odds work best for you?
- **Seasonal Trends**: Better performance in certain periods?
- **Day of Week**: Do you do better on weekends vs weekdays?
- **Sport Performance**: Which sports give highest ROI?
- **Parlays vs Singles**: Which approach is more profitable?

**Questions to Ask:**
1. What's my best-performing strategy?
2. When do I bet worse? (Time, conditions, odds)
3. What's my realistic win rate?
4. Am I following my strategy or deviating?
5. How has my performance changed over time?

**Action Items:**
- Document insights from your analysis
- Test adjustments to your strategy
- Track metrics regularly
- Don't chase losses by deviating from strategy`,
      keywords: ["insights", "analysis", "data", "patterns", "strategy"],
    },
  ];

  // Keyboard shortcuts: Ctrl/Cmd+F to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredArticles = useMemo(() => {
    let results = HELP_ARTICLES;

    // Filter by category
    if (selectedCategory) {
      results = results.filter((a) => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query) ||
          a.keywords.some((k) => k.includes(query))
      );
    }

    return results;
  }, [searchQuery, selectedCategory]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search help articles... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search help articles"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedCategory(null)}
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
        >
          All
        </Button>
        {(
          Object.entries(CATEGORIES) as Array<
            [CategoryKey, (typeof CATEGORIES)[CategoryKey]]
          >
        ).map(([key, { label, icon: Icon }]) => (
          <Button
            key={key}
            onClick={() => setSelectedCategory(key)}
            variant={selectedCategory === key ? "default" : "outline"}
            size="sm"
            className="gap-1"
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </Button>
        ))}
      </div>

      {/* Articles */}
      {filteredArticles.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-lg bg-accent/10 p-4">
                  <Lightbulb className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-lg">
                  No articles found
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  {searchQuery || selectedCategory
                    ? "Try a different search term or browse all categories"
                    : "No help articles available"}
                </p>
              </div>
              {(searchQuery || selectedCategory) && (
                <Button onClick={handleClearSearch} variant="outline" size="sm">
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => {
            const isExpanded = expandedId === article.id;
            const categoryInfo = CATEGORIES[article.category as CategoryKey];
            const CategoryIcon = categoryInfo.icon;

            return (
              <Card
                key={article.id}
                className="hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : article.id)}
                  className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-4 hover:bg-surface-secondary/50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  aria-expanded={isExpanded}
                  aria-label={`${article.title}. ${
                    isExpanded ? "Hide" : "Show"
                  } details`}
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-accent flex-shrink-0" />
                      <h3 className="font-semibold text-text-primary truncate text-sm sm:text-base">
                        {article.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-text-secondary flex-shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4 pb-6 px-4 sm:px-6">
                    <div className="prose prose-sm max-w-none text-text-secondary space-y-3 text-xs sm:text-sm">
                      {article.content.split("\n\n").map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="whitespace-pre-wrap leading-relaxed"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {filteredArticles.length > 0 && (
        <p className="text-xs text-text-secondary text-center">
          Showing {filteredArticles.length} of {HELP_ARTICLES.length} articles
        </p>
      )}
    </div>
  );
}

export default HelpCenterList;
