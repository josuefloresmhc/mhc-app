import Stripe from "stripe";
import { NextResponse } from "next/server";

// Run on the Node.js runtime (the Stripe SDK needs it).
export const runtime = "nodejs";
// Every visitor needs their own fresh Checkout session — never cache this.
export const dynamic = "force-dynamic";

const PRICE_USD_CENTS = 700; // $7

// Starts a Stripe Checkout session for 7-day access. No account, no login,
// just card + email collected by Stripe itself. GET so the landing page's
// button can be a plain link.
export async function GET(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Server is missing STRIPE_SECRET_KEY. Add it and try again." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRICE_USD_CENTS,
            product_data: {
              name: "Midnight Hour Content Generator — 7-Day Access",
              description:
                "Unlimited use of the client avatar, hook bank, CTA bank, and script generator for 7 days.",
            },
          },
        },
      ],
      success_url: `${origin}/api/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
