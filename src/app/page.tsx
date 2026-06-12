"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FileText, MessageSquare, Map, ArrowRight, Check, Sparkles,
  Star, Zap, Shield, ChevronRight, Crown,
} from "lucide-react";

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  function handleEmailCapture(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setEmailSubmitted(true);
      // In production: send to your email list / waitlist API
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">CareerBoost AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">See It In Action</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="container mx-auto relative px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <div>
                <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
                  <Zap className="h-3 w-3 mr-1" /> Powered by Advanced AI
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                  Land More Interviews.{" "}
                  <span className="text-primary">Get the Job.</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Stop guessing why you&apos;re not getting callbacks. Our AI analyzes your resume
                  against real ATS systems, generates interview prep tailored to your role, and builds
                  a personalized 90-day career roadmap.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="xl" asChild>
                    <Link href="/register">
                      Analyze My Resume Free <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild>
                    <Link href="#demo">Watch Demo</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> 3 free analyses/day
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Results in 30 seconds
                  </div>
                </div>
              </div>

              {/* Right: Dashboard Preview */}
              <div className="relative hidden lg:block">
                <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-muted-foreground">careerboost.ai/dashboard</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Resume Analysis Results</span>
                      <Badge variant="secondary" className="text-xs">Just now</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-24 w-24 shrink-0">
                        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${85 * 2.51} ${100 * 2.51}`} className="text-green-500" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-green-600">85</span>
                        </div>
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-xs">Strong action verbs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-xs">Quantified achievements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-yellow-600">⚠</span>
                          <span className="text-xs">Missing 3 keywords for target role</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500">✕</span>
                          <span className="text-xs">Summary too generic</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">AI-REWRITTEN SUMMARY:</p>
                      <div className="bg-primary/5 rounded-lg p-3 text-xs leading-relaxed text-muted-foreground">
                        &quot;Results-driven Senior Frontend Developer with 5+ years building scalable React applications.
                        Led migration of legacy jQuery codebase reducing load time by 40%...&quot;
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-lg px-4 py-2 shadow-lg text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI-Powered Analysis
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="border-y py-8 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              <p className="text-sm text-muted-foreground font-medium">Trusted by professionals at</p>
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-bold text-muted-foreground/50">
                <span>Google</span>
                <span>Meta</span>
                <span>Amazon</span>
                <span>Microsoft</span>
                <span>Stripe</span>
                <span>Shopify</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Three Tools. One Platform.</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Land Your Dream Job
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Most job seekers apply blindly. You&apos;ll apply with data, preparation, and a plan.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  title: "Resume ATS Scanner",
                  desc: "Get an instant ATS compatibility score, find hidden weaknesses, and let AI rewrite your weakest sections to beat the bots.",
                  features: ["ATS Score (0-100)", "Keyword Gap Analysis", "AI Bullet Rewrites", "Summary Optimization"],
                  highlight: "Most users improve their score by 25+ points",
                },
                {
                  icon: MessageSquare,
                  title: "Interview Prep AI",
                  desc: "Generate HR, technical, and scenario-based questions for your exact role — with ideal answers and follow-ups.",
                  features: ["Role-Specific Questions", "Ideal Answer Templates", "Follow-Up Questions", "Behavioral + Technical"],
                  highlight: "Covers 3 question categories per role",
                },
                {
                  icon: Map,
                  title: "Career Roadmap",
                  desc: "Get a personalized 30-60-90 day plan to transition from your current role to your dream role with specific resources.",
                  features: ["90-Day Action Plans", "Certification Guide", "Project Portfolio Ideas", "Daily Study Schedule"],
                  highlight: "Includes specific courses and certifications",
                },
              ].map((f, i) => (
                <Card key={i} className="group hover:shadow-lg transition-all hover:border-primary/20 relative">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">{f.desc}</p>
                    <ul className="space-y-2 text-sm mb-4">
                      {f.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {feat}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-primary font-medium bg-primary/5 rounded-md px-3 py-2">
                      {f.highlight}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* See It In Action - Demo Section */}
        <section id="demo" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">See It In Action</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">From Weak Resume to Interview-Ready in 30 Seconds</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Here&apos;s what happens when you paste your resume into CareerBoost AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Before */}
              <Card className="border-red-200 dark:border-red-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="destructive">Before</Badge>
                    <span className="text-sm text-muted-foreground">ATS Score: 42/100</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground mb-1">SUMMARY:</p>
                      <p className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-muted-foreground border border-red-100 dark:border-red-900/30">
                        &quot;Looking for a challenging position where I can use my skills and grow professionally.&quot;
                      </p>
                      <p className="text-xs text-red-600 mt-1">✕ Generic, no specifics, no metrics</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground mb-1">BULLET POINT:</p>
                      <p className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-muted-foreground border border-red-100 dark:border-red-900/30">
                        &quot;Responsible for managing team projects and helping with development.&quot;
                      </p>
                      <p className="text-xs text-red-600 mt-1">✕ No metrics, weak action verb, vague</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border-green-200 dark:border-green-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-green-600 hover:bg-green-700">After</Badge>
                    <span className="text-sm text-muted-foreground">ATS Score: 87/100</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground mb-1">AI-REWRITTEN SUMMARY:</p>
                      <p className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                        &quot;Senior Full-Stack Developer with 6+ years building scalable SaaS platforms serving 100K+ users.
                        Led cross-functional team of 8 engineers, reducing deployment time by 60%.&quot;
                      </p>
                      <p className="text-xs text-green-600 mt-1">✓ Specific, metrics-driven, keyword-rich</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground mb-1">AI-REWRITTEN BULLET:</p>
                      <p className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                        &quot;Directed 8-person engineering team across 3 concurrent product launches, implementing
                        CI/CD pipelines that reduced deployment cycles from 2 weeks to 2 days.&quot;
                      </p>
                      <p className="text-xs text-green-600 mt-1">✓ Strong verb, quantified impact, specific scope</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link href="/register">
                  Try It On Your Resume <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">From Sign-Up to Results in Under 2 Minutes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Create Free Account", desc: "Sign up with Google or email in 10 seconds. No credit card needed." },
                { step: "2", title: "Paste Your Resume", desc: "Copy-paste your resume text. Our AI scans it against real ATS criteria." },
                { step: "3", title: "Get Actionable Results", desc: "Receive your score, rewritten sections, and specific improvements in 30 seconds." },
              ].map((s, i) => (
                <div key={i} className="text-center relative">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-muted-foreground/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interview + Roadmap Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Not Just Resumes. Complete Interview & Career Toolkit.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Interview Preview */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Interview Prep Sample</span>
                  </div>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Q: TECHNICAL</p>
                      <p className="text-sm font-medium mb-2">&quot;How would you design a real-time notification system for 1M+ users?&quot;</p>
                      <p className="text-xs text-muted-foreground">+ Ideal answer template with key points to cover</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Q: BEHAVIORAL</p>
                      <p className="text-sm font-medium mb-2">&quot;Tell me about a time you disagreed with a technical decision.&quot;</p>
                      <p className="text-xs text-muted-foreground">+ STAR-format answer framework included</p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Q: SCENARIO</p>
                      <p className="text-sm font-medium mb-2">&quot;Your production system goes down during peak traffic. Walk me through your response.&quot;</p>
                      <p className="text-xs text-muted-foreground">+ Follow-up questions included</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Preview */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Map className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Career Roadmap Sample</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Badge variant="outline" className="shrink-0">30d</Badge>
                      <div>
                        <p className="text-sm font-medium">Master system design fundamentals</p>
                        <p className="text-xs text-muted-foreground">Complete &quot;Designing Data-Intensive Applications&quot;</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Badge variant="outline" className="shrink-0">60d</Badge>
                      <div>
                        <p className="text-sm font-medium">Build 2 portfolio projects + AWS cert</p>
                        <p className="text-xs text-muted-foreground">Deploy a distributed system to production</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <Badge variant="outline" className="shrink-0">90d</Badge>
                      <div>
                        <p className="text-sm font-medium">Apply to Senior/Staff roles with confidence</p>
                        <p className="text-xs text-muted-foreground">Leverage new skills + portfolio for interviews</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-1">+ Daily study schedule, project ideas, certification guide</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Free. Upgrade When You&apos;re Hooked.</h2>
              <p className="text-muted-foreground mb-6">No contracts. Cancel anytime. 30-day money-back guarantee.</p>

              {/* Annual Toggle */}
              <div className="flex items-center justify-center gap-3 mb-12">
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
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-1">Free</h3>
                  <p className="text-sm text-muted-foreground mb-4">For casual job seekers</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/forever</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      "3 AI generations per day",
                      "Resume ATS scoring",
                      "Basic interview questions",
                      "Career roadmap overview",
                      "7-day saved history",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro */}
              <Card className="border-primary shadow-lg relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-1">Pro</h3>
                  <p className="text-sm text-muted-foreground mb-4">For serious career advancement</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">${annual ? "8" : "12"}</span>
                    <span className="text-muted-foreground">/{annual ? "month (billed annually)" : "month"}</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-green-600 font-medium mb-4">
                      $96/year — save $48 vs monthly
                    </p>
                  )}
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
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/register">
                      <Crown className="mr-2 h-4 w-4" />
                      {annual ? "Start Annual Plan" : "Start Pro Trial"}
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" /> 30-day money-back guarantee
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial under pricing */}
            <div className="max-w-lg mx-auto mt-12 text-center">
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic mb-3">
                &quot;I upgraded to Pro after my first resume analysis showed me exactly what I was doing wrong.
                Got 3 interview callbacks in the first week after applying the AI rewrites.&quot;
              </p>
              <p className="text-sm font-medium">— Sarah C., Software Engineer</p>
            </div>
          </div>
        </section>

        {/* Email Capture / Waitlist */}
        <section className="py-16 bg-primary/5 border-y">
          <div className="container mx-auto px-4 max-w-xl text-center">
            <h2 className="text-2xl font-bold mb-2">Not Ready Yet? Get Free Career Tips.</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Join 2,000+ professionals receiving weekly AI-powered career tips, resume hacks, and interview strategies.
            </p>
            {emailSubmitted ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4">
                <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">You&apos;re on the list! Check your inbox for a welcome email.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailCapture} className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" size="lg">
                  Get Free Tips <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "How does the Resume Analyzer work?", a: "Our AI analyzes your resume against ATS (Applicant Tracking System) criteria used by 99% of Fortune 500 companies. It scores formatting, keywords, content quality, and structure — then rewrites your weakest sections." },
                { q: "Is the ATS score accurate?", a: "Yes. We score against the same criteria used by Workday, Greenhouse, Lever, and other major ATS platforms. Most users see their callback rate improve by 2-3x after implementing our suggestions." },
                { q: "What types of interview questions are generated?", a: "We generate three categories: HR/behavioral questions (using STAR format), Technical questions (role-specific coding, system design, domain knowledge), and Scenario questions (hypothetical workplace situations). Each comes with ideal answer frameworks and follow-ups." },
                { q: "How personalized is the Career Roadmap?", a: "The roadmap is tailored to your current role, target role, experience level, and existing skills. It includes specific courses (Coursera, Udemy, etc.), project ideas you can build this weekend, relevant certifications, and a daily study schedule for 30, 60, and 90 days." },
                { q: "What happens when I hit my free daily limit?", a: "You'll see your remaining credits on the dashboard. When you hit the limit, you can come back tomorrow or upgrade to Pro for unlimited access. You'll never lose access to previously generated content." },
                { q: "Can I cancel my Pro subscription anytime?", a: "Absolutely. Cancel with one click in your settings. No contracts, no hidden fees. Plus, we offer a 30-day money-back guarantee — if Pro doesn't help you land more interviews, we'll refund you." },
                { q: "Is my data safe and private?", a: "Yes. We use industry-standard encryption, never share your data with third parties, never use your resume to train AI models, and you can delete your account and all associated data at any time." },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Next Job Is One Resume Away</h2>
            <p className="mb-8 max-w-xl mx-auto opacity-90">
              Join thousands of professionals who stopped guessing and started getting callbacks.
              Your first analysis is free.
            </p>
            <Button size="xl" variant="secondary" asChild>
              <Link href="/register">
                Analyze My Resume Free <ChevronRight className="ml-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">CareerBoost AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered career tools that help you land more interviews and get the job.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Resume ATS Scanner</Link></li>
                <li><Link href="#features" className="hover:text-foreground">Interview Prep AI</Link></li>
                <li><Link href="#features" className="hover:text-foreground">Career Roadmap</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#demo" className="hover:text-foreground">See It In Action</Link></li>
                <li><Link href="#faq" className="hover:text-foreground">FAQ</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CareerBoost AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
