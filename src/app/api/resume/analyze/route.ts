import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeResume } from "@/lib/ai";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";
import { sanitizeText, LIMITS } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check rate limit
    const { allowed, remaining, limit, windowLabel } = await checkRateLimit(session.user.id, user.plan, "RESUME_ANALYSIS");
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for higher limits.", remaining, limit, windowLabel },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { resumeText } = body;

    // Input validation with size limits
    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    if (resumeText.length > LIMITS.RESUME_TEXT_MAX) {
      return NextResponse.json(
        { error: `Resume text is too long. Maximum ${LIMITS.RESUME_TEXT_MAX.toLocaleString()} characters allowed.` },
        { status: 400 }
      );
    }

    if (resumeText.trim().length < LIMITS.RESUME_TEXT_MIN) {
      return NextResponse.json(
        { error: "Resume text is too short. Please provide at least 50 characters." },
        { status: 400 }
      );
    }

    // Sanitize input (strip HTML tags, control chars)
    const sanitizedResume = sanitizeText(resumeText);

    // Analyze resume with AI (with timeout)
    const analysis = await Promise.race([
      analyzeResume(sanitizedResume),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out")), 60_000)
      ),
    ]);

    // Save to database
    const saved = await db.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        inputText: sanitizedResume,
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        rewrittenSections: JSON.parse(JSON.stringify(analysis.rewrittenSections)),
      },
    });

    // Record usage
    await recordUsage(session.user.id, "RESUME_ANALYSIS");

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "resume.analyzed",
        metadata: { id: saved.id, atsScore: analysis.atsScore },
      },
    });

    return NextResponse.json({
      id: saved.id,
      ...analysis,
      remaining: remaining - 1,
      limit,
      windowLabel,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    const msg = error instanceof Error ? error.message : "";
    const body = error instanceof Error && "responseBody" in error ? String((error as Record<string, unknown>).responseBody ?? "") : "";
    if (msg.includes("timed out")) {
      return NextResponse.json(
        { error: "Analysis took too long. Please try again with a shorter resume." },
        { status: 504 }
      );
    }
    if (msg.includes("quota") || body.includes("RESOURCE_EXHAUSTED") || body.includes("429")) {
      return NextResponse.json(
        { error: "Our AI is temporarily at capacity. Please wait 1-2 minutes and try again." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
