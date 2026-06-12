import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCareerRoadmap } from "@/lib/ai";
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

    const { allowed, remaining, limit, windowLabel } = await checkRateLimit(session.user.id, user.plan, "CAREER_ROADMAP");
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for higher limits.", remaining, limit, windowLabel },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { currentRole, targetRole, experience, currentSkills } = body;

    // Input validation
    if (!currentRole || typeof currentRole !== "string") {
      return NextResponse.json({ error: "Current role is required." }, { status: 400 });
    }
    if (!targetRole || typeof targetRole !== "string") {
      return NextResponse.json({ error: "Target role is required." }, { status: 400 });
    }
    if (currentRole.length > LIMITS.ROLE_MAX) {
      return NextResponse.json({ error: `Current role must be under ${LIMITS.ROLE_MAX} characters.` }, { status: 400 });
    }
    if (targetRole.length > LIMITS.ROLE_MAX) {
      return NextResponse.json({ error: `Target role must be under ${LIMITS.ROLE_MAX} characters.` }, { status: 400 });
    }
    if (experience === undefined || typeof experience !== "number" || experience < 0 || experience > LIMITS.EXPERIENCE_MAX) {
      return NextResponse.json({ error: `Experience must be between 0 and ${LIMITS.EXPERIENCE_MAX}.` }, { status: 400 });
    }
    if (!Array.isArray(currentSkills) || currentSkills.length === 0) {
      return NextResponse.json({ error: "At least one skill is required." }, { status: 400 });
    }
    if (currentSkills.length > LIMITS.SKILLS_MAX_COUNT) {
      return NextResponse.json({ error: `Maximum ${LIMITS.SKILLS_MAX_COUNT} skills allowed.` }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedCurrentRole = sanitizeText(currentRole);
    const sanitizedTargetRole = sanitizeText(targetRole);
    const sanitizedSkills = currentSkills
      .filter((s: unknown) => typeof s === "string")
      .map((s: string) => sanitizeText(s))
      .filter((s: string) => s.length > 0 && s.length <= LIMITS.SKILL_MAX)
      .slice(0, LIMITS.SKILLS_MAX_COUNT);

    if (sanitizedSkills.length === 0) {
      return NextResponse.json({ error: "No valid skills provided." }, { status: 400 });
    }

    // Generate with timeout
    const roadmap = await Promise.race([
      generateCareerRoadmap(sanitizedCurrentRole, sanitizedTargetRole, experience, sanitizedSkills),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out")), 60_000)
      ),
    ]);

    const saved = await db.roadmap.create({
      data: {
        userId: session.user.id,
        currentRole: sanitizedCurrentRole,
        targetRole: sanitizedTargetRole,
        experience,
        currentSkills: sanitizedSkills,
        thirtyDayPlan: JSON.parse(JSON.stringify(roadmap.thirtyDayPlan)),
        sixtyDayPlan: JSON.parse(JSON.stringify(roadmap.sixtyDayPlan)),
        ninetyDayPlan: JSON.parse(JSON.stringify(roadmap.ninetyDayPlan)),
        certifications: roadmap.certifications.map((c: { name: string; provider: string; relevance: string }) => `${c.name} (${c.provider})`),
        projectIdeas: roadmap.projectIdeas.map((p: { title: string; description: string }) => `${p.title}: ${p.description}`),
        dailySchedule: JSON.parse(JSON.stringify(roadmap.dailySchedule)),
      },
    });

    await recordUsage(session.user.id, "CAREER_ROADMAP");

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "roadmap.generated",
        metadata: { id: saved.id, from: sanitizedCurrentRole, to: sanitizedTargetRole },
      },
    });

    return NextResponse.json({
      id: saved.id,
      ...roadmap,
      remaining: remaining - 1,
      limit,
      windowLabel,
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
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
      { error: "Failed to generate career roadmap. Please try again." },
      { status: 500 }
    );
  }
}
