import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  X,
  ChevronDown,
} from "lucide-react";
import { useBugReports } from "@/hooks/useBugReports";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  browser_info: Record<string, string> | null;
  status: "open" | "investigating" | "fixed" | "closed";
  created_at: string;
  updated_at: string;
}

export function BugReportsAdmin() {
  const { pastReports, loading, error, fetchPastReports } = useBugReports();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BugReport["status"] | "all">(
    "all"
  );
  const [severityFilter, setSeverityFilter] = useState<
    BugReport["severity"] | "all"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch bug reports on mount
  useEffect(() => {
    // For admin, we need to fetch ALL reports, not just user's
    // This would require a separate hook or function with admin privileges
    fetchPastReports();
  }, [fetchPastReports]);

  const filteredReports = pastReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesSeverity =
      severityFilter === "all" || report.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleStatusChange = async (
    reportId: string,
    newStatus: BugReport["status"]
  ) => {
    setUpdating(reportId);
    try {
      const { error: updateError } = await supabase
        .from("bug_reports")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", reportId);

      if (updateError) {
        toast({
          title: "Error updating status",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Status updated",
        description: `Bug report marked as ${newStatus}`,
        variant: "success",
      });

      await fetchPastReports();
    } catch (err) {
      console.error("Error updating bug report:", err);
      toast({
        title: "Error",
        description: "Failed to update bug report",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const severityColors = {
    low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    critical: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const statusIcons = {
    open: <AlertCircle className="h-4 w-4" />,
    investigating: <Clock className="h-4 w-4" />,
    fixed: <CheckCircle2 className="h-4 w-4" />,
    closed: <X className="h-4 w-4" />,
  };

  const statusColors = {
    open: "bg-red-500/10 text-red-600 border-red-500/20",
    investigating: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    fixed: "bg-green-500/10 text-green-600 border-green-500/20",
    closed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Bug Reports</h2>
        <p className="text-text-secondary text-sm mt-1">
          Manage reported bugs and track their status
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary pointer-events-none" />
            <Input
              type="text"
              placeholder="Search bug reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search bug reports"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as BugReport["status"] | "all")
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="fixed">Fixed</option>
            <option value="closed">Closed</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value as BugReport["severity"] | "all")
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            aria-label="Filter by severity"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            Showing {filteredReports.length} of {pastReports.length} reports
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : error ? (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-8">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-600">
                  Error loading reports
                </p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="font-medium text-text-primary">No bug reports</p>
              <p className="text-text-secondary text-sm">
                {searchQuery ||
                statusFilter !== "all" ||
                severityFilter !== "all"
                  ? "No reports match your filters"
                  : "No bug reports yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isExpanded = expandedId === report.id;
            const isUpdating = updating === report.id;

            return (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-4 hover:bg-surface-secondary/50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary truncate flex-1">
                        {report.title}
                      </h3>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                          severityColors[report.severity]
                        }`}
                      >
                        <Zap className="h-3 w-3" />
                        {report.severity}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                          statusColors[report.status]
                        }`}
                      >
                        {statusIcons[report.status]}
                        {report.status}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {report.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-text-secondary flex-shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <CardContent className="border-t border-border pt-4 pb-6 px-4 sm:px-6 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-text-primary text-sm">
                          Description
                        </h4>
                        <p className="text-xs sm:text-sm text-text-secondary mt-2 whitespace-pre-wrap">
                          {report.description}
                        </p>
                      </div>

                      {report.browser_info && (
                        <div>
                          <h4 className="font-medium text-text-primary text-sm">
                            Browser Info
                          </h4>
                          <div className="text-xs text-text-secondary mt-2 space-y-1">
                            {Object.entries(report.browser_info).map(
                              ([key, value]) => (
                                <p key={key}>
                                  <strong>{key}:</strong> {value}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-text-secondary">
                          Reported:{" "}
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Updated:{" "}
                          {new Date(report.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Update Controls */}
                    <div className="pt-2 border-t border-border space-y-2">
                      <p className="text-xs font-medium text-text-primary">
                        Update Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          ["open", "investigating", "fixed", "closed"] as const
                        ).map((status) => (
                          <Button
                            key={status}
                            onClick={() =>
                              handleStatusChange(report.id, status)
                            }
                            disabled={isUpdating || report.status === status}
                            variant={
                              report.status === status ? "default" : "outline"
                            }
                            size="sm"
                            className="capitalize"
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BugReportsAdmin;
