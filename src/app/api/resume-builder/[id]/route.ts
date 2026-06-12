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

    const { id } = await params;
    const resume = await db.generatedResume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await db.generatedResume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Build update data from provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "fullName", "email", "phone", "linkedin", "location",
      "summary", "skills", "experience", "education",
      "projects", "certifications", "template", "content", "isDraft",
    ];

    for (const field of allowedFields) {
      if (field in body) {
        if (["experience", "education", "projects", "certifications", "content"].includes(field)) {
          updateData[field] = body[field] ? JSON.parse(JSON.stringify(body[field])) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updated = await db.generatedResume.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.generatedResume.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
