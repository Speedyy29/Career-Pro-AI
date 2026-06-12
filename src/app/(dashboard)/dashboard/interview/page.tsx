"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, Loader2, X, Plus, Users, Code, Puzzle, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Question {
  question: string;
  idealAnswer: string;
  followUp?: string;
}

interface InterviewResult {
  id: string;
  hrQuestions: Question[];
  technicalQuestions: Question[];
  scenarioQuestions: Question[];
  remaining: number;
}

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleGenerate() {
    if (!role || !experience || skills.length === 0) {
      setError("Please fill in all fields and add at least one skill.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setRateLimited(false);

    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, experience: parseInt(experience), skills }),
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

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Interview Prep Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate role-specific interview questions with ideal answers and follow-ups.
        </p>
      </div>

      {/* Rate Limit Paywall */}
      {rateLimited && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">You&apos;ve hit your daily limit</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Free accounts get 3 AI generations per day. Upgrade to Pro for unlimited interview prep sessions.
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
            <CardTitle className="text-lg">Your Profile</CardTitle>
            <CardDescription>Enter your details to generate personalized interview questions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Input
                  placeholder="e.g., Senior Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  placeholder="e.g., 3"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a skill and press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Questions...</>
              ) : (
                <><MessageSquare className="mr-2 h-4 w-4" /> Generate Interview Questions</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating questions...</h3>
            <p className="text-muted-foreground">Our AI is crafting role-specific interview questions for you.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{role} Interview Prep</h2>
              <p className="text-sm text-muted-foreground">{experience} years experience</p>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); setRateLimited(false); }}>
              New Generation
            </Button>
          </div>

          <Tabs defaultValue="hr" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hr"><Users className="h-4 w-4 mr-1" /> HR</TabsTrigger>
              <TabsTrigger value="technical"><Code className="h-4 w-4 mr-1" /> Technical</TabsTrigger>
              <TabsTrigger value="scenario"><Puzzle className="h-4 w-4 mr-1" /> Scenario</TabsTrigger>
            </TabsList>

            {(["hr", "technical", "scenario"] as const).map((type) => {
              const questions = type === "hr" ? result.hrQuestions : type === "technical" ? result.technicalQuestions : result.scenarioQuestions;
              return (
                <TabsContent key={type} value={type}>
                  <Accordion type="single" collapsible className="space-y-2">
                    {questions.map((q, i) => (
                      <AccordionItem key={i} value={`${type}-${i}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left">
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="shrink-0">Q{i + 1}</Badge>
                            <span className="text-sm">{q.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">IDEAL ANSWER:</p>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg">{q.idealAnswer}</p>
                          </div>
                          {q.followUp && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">FOLLOW-UP QUESTION:</p>
                              <p className="text-sm bg-primary/5 p-3 rounded-lg">{q.followUp}</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              );
            })}
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
                      Pro users generate unlimited interview prep for every role they apply to.
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
