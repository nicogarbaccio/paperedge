import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";

// Layout components
import { Layout } from "./components/layout/Layout";

// Page components
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotebooksPage } from "./pages/NotebooksPage";
import { NotebookDetailPage } from "./pages/NotebookDetailPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CalculatorsPage } from "./pages/CalculatorsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { Toaster } from "./components/ui/Toaster";
import { toast } from "@/hooks/useToast";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  const { user, setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      
      setUser(newUser);
      setLoading(false);

      // Show toast notifications for auth events
      if (event === 'SIGNED_IN' && newUser) {
        toast({
          title: "Welcome back!",
          description: `Signed in as ${newUser.email}`,
          variant: "success",
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
          variant: "default",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </div>
    );
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
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
