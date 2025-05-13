import React, { Component, ReactNode } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = (): void => {
    // Reset the error boundary state to trigger a re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Otherwise render our default error UI
      return (
        <Alert variant="destructive" className="p-6">
          <AlertTitle>Une erreur est survenue</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="text-sm font-medium">
                {error?.message || "Une erreur inattendue s'est produite."}
              </p>
              
              <pre className="mt-4 p-2 bg-slate-800 rounded-md text-xs overflow-auto max-h-32">
                {error?.stack?.split("\n").slice(0, 3).join("\n") || "Aucun détail disponible"}
              </pre>
              
              <Button 
                className="mt-4"
                variant="outline"
                onClick={this.handleRetry}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Réessayer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;
