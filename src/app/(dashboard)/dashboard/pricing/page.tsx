"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, Loader2, Shield, Star } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [annual, setAnnual] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError(data.error || "Unable to process upgrade. Please contact support.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Crown className="h-8 w-8 text-primary" />
          Unlock Unlimited Career Tools
        </h1>
        <p className="text-muted-foreground mt-1">
          Stop counting credits. Start landing interviews.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg max-w-md mx-auto text-center">
          {error}
        </div>
      )}

      {/* Annual Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted-foreground/20"}`}
          aria-label="Toggle annual pricing"
        >
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${annual ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual <Badge className="ml-1 bg-green-600 hover:bg-green-700 text-xs">Save 38%</Badge>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>For casual job seekers</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {[
                "3 AI generations per day",
                "Basic resume analysis",
                "Interview question generator",
                "Career roadmap overview",
                "7-day history",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Badge variant="secondary" className="w-full text-center justify-center py-2">Current Plan</Badge>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="border-primary shadow-lg relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Pro
            </CardTitle>
            <CardDescription>For serious career advancement</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${annual ? "8" : "12"}</span>
              <span className="text-muted-foreground">/{annual ? "month (billed annually)" : "month"}</span>
            </div>
            {annual && (
              <p className="text-xs text-green-600 font-medium">$96/year — save $48 vs monthly</p>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {[
                "Unlimited AI generations",
                "Advanced resume rewriting",
                "Full interview prep suite",
                "Detailed 90-day roadmaps",
                "Unlimited saved history",
                "PDF export (coming soon)",
                "Priority support",
                "No ads",
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button className="w-full" size="lg" onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><Crown className="mr-2 h-4 w-4" /> {annual ? "Start Annual Plan" : "Upgrade to Pro"}</>
              )}
            </Button>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                30-day money-back guarantee. Cancel anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Proof */}
      <Card className="max-w-lg mx-auto">
        <CardContent className="py-6 text-center">
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground italic mb-2">
            &quot;I was applying to 30+ jobs with no callbacks. After CareerBoost rewrote my resume,
            I got 4 interview invites in one week. Best $12 I ever spent.&quot;
          </p>
          <p className="text-sm font-medium">— Sarah C., Software Engineer</p>
        </CardContent>
      </Card>

      {/* Comparison Summary */}
      <div className="max-w-lg mx-auto">
        <h3 className="text-center text-lg font-semibold mb-4">Why Upgrade?</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">3x</div>
            <div className="text-xs text-muted-foreground">More interview callbacks</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">25+</div>
            <div className="text-xs text-muted-foreground">Avg. ATS score improvement</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-muted-foreground">AI generations per day</div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary">90</div>
            <div className="text-xs text-muted-foreground">Day career transition plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
