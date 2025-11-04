import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Search,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useFeatureRequests } from "@/hooks/useFeatureRequests";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/useToast";

interface FeatureRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: "nice_to_have" | "important" | "critical";
  related_features: string | null;
  vote_count: number;
  status: "open" | "planned" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export function FeatureRequestsAdmin() {
  const { requests, loading, error, fetchRequests } = useFeatureRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    FeatureRequest["status"] | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    FeatureRequest["priority"] | "all"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (
    requestId: string,
    newStatus: FeatureRequest["status"]
  ) => {
    setUpdating(requestId);
    try {
      const { error: updateError } = await supabase
        .from("feature_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", requestId);

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
        description: `Feature request marked as ${newStatus}`,
        variant: "success",
      });

      await fetchRequests();
    } catch (err) {
      console.error("Error updating feature request:", err);
      toast({
        title: "Error",
        description: "Failed to update feature request",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handlePriorityChange = async (
    requestId: string,
    newPriority: FeatureRequest["priority"]
  ) => {
    setUpdating(requestId);
    try {
      const { error: updateError } = await supabase
        .from("feature_requests")
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (updateError) {
        toast({
          title: "Error updating priority",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Priority updated",
        description: `Feature priority changed to ${newPriority}`,
        variant: "success",
      });

      await fetchRequests();
    } catch (err) {
      console.error("Error updating priority:", err);
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const priorityColors = {
    nice_to_have: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    important: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    critical: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const statusIcons = {
    open: <AlertCircle className="h-4 w-4" />,
    planned: <Clock className="h-4 w-4" />,
    in_progress: <Zap className="h-4 w-4" />,
    completed: <CheckCircle2 className="h-4 w-4" />,
  };

  const statusColors = {
    open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    planned: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    completed: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Feature Requests
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Manage community feature requests and set priorities
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
              placeholder="Search feature requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search feature requests"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as FeatureRequest["status"] | "all"
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value as FeatureRequest["priority"] | "all"
              )
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none transition-colors"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="nice_to_have">Nice to Have</option>
            <option value="important">Important</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            Showing {filteredRequests.length} of {requests.length} requests
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
                  Error loading requests
                </p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="font-medium text-text-primary">
                No feature requests
              </p>
              <p className="text-text-secondary text-sm">
                {searchQuery ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
                  ? "No requests match your filters"
                  : "No feature requests yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const isExpanded = expandedId === request.id;
            const isUpdating = updating === request.id;

            return (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : request.id)}
                  className="w-full text-left p-4 sm:p-6 flex items-start justify-between gap-4 hover:bg-surface-secondary/50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-text-primary truncate flex-1">
                        {request.title}
                      </h3>
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-accent/10 text-accent text-xs font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {request.vote_count}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                          priorityColors[request.priority]
                        }`}
                      >
                        {request.priority.replace("_", " ")}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${
                          statusColors[request.status]
                        }`}
                      >
                        {statusIcons[request.status]}
                        {request.status.replace("_", " ")}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {request.description}
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
                          {request.description}
                        </p>
                      </div>

                      {request.related_features && (
                        <div>
                          <h4 className="font-medium text-text-primary text-sm">
                            Related Features
                          </h4>
                          <p className="text-xs sm:text-sm text-text-secondary mt-2">
                            {request.related_features}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-text-secondary">
                          Votes: <strong>{request.vote_count}</strong>
                        </p>
                        <p className="text-xs text-text-secondary">
                          Submitted:{" "}
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Updated:{" "}
                          {new Date(request.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Update Controls */}
                    <div className="pt-2 border-t border-border space-y-3">
                      <div>
                        <p className="text-xs font-medium text-text-primary mb-2">
                          Update Status
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              "open",
                              "planned",
                              "in_progress",
                              "completed",
                            ] as const
                          ).map((status) => (
                            <Button
                              key={status}
                              onClick={() =>
                                handleStatusChange(request.id, status)
                              }
                              disabled={isUpdating || request.status === status}
                              variant={
                                request.status === status
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="capitalize"
                            >
                              {status.replace("_", " ")}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Priority Update Controls */}
                      <div>
                        <p className="text-xs font-medium text-text-primary mb-2">
                          Update Priority
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            ["nice_to_have", "important", "critical"] as const
                          ).map((priority) => (
                            <Button
                              key={priority}
                              onClick={() =>
                                handlePriorityChange(request.id, priority)
                              }
                              disabled={
                                isUpdating || request.priority === priority
                              }
                              variant={
                                request.priority === priority
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="capitalize"
                            >
                              {priority.replace("_", " ")}
                            </Button>
                          ))}
                        </div>
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

export default FeatureRequestsAdmin;
