import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

/**
 * Forgot password endpoint.
 * Generates a reset token and would send an email in production.
 * For security, always returns success to prevent email enumeration.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.hashedPassword) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      // Store the token in the verification tokens table
      await db.verificationToken.create({
        data: {
          identifier: user.email!,
          token,
          expires,
        },
      });

      // In production, send an email with the reset link here:
      // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      // await sendEmail(user.email, "Reset your CareerBoost AI password", resetUrl);

      // Audit log
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "password.reset_requested",
        },
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return success to prevent enumeration
    return NextResponse.json({ success: true });
  }
}
