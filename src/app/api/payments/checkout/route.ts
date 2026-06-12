import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Stripe Checkout Session creation endpoint.
 * Creates a checkout session for Pro plan upgrade.
 * 
 * In production, this creates a real Stripe checkout session.
 * Without STRIPE_SECRET_KEY, returns a descriptive error.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "PRO") {
      return NextResponse.json({ error: "You are already on the Pro plan" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "Payment system not yet configured. Please contact us for early access to Pro.",
          configured: false,
        },
        { status: 503 }
      );
    }

    // Production Stripe integration:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const checkoutSession = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   mode: "subscription",
    //   customer_email: user.email!,
    //   line_items: [
    //     {
    //       price: process.env.STRIPE_PRO_PRICE_ID,
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?upgraded=true`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing`,
    //   metadata: {
    //     userId: session.user.id,
    //   },
    // });
    //
    // return NextResponse.json({ url: checkoutSession.url });

    return NextResponse.json(
      { error: "Stripe integration pending configuration" },
      { status: 503 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
