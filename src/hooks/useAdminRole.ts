import { useAuthStore } from "@/stores/authStore";

interface AdminCheckResult {
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if current user has admin privileges
 * In a real app, you'd fetch this from your database or JWT claims
 * For now, we'll check for a specific admin flag or metadata
 */
export function useAdminRole(): AdminCheckResult {
  const { user } = useAuthStore();

  // Check if user has admin role in their user metadata
  // This assumes your auth system stores admin status in user metadata
  const isAdmin = user?.user_metadata?.role === "admin" || false;

  return {
    isAdmin,
    isLoading: !user,
  };
}

export default useAdminRole;
