import { useState } from "react";
import { AlertCircle, Lightbulb, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import BugReportsAdmin from "@/components/admin/BugReportsAdmin";
import FeatureRequestsAdmin from "@/components/admin/FeatureRequestsAdmin";

type AdminTab = "bugs" | "features";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("bugs");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent/10 p-3">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-text-primary">
              Admin Dashboard
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage bug reports and feature requests
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-4">
        <Button
          onClick={() => setActiveTab("bugs")}
          variant={activeTab === "bugs" ? "default" : "ghost"}
          className="gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          Bug Reports
        </Button>
        <Button
          onClick={() => setActiveTab("features")}
          variant={activeTab === "features" ? "default" : "ghost"}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Feature Requests
        </Button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "bugs" && <BugReportsAdmin />}
        {activeTab === "features" && <FeatureRequestsAdmin />}
      </div>
    </div>
  );
}

export default AdminDashboard;
