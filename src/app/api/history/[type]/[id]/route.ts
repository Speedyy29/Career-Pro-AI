import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id } = await params;

    if (type === "resume") {
      await db.resumeAnalysis.delete({ where: { id, userId: session.user.id } });
    } else if (type === "interview") {
      await db.interviewSession.delete({ where: { id, userId: session.user.id } });
    } else if (type === "roadmap") {
      await db.roadmap.delete({ where: { id, userId: session.user.id } });
    } else if (type === "generated-resume") {
      await db.generatedResume.delete({ where: { id, userId: session.user.id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
