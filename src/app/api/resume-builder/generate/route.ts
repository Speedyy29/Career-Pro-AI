import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateResumeContent } from "@/lib/ai";
import { checkRateLimit, recordUsage } from "@/lib/rate-limit";
import { sanitizeText, LIMITS } from "@/lib/validation";

const FREE_TEMPLATES = ["ModernATS", "Minimal"];
const PRO_TEMPLATES = ["ModernATS", "Minimal", "Executive", "Consulting", "Big4Professional"];

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
    const { allowed, remaining, limit, windowLabel } = await checkRateLimit(session.user.id, user.plan, "RESUME_BUILD");
    if (!allowed) {
      return NextResponse.json(
        { error: "Resume builder limit reached. Upgrade to Pro for 20 generations/month.", remaining, limit, windowLabel },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { fullName, email, phone, linkedin, location, summary, skills, experience, education, projects, certifications, template, isDraft } = body;

    // Validate required fields
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Validate template access
    const allowedTemplates = user.plan === "PRO" ? PRO_TEMPLATES : FREE_TEMPLATES;
    const selectedTemplate = template || "ModernATS";
    if (!allowedTemplates.includes(selectedTemplate)) {
      return NextResponse.json(
        { error: "This template is only available for Pro users." },
        { status: 403 }
      );
    }

    // Sanitize inputs
    const sanitizedInput = {
      fullName: sanitizeText(fullName).slice(0, LIMITS.NAME_MAX),
      email: sanitizeText(email).slice(0, LIMITS.EMAIL_MAX),
      phone: phone ? sanitizeText(phone).slice(0, 20) : undefined,
      linkedin: linkedin ? sanitizeText(linkedin).slice(0, 200) : undefined,
      location: location ? sanitizeText(location).slice(0, 100) : undefined,
      summary: summary ? sanitizeText(summary).slice(0, LIMITS.RESUME_BUILDER_SUMMARY_MAX) : undefined,
      skills: Array.isArray(skills) ? skills.filter((s: unknown) => typeof s === "string").map((s: string) => sanitizeText(s)).filter(Boolean) : undefined,
      experience: experience ? sanitizeText(experience).slice(0, LIMITS.RESUME_BUILDER_EXPERIENCE_MAX) : undefined,
      education: education ? sanitizeText(education).slice(0, LIMITS.RESUME_BUILDER_EDUCATION_MAX) : undefined,
      projects: projects ? sanitizeText(projects).slice(0, LIMITS.RESUME_BUILDER_PROJECTS_MAX) : undefined,
      certifications: certifications ? sanitizeText(certifications).slice(0, LIMITS.RESUME_BUILDER_CERTIFICATIONS_MAX) : undefined,
    };

    // If saving as draft, skip AI generation
    if (isDraft) {
      const saved = await db.generatedResume.create({
        data: {
          userId: session.user.id,
          fullName: sanitizedInput.fullName,
          email: sanitizedInput.email,
          phone: sanitizedInput.phone,
          linkedin: sanitizedInput.linkedin,
          location: sanitizedInput.location,
          summary: sanitizedInput.summary,
          skills: sanitizedInput.skills || [],
          experience: experience ? JSON.parse(JSON.stringify(experience)) : undefined,
          education: education ? JSON.parse(JSON.stringify(education)) : undefined,
          projects: projects ? JSON.parse(JSON.stringify(projects)) : undefined,
          certifications: certifications ? JSON.parse(JSON.stringify(certifications)) : undefined,
          template: selectedTemplate,
          isDraft: true,
        },
      });

      return NextResponse.json({ id: saved.id, isDraft: true, remaining, limit, windowLabel });
    }

    // Generate with AI
    const content = await Promise.race([
      generateResumeContent(sanitizedInput),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI request timed out")), 60_000)
      ),
    ]);

    // Save to database
    const saved = await db.generatedResume.create({
      data: {
        userId: session.user.id,
        fullName: sanitizedInput.fullName,
        email: sanitizedInput.email,
        phone: sanitizedInput.phone,
        linkedin: sanitizedInput.linkedin,
        location: sanitizedInput.location,
        summary: content.summary,
        skills: content.skills,
        experience: JSON.parse(JSON.stringify(content.experience)),
        education: JSON.parse(JSON.stringify(content.education)),
        projects: content.projects ? JSON.parse(JSON.stringify(content.projects)) : undefined,
        certifications: content.certifications ? JSON.parse(JSON.stringify(content.certifications)) : undefined,
        template: selectedTemplate,
        content: JSON.parse(JSON.stringify(content)),
        isDraft: false,
      },
    });

    // Record usage
    await recordUsage(session.user.id, "RESUME_BUILD");

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "resume.generated",
        metadata: { id: saved.id, template: selectedTemplate },
      },
    });

    return NextResponse.json({
      id: saved.id,
      ...content,
      template: selectedTemplate,
      remaining: remaining - 1,
      limit,
      windowLabel,
    });
  } catch (error) {
    console.error("Resume builder error:", error);
    const msg = error instanceof Error ? error.message : "";
    const responseBody = error instanceof Error && "responseBody" in error ? String((error as Record<string, unknown>).responseBody ?? "") : "";
    if (msg.includes("timed out")) {
      return NextResponse.json(
        { error: "Generation took too long. Please try again with less content." },
        { status: 504 }
      );
    }
    if (msg.includes("quota") || responseBody.includes("RESOURCE_EXHAUSTED") || responseBody.includes("429")) {
      return NextResponse.json(
        { error: "Our AI is temporarily at capacity. Please wait 1-2 minutes and try again." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate resume. Please try again." },
      { status: 500 }
    );
  }
}
