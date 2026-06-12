import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/ai";
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

    const { allowed, remaining, limit, windowLabel } = await checkRateLimit(session.user.id, user.plan, "INTERVIEW_PREP");
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for higher limits.", remaining, limit, windowLabel },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { role, experience, skills } = body;

    // Input validation
    if (!role || typeof role !== "string") {
      return NextResponse.json({ error: "Role is required." }, { status: 400 });
    }
    if (role.length > LIMITS.ROLE_MAX) {
      return NextResponse.json({ error: `Role name must be under ${LIMITS.ROLE_MAX} characters.` }, { status: 400 });
    }
    if (experience === undefined || typeof experience !== "number" || experience < 0 || experience > LIMITS.EXPERIENCE_MAX) {
      return NextResponse.json({ error: `Experience must be between 0 and ${LIMITS.EXPERIENCE_MAX}.` }, { status: 400 });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "At least one skill is required." }, { status: 400 });
    }
    if (skills.length > LIMITS.SKILLS_MAX_COUNT) {
      return NextResponse.json({ error: `Maximum ${LIMITS.SKILLS_MAX_COUNT} skills allowed.` }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedRole = sanitizeText(role);
    const sanitizedSkills = skills
      .filter((s: unknown) => typeof s === "string")
      .map((s: string) => sanitizeText(s))
      .filter((s: string) => s.length > 0 && s.length <= LIMITS.SKILL_MAX)
      .slice(0, LIMITS.SKILLS_MAX_COUNT);

    if (sanitizedSkills.length === 0) {
      return NextResponse.json({ error: "No valid skills provided." }, { status: 400 });
    }

    // Generate with timeout
    const questions = await Promise.race([
      generateInterviewQuestions(sanitizedRole, experience, sanitizedSkills),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out")), 60_000)
      ),
    ]);

    const saved = await db.interviewSession.create({
      data: {
        userId: session.user.id,
        role: sanitizedRole,
        experience,
        skills: sanitizedSkills,
        hrQuestions: JSON.parse(JSON.stringify(questions.hrQuestions)),
        technicalQuestions: JSON.parse(JSON.stringify(questions.technicalQuestions)),
        scenarioQuestions: JSON.parse(JSON.stringify(questions.scenarioQuestions)),
      },
    });

    await recordUsage(session.user.id, "INTERVIEW_PREP");

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "interview.generated",
        metadata: { id: saved.id, role: sanitizedRole },
      },
    });

    return NextResponse.json({
      id: saved.id,
      ...questions,
      remaining: remaining - 1,
      limit,
      windowLabel,
    });
  } catch (error) {
    console.error("Interview generation error:", error);
    const msg = error instanceof Error ? error.message : "";
    const body = error instanceof Error && "responseBody" in error ? String((error as Record<string, unknown>).responseBody ?? "") : "";
    if (msg.includes("timed out")) {
      return NextResponse.json(
        { error: "Generation took too long. Please try again." },
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
      { error: "Failed to generate interview questions. Please try again." },
      { status: 500 }
    );
  }
}
