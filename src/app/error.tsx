"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for monitoring (replace with Sentry/Datadog in production)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error. Our team has been notified and is working to fix it.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
