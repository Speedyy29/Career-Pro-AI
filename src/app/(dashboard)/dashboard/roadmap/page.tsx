"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Map, Loader2, X, Plus, BookOpen, Briefcase, Award, Clock, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlanPhase {
  focus: string;
  goals: string[];
  tasks: string[];
  resources: string[];
}

interface Certification {
  name: string;
  provider: string;
  relevance: string;
}

interface ProjectIdea {
  title: string;
  description: string;
  skills: string[];
}

interface ScheduleItem {
  time: string;
  activity: string;
}

interface RoadmapResult {
  id: string;
  thirtyDayPlan: PlanPhase;
  sixtyDayPlan: PlanPhase;
  ninetyDayPlan: PlanPhase;
  certifications: Certification[];
  projectIdeas: ProjectIdea[];
  dailySchedule: {
    weekday: ScheduleItem[];
    weekend: ScheduleItem[];
  };
  remaining: number;
}

export default function RoadmapPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  function addSkill() {
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setCurrentSkills(currentSkills.filter((s) => s !== skill));
  }

  async function handleGenerate() {
    if (!currentRole || !targetRole || !experience || currentSkills.length === 0) {
      setError("Please fill in all fields and add at least one skill.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setRateLimited(false);

    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRole, targetRole, experience: parseInt(experience), currentSkills }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
          setError(data.error || "Daily limit reached.");
        } else {
          setError(data.error || "Generation failed");
        }
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function PlanCard({ plan, label }: { plan: PlanPhase; label: string }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{label}</CardTitle>
          <CardDescription className="font-medium text-foreground">{plan.focus}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Goals</h4>
            <ul className="space-y-1">
              {plan.goals.map((g, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">*</span> {g}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Tasks</h4>
            <ul className="space-y-1">
              {plan.tasks.map((t, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">-</span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Resources</h4>
            <div className="flex flex-wrap gap-2">
              {plan.resources.map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Map className="h-8 w-8 text-primary" />
          Career Roadmap
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate a personalized 30-60-90 day career transition plan.
        </p>
      </div>

      {/* Rate Limit Paywall */}
      {rateLimited && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">You&apos;ve hit your daily limit</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Free accounts get 3 AI generations per day. Upgrade to Pro for unlimited career roadmaps.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/pricing">
                  <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro — $12/mo
                </Link>
              </Button>
              <Button variant="outline" onClick={() => { setRateLimited(false); setError(""); }}>
                Come Back Tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && !rateLimited && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Career Profile</CardTitle>
            <CardDescription>Tell us about your current role and where you want to go.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input placeholder="e.g., Junior Developer" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Input placeholder="e.g., Senior Software Architect" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" min="0" max="30" placeholder="e.g., 2" value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Roadmap...</>
              ) : (
                <><Map className="mr-2 h-4 w-4" /> Generate Career Roadmap</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Building your roadmap...</h3>
            <p className="text-muted-foreground">Creating a personalized career transition plan for you.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{currentRole} &rarr; {targetRole}</h2>
              <p className="text-sm text-muted-foreground">Your personalized career transition roadmap</p>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); setRateLimited(false); }}>New Roadmap</Button>
          </div>

          <Tabs defaultValue="plans" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="certifications"><Award className="h-4 w-4 mr-1" /> Certs</TabsTrigger>
              <TabsTrigger value="projects"><Briefcase className="h-4 w-4 mr-1" /> Projects</TabsTrigger>
              <TabsTrigger value="schedule"><Clock className="h-4 w-4 mr-1" /> Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-4">
              <PlanCard plan={result.thirtyDayPlan} label="30-Day Plan" />
              <PlanCard plan={result.sixtyDayPlan} label="60-Day Plan" />
              <PlanCard plan={result.ninetyDayPlan} label="90-Day Plan" />
            </TabsContent>

            <TabsContent value="certifications">
              <div className="grid gap-4">
                {result.certifications.map((cert, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">Provider: {cert.provider}</p>
                          <p className="text-sm mt-1">{cert.relevance}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="grid gap-4">
                {result.projectIdeas.map((project, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.skills.map((s, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> Weekday Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.dailySchedule.weekday.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                          <Badge variant="outline" className="shrink-0 text-xs">{item.time}</Badge>
                          <span className="text-sm">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> Weekend Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.dailySchedule.weekend.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                          <Badge variant="outline" className="shrink-0 text-xs">{item.time}</Badge>
                          <span className="text-sm">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Contextual Upgrade Prompt */}
          {result.remaining <= 1 && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">
                        {result.remaining === 0 ? "Last credit used!" : `${result.remaining} credit remaining today`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pro users create unlimited roadmaps for every career path they explore.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/dashboard/pricing">
                      Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
