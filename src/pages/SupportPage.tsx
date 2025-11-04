import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  HelpCircle,
  Bug,
  Lightbulb,
  ChevronRight,
  BookOpen,
  MessageSquare,
  X,
} from "lucide-react";
import BugReportForm from "@/components/support/BugReportForm";
import FeatureRequestForm from "@/components/support/FeatureRequestForm";
import FeatureRequestList from "@/components/support/FeatureRequestList";
import HelpCenterList from "@/components/support/HelpCenterList";
import ErrorBoundary from "@/components/support/ErrorBoundary";

interface SupportSection {
  id: "help" | "bug" | "feature";
  title: string;
  icon: typeof HelpCircle;
  description: string;
  details: string[];
  buttonText: string;
  buttonIcon: typeof ChevronRight;
}

const supportSections: SupportSection[] = [
  {
    id: "help",
    title: "Help Center",
    icon: BookOpen,
    description:
      "Browse documentation, tutorials, and guides to learn how to use PaperEdge.",
    details: [
      "Getting Started Guide",
      "Feature Tutorials",
      "Troubleshooting Tips",
      "FAQ & Best Practices",
    ],
    buttonText: "Browse Help",
    buttonIcon: ChevronRight,
  },
  {
    id: "bug",
    title: "Report a Bug",
    icon: Bug,
    description:
      "Found an issue? Help us improve by reporting bugs you encounter.",
    details: [
      "Describe the problem",
      "Include reproduction steps",
      "Share browser information",
      "Optional: Attach screenshots",
    ],
    buttonText: "Report Bug",
    buttonIcon: ChevronRight,
  },
  {
    id: "feature",
    title: "Feature Requests",
    icon: Lightbulb,
    description:
      "Suggest new features and vote on feature requests from the community.",
    details: [
      "Submit feature ideas",
      "Vote on popular requests",
      "See implementation status",
      "Community-driven development",
    ],
    buttonText: "Request Feature",
    buttonIcon: ChevronRight,
  },
];

export function SupportPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBugForm, setShowBugForm] = useState(false);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [showFeatureList, setShowFeatureList] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const isExpanded = (id: string) => expandedId === id;
  const toggleExpanded = (id: string) => {
    if (id === "bug") {
      setShowBugForm(true);
      setExpandedId(null);
    } else if (id === "feature") {
      setShowFeatureList(!showFeatureList);
      setExpandedId(null);
    } else if (id === "help") {
      setShowHelpCenter(!showHelpCenter);
      setExpandedId(null);
    } else {
      setExpandedId(isExpanded(id) ? null : id);
    }
  };

  // If bug form is open, show modal overlay
  if (showBugForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black/50 fixed inset-0 z-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <BugReportForm
            onClose={() => setShowBugForm(false)}
            onSuccess={() => {
              // Could refresh page or show success message
            }}
          />
        </div>
      </div>
    );
  }

  // If feature form is open, show modal overlay
  if (showFeatureForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black/50 fixed inset-0 z-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <FeatureRequestForm
            onClose={() => setShowFeatureForm(false)}
            onSuccess={() => {
              setShowFeatureForm(false);
              setShowFeatureList(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-3">
        <div>
          <h1 className="text-4xl font-bold text-text-primary">
            Support & Help
          </h1>
          <p className="mt-2 text-lg text-text-secondary">
            Get help, report issues, or suggest features to improve PaperEdge
          </p>
        </div>
      </div>

      {/* Three-Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {supportSections.map((section) => {
          const IconComponent = section.icon;
          const ButtonIcon = section.buttonIcon;

          return (
            <Card
              key={section.id}
              className="flex flex-col transition-all duration-200 hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-accent/10 p-3">
                    <IconComponent className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {section.description}
                </p>

                {/* Details List - Always visible */}
                <div className="space-y-2">
                  {section.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span className="text-xs text-text-secondary">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Button */}
                <Button
                  onClick={() => toggleExpanded(section.id)}
                  className="w-full gap-2 group"
                  variant="outline"
                >
                  <span>{section.buttonText}</span>
                  <ButtonIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Center Section */}
      {showHelpCenter && (
        <div className="space-y-4 mt-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Help Center
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Find answers, tutorials, and guides to help you get the most out
              of PaperEdge.
            </p>
          </div>
          <ErrorBoundary>
            <HelpCenterList />
          </ErrorBoundary>
        </div>
      )}

      {/* Feature Requests List Section */}
      {showFeatureList && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Community Feature Requests
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                Vote on features you'd like to see. Popular requests get
                prioritized!
              </p>
            </div>
            <Button
              onClick={() => setShowFeatureForm(true)}
              className="gap-2 flex-shrink-0"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Suggest Feature</span>
              <span className="sm:hidden">Suggest</span>
            </Button>
          </div>
          <ErrorBoundary>
            <FeatureRequestList />
          </ErrorBoundary>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg border border-border bg-surface-secondary p-4">
        <div className="flex gap-3">
          <MessageSquare className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-text-primary">
              Need immediate help?
            </p>
            <p className="text-sm text-text-secondary">
              Check out our Help Center or browse frequently asked questions for
              quick answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
