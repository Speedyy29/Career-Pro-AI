"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, Check, X, Lightbulb, Copy, CheckCircle, Crown, ArrowRight, Upload, FileUp } from "lucide-react";
import Link from "next/link";

interface AnalysisResult {
  id: string;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rewrittenSections: {
    summary?: string;
    bulletPoints?: { original: string; rewritten: string }[];
    skills?: string;
  };
  remaining: number;
  limit: number;
  windowLabel: string;
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // PDF upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (resumeText.trim().length < 50) {
      setError("Please paste at least 50 characters of your resume.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setRateLimited(false);

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
          setError(data.error || "Daily limit reached.");
        } else {
          setError(data.error || "Analysis failed");
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

  async function handlePdfUpload() {
    if (!selectedFile) {
      setUploadError("Please select a PDF file.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(uploadData.error || "Failed to upload PDF.");
        return;
      }

      // Auto-fill the extracted text and switch to paste tab for review
      setResumeText(uploadData.text);
      setUploadError("");
      setSelectedFile(null);
    } catch {
      setUploadError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(file: File | null) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 5MB.");
      return;
    }
    setSelectedFile(file);
    setUploadError("");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function copyText(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Resume Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">
          Paste your resume text or upload a PDF for AI-powered ATS analysis and improvement suggestions.
        </p>
      </div>

      {/* Rate Limit Paywall */}
      {rateLimited && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-8 text-center">
            <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">You&apos;ve hit your daily limit</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Free accounts get 3 resume analyses per day. Upgrade to Pro for 50 analyses per month,
              all templates, PDF export, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard/pricing">
                  <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro — ₹199/mo
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
        <Tabs defaultValue="paste" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Paste Resume
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload PDF
            </TabsTrigger>
          </TabsList>

          {/* Paste Resume Tab */}
          <TabsContent value="paste">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paste Your Resume</CardTitle>
                <CardDescription>
                  Copy your resume text and paste it below. The more complete the resume, the better the analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your full resume text here... Include your summary, experience, skills, and education sections for best results."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                {error && !rateLimited && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {resumeText.length} characters {resumeText.length < 50 && "(minimum 50)"}
                  </p>
                  <Button onClick={handleAnalyze} disabled={loading || resumeText.length < 50}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload PDF Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload PDF Resume</CardTitle>
                <CardDescription>
                  Upload your resume as a PDF file. We&apos;ll extract the text and analyze it for ATS compatibility. Maximum file size: 5MB.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                  `}
                >
                  <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Drop your PDF here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF files only, up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                </div>

                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting text from PDF...
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button
                    onClick={handlePdfUpload}
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Extract & Analyze
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  After extraction, the text will appear in the Paste Resume tab for review before analysis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {loading && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analyzing your resume...</h3>
            <p className="text-muted-foreground text-sm">Our AI is scanning your resume for ATS compatibility, keyword gaps, and improvement areas.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          {/* ATS Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">ATS Score</CardTitle>
                <Button variant="outline" size="sm" onClick={() => { setResult(null); setResumeText(""); setRateLimited(false); }}>
                  New Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={`text-5xl font-bold ${getScoreColor(result.atsScore)}`}>
                  {result.atsScore}
                </div>
                <div className="flex-1">
                  <Progress value={result.atsScore} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {result.atsScore >= 80 ? "Excellent! Your resume is well-optimized for ATS." :
                     result.atsScore >= 60 ? "Good, but there are areas for improvement." :
                     "Your resume needs significant work to pass ATS screening."}
                  </p>
                </div>
              </div>
              {result.limit > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {result.remaining} of {result.limit} analyses remaining {result.windowLabel}
                </p>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="analysis" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="rewrites">Rewrites</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <X className="h-5 w-5 text-red-600" /> Weaknesses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewrites Tab */}
            <TabsContent value="rewrites" className="space-y-4">
              {result.rewrittenSections.summary && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Professional Summary</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => copyText(result.rewrittenSections.summary!, 100)}>
                        {copiedIndex === 100 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-muted/50 p-4 rounded-lg">{result.rewrittenSections.summary}</p>
                  </CardContent>
                </Card>
              )}
              {result.rewrittenSections.bulletPoints?.map((bp, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Bullet Point {i + 1}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => copyText(bp.rewritten, i)}>
                        {copiedIndex === i ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Original:</p>
                      <p className="text-sm text-muted-foreground line-through">{bp.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Rewritten:</p>
                      <p className="text-sm font-medium bg-muted/50 p-3 rounded-lg">{bp.rewritten}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" /> Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/30">
                        <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contextual Upgrade Prompt - shown after results */}
          {result.remaining <= 1 && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">
                        {result.remaining === 0 ? "Last credit used!" : `${result.remaining} credit remaining ${result.windowLabel}`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pro users get 50 analyses/month, all templates, PDF export, and more.
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
