"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, FileText, Download, PenSquare, Search, History, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  { icon: FileText, text: "All 5 Resume Templates" },
  { icon: Download, text: "PDF Export" },
  { icon: PenSquare, text: "20 Resume Builder generations/month" },
  { icon: Search, text: "50 Resume Analyses/month" },
  { icon: History, text: "Unlimited History" },
  { icon: Sparkles, text: "Save & Edit Drafts" },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-primary" />
            Unlock Pro Features
          </DialogTitle>
          <DialogDescription>
            Upgrade to CareerBoost AI Pro for higher limits and premium features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard/pricing" onClick={() => onOpenChange(false)}>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro — ₹199/month
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Cancel anytime. 30-day money-back guarantee.
        </p>
      </DialogContent>
    </Dialog>
  );
}
