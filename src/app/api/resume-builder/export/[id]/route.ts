import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Pro (PDF export is Pro-only)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan !== "PRO") {
      return NextResponse.json(
        { error: "PDF export is only available for Pro users." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const resume = await db.generatedResume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Dynamic import to avoid bundling @react-pdf/renderer in client
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { createElement } = await import("react");
    const { getTemplateComponent } = await import("@/components/resume-builder/templates");

    const TemplateComponent = getTemplateComponent(resume.template);
    if (!TemplateComponent) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const resumeData = {
      fullName: resume.fullName,
      email: resume.email,
      phone: resume.phone,
      linkedin: resume.linkedin,
      location: resume.location,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience as Record<string, unknown>[] | null,
      education: resume.education as Record<string, unknown>[] | null,
      projects: resume.projects as Record<string, unknown>[] | null,
      certifications: resume.certifications as Record<string, unknown>[] | null,
    };

    const element = TemplateComponent({ data: resumeData });
    const buffer = await renderToBuffer(element);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.fullName.replace(/[^a-zA-Z0-9 ]/g, "")}_Resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}
