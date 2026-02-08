import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                    <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight">
                        Something went wrong
                    </h1>
                    <p className="mb-6 max-w-md text-muted-foreground">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => this.setState({ hasError: false, error: null })} variant="outline">
                            Try again
                        </Button>
                        <Button onClick={this.handleReload}>Reload Page</Button>
                    </div>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <div className="mt-8 max-w-lg overflow-auto rounded bg-muted p-4 text-left font-mono text-xs text-muted-foreground">
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
