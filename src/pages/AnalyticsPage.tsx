import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary">
          Deep dive into your betting performance and trends
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">
            The analytics page will include interactive charts, performance
            trends, and detailed statistical analysis of your betting
            strategies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
