import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";

// Layout components
import { Layout } from "./components/layout/Layout";

// Page components
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotebooksPage } from "./pages/NotebooksPage";
import { NotebookDetailPage } from "./pages/NotebookDetailPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CalculatorsPage } from "./pages/CalculatorsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TrackerPage } from "./pages/TrackerPage";
import { Toaster } from "./components/ui/Toaster";
import AccountTrackerPage from "./pages/AccountTrackerPage";
import FAQsPage from "./pages/FAQsPage";
import SupportPage from "./pages/SupportPage";
import AdminDashboard from "./pages/AdminDashboard";
import { toast } from "@/hooks/useToast";
import { PageLoading } from "./components/ui/Spinner";
import useAdminRole from "./hooks/useAdminRole";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PageLoading message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Admin route wrapper - requires both authentication and admin role
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { isAdmin, isLoading: isAdminLoading } = useAdminRole();

  if (loading || isAdminLoading) {
    return <PageLoading message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function App() {
  const { user, setUser, setLoading, loading } = useAuthStore();
  const hasShownInitialAuth = useRef(false);
  const previousUser = useRef<User | null>(null);
  const previousEvent = useRef<string | null>(null);
  const hasShownToastForSession = useRef<string | null>(null);
  const initialSessionUser = useRef<User | null>(null);
  const isOAuthRedirect = useRef(false);

  useEffect(() => {
    // Check if this is an OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    isOAuthRedirect.current = !!(accessToken || refreshToken);

    // Clean sensitive tokens from URL to prevent exposure in browser history/logs
    if (accessToken || refreshToken) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      hasShownInitialAuth.current = true;
      initialSessionUser.current = currentUser;

      // Check if we've already shown the toast for this user in this browser session
      if (currentUser) {
        const sessionKey = `toast_shown_${currentUser.id}`;
        hasShownToastForSession.current =
          sessionStorage.getItem(sessionKey) || null;
      }

      // Don't set previousUser here - let the auth state change handler manage it
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;

      setUser(newUser);
      setLoading(false);

      // Show toast notifications for auth events (but not on initial load or token refreshes)
      if (hasShownInitialAuth.current) {
        // Show welcome toast for genuine sign-ins (not page refreshes)
        if (
          event === "INITIAL_SESSION" &&
          newUser &&
          hasShownToastForSession.current !== newUser.id
        ) {
          toast({
            title: "Welcome back!",
            description: `Signed in as ${newUser.email}`,
            variant: "success",
          });
          hasShownToastForSession.current = newUser.id;
          // Store in session storage so it persists across page refreshes
          sessionStorage.setItem(`toast_shown_${newUser.id}`, newUser.id);
        } else if (event === "SIGNED_OUT") {
          toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
            variant: "default",
          });
          hasShownToastForSession.current = null;
          // Clear session storage when user signs out
          if (previousUser.current) {
            sessionStorage.removeItem(`toast_shown_${previousUser.current.id}`);
          }
        }
      }

      // Update previous references
      previousUser.current = newUser;
      previousEvent.current = event;
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return <PageLoading message="Loading application..." />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notebooks" element={<NotebooksPage />} />
          <Route path="notebooks/:id" element={<NotebookDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calculators" element={<CalculatorsPage />} />
          <Route path="tracker" element={<TrackerPage />} />
          <Route path="tracker/accounts/:id" element={<AccountTrackerPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="faqs" element={<FAQsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
