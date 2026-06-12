"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, MessageSquare, Map, ArrowRight, Sparkles,
  ChevronRight,
} from "lucide-react";

interface OnboardingWizardProps {
  userName: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [targetRole, setTargetRole] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");

  const goals = [
    { id: "resume", icon: FileText, label: "Fix my resume", desc: "Get past ATS filters and land more interviews" },
    { id: "interview", icon: MessageSquare, label: "Prepare for interviews", desc: "Practice with role-specific questions" },
    { id: "roadmap", icon: Map, label: "Plan my career", desc: "Build a 90-day transition roadmap" },
  ];

  function handleComplete() {
    // Store onboarding data in localStorage for now
    if (targetRole) localStorage.setItem("cb_target_role", targetRole);
    if (primaryGoal) localStorage.setItem("cb_primary_goal", primaryGoal);
    localStorage.setItem("cb_onboarded", "true");

    // Navigate to the most relevant tool
    if (primaryGoal === "resume") {
      router.push("/dashboard/resume");
    } else if (primaryGoal === "interview") {
      router.push("/dashboard/interview");
    } else if (primaryGoal === "roadmap") {
      router.push("/dashboard/roadmap");
    } else {
      router.push("/dashboard/resume");
    }
    router.refresh();
  }

  return (
    <Card className="border-primary/20 shadow-lg max-w-lg mx-auto">
      <CardContent className="pt-6">
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Welcome, {userName}!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Let&apos;s personalize your experience in 30 seconds.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-2 text-left">
                <Label htmlFor="target-role">What role are you targeting?</Label>
                <Input
                  id="target-role"
                  placeholder="e.g., Senior Frontend Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setStep(1)}
                className="w-full"
                disabled={!targetRole.trim()}
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold">What&apos;s your #1 priority right now?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;ll take you straight to the right tool.
              </p>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setPrimaryGoal(g.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
                    primaryGoal === g.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <g.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{g.label}</p>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                  {primaryGoal === g.id && (
                    <Check className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <Button
              onClick={handleComplete}
              className="w-full"
              disabled={!primaryGoal}
            >
              Take Me There <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
