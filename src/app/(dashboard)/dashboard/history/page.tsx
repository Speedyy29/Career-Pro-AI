import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, Map, History as HistoryIcon, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { DeleteHistoryButton } from "./delete-button";

const PAGE_SIZE = 20;

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [resumeCount, interviewCount, roadmapCount, resumes, interviews, roadmaps] = await Promise.all([
    db.resumeAnalysis.count({ where: { userId: session.user.id } }),
    db.interviewSession.count({ where: { userId: session.user.id } }),
    db.roadmap.count({ where: { userId: session.user.id } }),
    db.resumeAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: { id: true, atsScore: true, createdAt: true },
    }),
    db.interviewSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: { id: true, role: true, createdAt: true },
    }),
    db.roadmap.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: { id: true, currentRole: true, targetRole: true, createdAt: true },
    }),
  ]);

  const total = resumeCount + interviewCount + roadmapCount;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HistoryIcon className="h-8 w-8 text-primary" />
          History
        </h1>
        <p className="text-muted-foreground mt-1">All your AI-generated content in one place.</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({total})</TabsTrigger>
          <TabsTrigger value="resumes">Resumes ({resumeCount})</TabsTrigger>
          <TabsTrigger value="interviews">Interviews ({interviewCount})</TabsTrigger>
          <TabsTrigger value="roadmaps">Roadmaps ({roadmapCount})</TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all">
          {total === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {[
                ...resumes.map((r) => ({ type: "resume", id: r.id, title: `Resume Analysis (Score: ${r.atsScore}%)`, date: r.createdAt })),
                ...interviews.map((i) => ({ type: "interview", id: i.id, title: `Interview: ${i.role}`, date: i.createdAt })),
                ...roadmaps.map((r) => ({ type: "roadmap", id: r.id, title: `Roadmap: ${r.currentRole} → ${r.targetRole}`, date: r.createdAt })),
              ]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              {total > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Showing the most recent {PAGE_SIZE} items out of {total} total.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resumes">
          {resumeCount === 0 ? <EmptyState type="resume" /> : (
            <div className="space-y-3">
              {resumes.map((r: { id: string; atsScore: number; createdAt: Date }) => (
                <HistoryItem key={r.id} item={{ type: "resume", id: r.id, title: `Resume Analysis (Score: ${r.atsScore}%)`, date: r.createdAt }} />
              ))}
              {resumeCount > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Showing {PAGE_SIZE} of {resumeCount} resumes.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interviews">
          {interviewCount === 0 ? <EmptyState type="interview" /> : (
            <div className="space-y-3">
              {interviews.map((i: { id: string; role: string; createdAt: Date }) => (
                <HistoryItem key={i.id} item={{ type: "interview", id: i.id, title: `Interview: ${i.role}`, date: i.createdAt }} />
              ))}
              {interviewCount > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Showing {PAGE_SIZE} of {interviewCount} interview sessions.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roadmaps">
          {roadmapCount === 0 ? <EmptyState type="roadmap" /> : (
            <div className="space-y-3">
              {roadmaps.map((r: { id: string; currentRole: string; targetRole: string; createdAt: Date }) => (
                <HistoryItem key={r.id} item={{ type: "roadmap", id: r.id, title: `Roadmap: ${r.currentRole} → ${r.targetRole}`, date: r.createdAt }} />
              ))}
              {roadmapCount > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground text-center pt-4">
                  Showing {PAGE_SIZE} of {roadmapCount} roadmaps.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HistoryItem({ item }: { item: { type: string; id: string; title: string; date: Date } }) {
  const icon = item.type === "resume" ? <FileText className="h-4 w-4" /> : item.type === "interview" ? <MessageSquare className="h-4 w-4" /> : <Map className="h-4 w-4" />;
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
        <DeleteHistoryButton type={item.type} id={item.id} />
      </div>
    </div>
  );
}

function EmptyState({ type }: { type?: string }) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No {type || "activity"} yet</h3>
        <p className="text-muted-foreground mb-4">Start generating to see your history here.</p>
        <Button asChild>
          <Link href="/dashboard">
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
