import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThumbsUp, Calendar, User, Badge } from "lucide-react";
import { useFeatureRequests } from "@/hooks/useFeatureRequests";
import { formatDistanceToNow } from "date-fns";

export function FeatureRequestList() {
  const {
    requests,
    loading,
    voting,
    userVotedIds,
    voteOnRequest,
    unvoteRequest,
  } = useFeatureRequests();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <p className="text-text-secondary">
              No feature requests yet. Be the first to suggest one!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleVoteClick = async (requestId: string) => {
    if (userVotedIds.includes(requestId)) {
      await unvoteRequest(requestId);
    } else {
      await voteOnRequest(requestId);
    }
  };

  const statusColors: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    planned: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    completed: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  const statusLabels: Record<string, string> = {
    open: "Open",
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const priorityColors: Record<string, string> = {
    nice_to_have: "text-gray-500",
    important: "text-blue-500",
    critical: "text-red-500",
  };

  const priorityLabels: Record<string, string> = {
    nice_to_have: "Nice to have",
    important: "Important",
    critical: "Critical",
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const hasVoted = userVotedIds.includes(request.id);
        const createdDate = new Date(request.created_at);
        const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">
                      {request.title}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {request.description}
                    </p>
                  </div>

                  {/* Vote Button */}
                  <Button
                    onClick={() => handleVoteClick(request.id)}
                    disabled={voting === request.id}
                    variant={hasVoted ? "default" : "outline"}
                    className="flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`}
                    />
                    <span className="font-semibold">
                      {voting === request.id ? "..." : request.vote_count}
                    </span>
                  </Button>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority */}
                  <span
                    className={`text-xs font-medium ${
                      priorityColors[request.priority]
                    }`}
                  >
                    {priorityLabels[request.priority]}
                  </span>

                  {/* Status Badge */}
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      statusColors[request.status]
                    }`}
                  >
                    <Badge className="h-3 w-3 inline mr-1" />
                    {statusLabels[request.status]}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-text-secondary flex items-center gap-1 ml-auto">
                    <Calendar className="h-3 w-3" />
                    {timeAgo}
                  </span>
                </div>

                {/* Related Features */}
                {request.related_features && (
                  <div className="text-xs text-text-secondary pt-2 border-t border-border">
                    <span className="font-medium">Related:</span>{" "}
                    {request.related_features}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default FeatureRequestList;
