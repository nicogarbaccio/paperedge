import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export interface FeatureRequest {
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

interface SubmitFeatureRequestInput {
  title: string;
  description: string;
  priority: "nice_to_have" | "important" | "critical";
  related_features?: string;
}

interface UseFeatureRequestsReturn {
  submitting: boolean;
  loading: boolean;
  voting: string | null;
  error: string | null;
  requests: FeatureRequest[];
  userVotedIds: string[];
  userOwnIds: string[];
  submitFeatureRequest: (input: SubmitFeatureRequestInput) => Promise<FeatureRequest | null>;
  fetchRequests: () => Promise<void>;
  voteOnRequest: (requestId: string) => Promise<boolean>;
  unvoteRequest: (requestId: string) => Promise<boolean>;
}

export function useFeatureRequests(): UseFeatureRequestsReturn {
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [userVotedIds, setUserVotedIds] = useState<string[]>([]);
  const [userOwnIds, setUserOwnIds] = useState<string[]>([]);

  // Fetch all requests and voting status on mount
  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  const submitFeatureRequest = useCallback(
    async (input: SubmitFeatureRequestInput): Promise<FeatureRequest | null> => {
      if (!user?.id) {
        setError("User not authenticated");
        return null;
      }

      setSubmitting(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("feature_requests")
          .insert([
            {
              user_id: user.id,
              title: input.title,
              description: input.description,
              priority: input.priority,
              related_features: input.related_features || null,
              status: "open",
              vote_count: 0,
            },
          ])
          .select()
          .single();

        if (supabaseError) {
          setError(supabaseError.message);
          return null;
        }

        // Add new request to list
        setRequests((prev) => [data as FeatureRequest, ...prev]);
        setUserOwnIds((prev) => [...prev, data.id]);

        return data as FeatureRequest;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.id]
  );

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all feature requests sorted by votes
      const { data: requestsData, error: requestsError } = await supabase
        .from("feature_requests")
        .select("*")
        .order("vote_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (requestsError) {
        setError(requestsError.message);
        return;
      }

      setRequests((requestsData || []) as FeatureRequest[]);

      // If user is authenticated, fetch their votes and own requests
      if (user?.id) {
        // Fetch user's votes
        const { data: votesData, error: votesError } = await supabase
          .from("feature_request_votes")
          .select("feature_request_id")
          .eq("user_id", user.id);

        if (!votesError) {
          setUserVotedIds(votesData?.map((v) => v.feature_request_id) || []);
        }

        // Get user's own feature requests
        const userOwnRequestIds = (requestsData || [])
          .filter((req: any) => req.user_id === user.id)
          .map((req: any) => req.id);

        setUserOwnIds(userOwnRequestIds);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const voteOnRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!user?.id) {
        setError("User not authenticated");
        return false;
      }

      setVoting(requestId);
      setError(null);

      try {
        // Add vote
        const { error: voteError } = await supabase
          .from("feature_request_votes")
          .insert([
            {
              user_id: user.id,
              feature_request_id: requestId,
            },
          ]);

        if (voteError) {
          setError(voteError.message);
          return false;
        }

        // Increment vote count using RPC to avoid race conditions
        const { error: incrementError } = await supabase.rpc(
          "increment_vote_count",
          { request_id: requestId }
        );
        if (incrementError) {
          // Fallback: fetch current count and update
          const { data: current } = await supabase
            .from("feature_requests")
            .select("vote_count")
            .eq("id", requestId)
            .single();
          await supabase
            .from("feature_requests")
            .update({ vote_count: (current?.vote_count ?? 0) + 1 })
            .eq("id", requestId);
        }

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, vote_count: req.vote_count + 1 } : req
          )
        );
        setUserVotedIds((prev) => [...prev, requestId]);

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return false;
      } finally {
        setVoting(null);
      }
    },
    [user?.id, requests]
  );

  const unvoteRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      if (!user?.id) {
        setError("User not authenticated");
        return false;
      }

      setVoting(requestId);
      setError(null);

      try {
        // Remove vote
        const { error: voteError } = await supabase
          .from("feature_request_votes")
          .delete()
          .eq("user_id", user.id)
          .eq("feature_request_id", requestId);

        if (voteError) {
          setError(voteError.message);
          return false;
        }

        // Decrement vote count using RPC to avoid race conditions
        const { error: decrementError } = await supabase.rpc(
          "decrement_vote_count",
          { request_id: requestId }
        );
        if (decrementError) {
          // Fallback: fetch current count and update
          const { data: current } = await supabase
            .from("feature_requests")
            .select("vote_count")
            .eq("id", requestId)
            .single();
          await supabase
            .from("feature_requests")
            .update({ vote_count: Math.max(0, (current?.vote_count ?? 1) - 1) })
            .eq("id", requestId);
        }

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, vote_count: Math.max(0, req.vote_count - 1) } : req
          )
        );
        setUserVotedIds((prev) => prev.filter((id) => id !== requestId));

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return false;
      } finally {
        setVoting(null);
      }
    },
    [user?.id, requests]
  );

  return {
    submitting,
    loading,
    voting,
    error,
    requests,
    userVotedIds,
    userOwnIds,
    submitFeatureRequest,
    fetchRequests,
    voteOnRequest,
    unvoteRequest,
  };
}
