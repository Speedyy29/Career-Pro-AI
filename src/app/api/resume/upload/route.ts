import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { LIMITS } from "@/lib/validation";
export async function POST(request: Request) {
  // Polyfill browser globals required by pdf-parse when running in Node.js
  if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {};
  }
  if (typeof global.ImageData === "undefined") {
    // @ts-ignore
    global.ImageData = class ImageData {};
  }
  if (typeof global.Path2D === "undefined") {
    // @ts-ignore
    global.Path2D = class Path2D {};
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed. Please upload a .pdf file." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > LIMITS.PDF_MAX_SIZE) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${LIMITS.PDF_MAX_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    let data;
    try {
      data = await pdfParse(buffer);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse PDF. The file may be corrupted, password-protected, or a scanned image. Please try a different PDF or paste your resume text instead." },
        { status: 422 }
      );
    }

    const text = data.text?.trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from this PDF. It may be a scanned image or password-protected. Please try a text-based PDF or paste your resume text instead." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      pageCount: data.numpages,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF. Please try again." },
      { status: 500 }
    );
  }
}
