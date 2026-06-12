"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import {
  FileText, MessageSquare, Map, History, Settings, Sparkles,
  CreditCard, LogOut, LayoutDashboard, Crown, PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume Analyzer" },
  { href: "/dashboard/resume-builder", icon: PenSquare, label: "Resume Builder" },
  { href: "/dashboard/interview", icon: MessageSquare, label: "Interview Prep" },
  { href: "/dashboard/roadmap", icon: Map, label: "Career Roadmap" },
  { href: "/dashboard/history", icon: History, label: "History" },
];

const bottomItems = [
  { href: "/dashboard/pricing", icon: CreditCard, label: "Upgrade to Pro" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ user, plan, onNavClick }: { user: User; plan: string; onNavClick?: () => void }) {
  const pathname = usePathname();
  const isPro = plan === "PRO";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">CareerBoost AI</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-3 space-y-1">
        {/* Show upgrade button only for free users */}
        {!isPro && bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
              item.href === "/dashboard/pricing" && "text-primary hover:text-primary"
            )}
          >
            {item.href === "/dashboard/pricing" ? <Crown className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
            {item.label}
          </Link>
        ))}
        {isPro && (
          <Link
            href="/dashboard/settings"
            onClick={onNavClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user, plan }: { user: User; plan: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        <SidebarContent user={user} plan={plan} />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50" aria-label="Open navigation menu">
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent user={user} plan={plan} onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
