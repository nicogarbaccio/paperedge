import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Support page error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-8">
              <div className="flex gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Something went wrong
                    </h3>
                    <p className="text-sm text-red-800 mt-1">
                      {this.state.error?.message ||
                        "An error occurred while loading this component."}
                    </p>
                  </div>
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
