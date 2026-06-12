import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Shield, CreditCard } from "lucide-react";
import Link from "next/link";
import { DeleteAccountButton } from "./delete-account-button";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Profile
          </CardTitle>
          <CardDescription>Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue={user.name || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user.email || ""} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Input defaultValue={user.profile?.bio || ""} placeholder="Tell us about yourself" readOnly />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <Input defaultValue={user.profile?.currentRole || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Target Role</Label>
              <Input defaultValue={user.profile?.targetRole || ""} readOnly />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Profile editing coming soon. For now, your profile is populated from your account info.
          </p>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Current Plan:</span>
                <Badge variant={user.plan === "PRO" ? "default" : "secondary"}>
                  {user.plan}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.plan === "FREE" ? "3 AI generations per day" : "Unlimited generations"}
              </p>
            </div>
            {user.plan === "FREE" && (
              <Button asChild>
                <Link href="/dashboard/pricing">Upgrade to Pro</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </CardTitle>
          <CardDescription>Account security and data management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h4 className="text-sm font-semibold mb-1">Sign-in Method</h4>
            <p className="text-xs text-muted-foreground">
              {user.hashedPassword ? "Email & Password" : "Social Login (Google)"}
            </p>
          </div>
          <Separator />
          <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <h4 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Once you delete your account, there is no going back. All your data including resume analyses,
              interview sessions, and career roadmaps will be permanently removed.
            </p>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
