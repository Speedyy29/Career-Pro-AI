"use client";

import { useState, useEffect } from "react";
import { OnboardingWizard } from "@/components/onboarding-wizard";

interface DashboardOnboardingProps {
  userName: string;
  totalGenerations: number;
  children: React.ReactNode;
}

export function DashboardOnboarding({ userName, totalGenerations, children }: DashboardOnboardingProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for new users who haven't completed it and have no generations
    const onboarded = localStorage.getItem("cb_onboarded");
    if (!onboarded && totalGenerations === 0) {
      setShowOnboarding(true);
    }
  }, [totalGenerations]);

  if (showOnboarding) {
    return (
      <div className="space-y-8">
        <OnboardingWizard userName={userName} />
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.setItem("cb_onboarded", "true");
              setShowOnboarding(false);
            }}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Skip setup, go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
