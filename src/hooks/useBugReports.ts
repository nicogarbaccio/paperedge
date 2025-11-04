import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  browser_info: Record<string, string> | null;
  screenshots: string[] | null;
  status: "open" | "investigating" | "fixed" | "closed";
  created_at: string;
  updated_at: string;
}

interface SubmitBugReportInput {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  browser_info?: Record<string, string>;
  screenshots?: string[];
}

interface UseBugReportsReturn {
  submitting: boolean;
  loading: boolean;
  error: string | null;
  pastReports: BugReport[];
  submitBugReport: (input: SubmitBugReportInput) => Promise<BugReport | null>;
  fetchPastReports: () => Promise<void>;
}

export function useBugReports(): UseBugReportsReturn {
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastReports, setPastReports] = useState<BugReport[]>([]);

  const submitBugReport = useCallback(
    async (input: SubmitBugReportInput): Promise<BugReport | null> => {
      if (!user?.id) {
        setError("User not authenticated");
        return null;
      }

      setSubmitting(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("bug_reports")
          .insert([
            {
              user_id: user.id,
              title: input.title,
              description: input.description,
              severity: input.severity,
              browser_info: input.browser_info || null,
              screenshots: input.screenshots || null,
              status: "open",
            },
          ])
          .select()
          .single();

        if (supabaseError) {
          setError(supabaseError.message);
          return null;
        }

        return data as BugReport;
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

  const fetchPastReports = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("bug_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      setPastReports((data || []) as BugReport[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    submitting,
    loading,
    error,
    pastReports,
    submitBugReport,
    fetchPastReports,
  };
}
