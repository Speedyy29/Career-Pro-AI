import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Map, ArrowRight, Sparkles, TrendingUp, Clock, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { FREE_DAILY_LIMIT, formatDate } from "@/lib/utils";
import { DashboardOnboarding } from "@/components/dashboard-onboarding";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // All DB calls wrapped in try/catch so page still renders if DB is temporarily unreachable
  let resumeCount = 0;
  let interviewCount = 0;
  let roadmapCount = 0;
  let recentResumes: Array<{ id: string; atsScore: number; createdAt: Date }> = [];
  let recentInterviews: Array<{ id: string; role: string; createdAt: Date }> = [];
  let recentRoadmaps: Array<{ id: string; currentRole: string; targetRole: string; createdAt: Date }> = [];
  let todayUsage = 0;
  let streak = 0;

  try {
    const [rc, ic, rmc, rr, ri, rrm] = await Promise.all([
      db.resumeAnalysis.count({ where: { userId } }),
      db.interviewSession.count({ where: { userId } }),
      db.roadmap.count({ where: { userId } }),
      db.resumeAnalysis.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
      db.interviewSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
      db.roadmap.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
    ]);
    resumeCount = rc;
    interviewCount = ic;
    roadmapCount = rmc;
    recentResumes = rr as typeof recentResumes;
    recentInterviews = ri as typeof recentInterviews;
    recentRoadmaps = rrm as typeof recentRoadmaps;

    // Today's usage
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    todayUsage = await db.toolUsage.count({
      where: { userId, createdAt: { gte: todayStart } },
    });

    // Streak calculation
    const streakDays = await db.toolUsage.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    const uniqueDays = [...new Set(streakDays.map((u: { createdAt: Date }) =>
      new Date(u.createdAt).toDateString()
    ))];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      if (uniqueDays.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) break;
    }
  } catch {
    console.warn("Dashboard: database temporarily unreachable, showing defaults");
  }

  const totalGenerations = resumeCount + interviewCount + roadmapCount;
  const creditsRemaining = Math.max(0, FREE_DAILY_LIMIT - todayUsage);
  const creditsUsedPercent = todayUsage > 0 ? (todayUsage / FREE_DAILY_LIMIT) * 100 : 0;

  const allRecent = [
    ...recentResumes.map((r: { id: string; atsScore: number; createdAt: Date }) => ({ type: "resume" as const, id: r.id, title: `Resume Analysis (${r.atsScore}%)`, date: r.createdAt })),
    ...recentInterviews.map((i: { id: string; role: string; createdAt: Date }) => ({ type: "interview" as const, id: i.id, title: `Interview: ${i.role}`, date: i.createdAt })),
    ...recentRoadmaps.map((r: { id: string; currentRole: string; targetRole: string; createdAt: Date }) => ({ type: "roadmap" as const, id: r.id, title: `Roadmap: ${r.currentRole} → ${r.targetRole}`, date: r.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <DashboardOnboarding userName={session.user.name || "there"} totalGenerations={totalGenerations}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {session.user.name || "there"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {totalGenerations === 0
                ? "Let's get started — your first AI analysis is just a click away."
                : `You've generated ${totalGenerations} AI ${totalGenerations === 1 ? "result" : "results"} so far.`}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                {streak}-day streak
              </span>
            </div>
          )}
        </div>

        {/* Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Today&apos;s Credits
            </CardTitle>
            <CardDescription>
              {creditsRemaining > 0 ? (
                <span><strong className="text-foreground">{creditsRemaining} of {FREE_DAILY_LIMIT}</strong> remaining today — use them before midnight!</span>
              ) : (
                <span className="text-destructive font-medium">You&apos;ve used all {FREE_DAILY_LIMIT} credits today.</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={creditsUsedPercent} className="h-3" />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Resets at midnight.
              </p>
              {creditsRemaining === 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/pricing">
                    <Sparkles className="mr-1 h-3 w-3" /> Get Unlimited
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{resumeCount}</Badge>
              </div>
              <CardTitle className="text-lg mt-2">Resume Analyzer</CardTitle>
              <CardDescription>
                {resumeCount === 0
                  ? "Paste your resume for instant ATS scoring + AI rewrites"
                  : "Analyze another resume or view past results"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:bg-primary/90">
                <Link href="/dashboard/resume">
                  {resumeCount === 0 ? "Analyze My Resume" : "Analyze Resume"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <MessageSquare className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{interviewCount}</Badge>
              </div>
              <CardTitle className="text-lg mt-2">Interview Prep</CardTitle>
              <CardDescription>
                {interviewCount === 0
                  ? "Generate HR, technical & scenario questions for your role"
                  : "Generate more questions or review past sessions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:bg-primary/90">
                <Link href="/dashboard/interview">
                  {interviewCount === 0 ? "Start Prep" : "Generate Questions"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Map className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{roadmapCount}</Badge>
              </div>
              <CardTitle className="text-lg mt-2">Career Roadmap</CardTitle>
              <CardDescription>
                {roadmapCount === 0
                  ? "Build a 30-60-90 day career transition plan"
                  : "Create a new roadmap or review your existing ones"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full group-hover:bg-primary/90">
                <Link href="/dashboard/roadmap">
                  {roadmapCount === 0 ? "Create Roadmap" : "Generate Roadmap"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalGenerations}</div>
              <div className="text-xs text-muted-foreground">Total Generations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{todayUsage}</div>
              <div className="text-xs text-muted-foreground">Used Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your latest AI-generated content</CardDescription>
          </CardHeader>
          <CardContent>
            {allRecent.length === 0 ? (
              <div className="py-8 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">No results yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by analyzing your resume — it takes 30 seconds.
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/resume">
                    Analyze Resume <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {allRecent.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/${item.type === "resume" ? "resume" : item.type === "interview" ? "interview" : "roadmap"}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "resume" && <FileText className="h-4 w-4 text-primary" />}
                      {item.type === "interview" && <MessageSquare className="h-4 w-4 text-primary" />}
                      {item.type === "roadmap" && <Map className="h-4 w-4 text-primary" />}
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardOnboarding>
  );
}
