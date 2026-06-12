"use client";

import type { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { getInitials } from "@/lib/utils";

export function DashboardHeader({ user, plan }: { user: User; plan: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="lg:hidden w-10" />
        <div className="hidden lg:block">
          <h1 className="text-sm font-medium text-muted-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={plan === "PRO" ? "default" : "secondary"} className="text-xs">
            {plan === "PRO" ? "Pro Plan" : "Free Plan"}
          </Badge>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback>{getInitials(user.name || "U")}</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
