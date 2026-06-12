import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { z } from "zod/v4";
import { sanitizeText, validatePassword, LIMITS } from "@/lib/validation";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(LIMITS.NAME_MAX),
  email: z.email("Invalid email address").max(LIMITS.EMAIL_MAX),
  password: z.string().min(LIMITS.PASSWORD_MIN).max(LIMITS.PASSWORD_MAX),
});

export async function POST(request: Request) {
  try {
    // Check content-type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Limit request body size (prevent DoS)
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Sanitize inputs
    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = email.toLowerCase().trim();

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Check for existing user (case-insensitive)
    const existingUser = await db.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and profile in a transaction
    const user = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          hashedPassword,
        },
      });

      await tx.profile.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "user.registered",
        metadata: { method: "credentials" },
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}
