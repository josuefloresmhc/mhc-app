import Stripe from "stripe";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_WINDOW_MS, createAccessToken } from "@/lib/accessToken";

// Run on the Node.js runtime (the Stripe SDK needs it).
export const runtime = "nodejs";
// This sets a per-person cookie — it must never be cached and replayed to
// someone else.
export const dynamic = "force-dynamic";

// Stripe redirects the browser here after a successful checkout. We verify
// the session actually paid, then set a signed 7-day access cookie and send
// the person straight into /app. No account is created anywhere.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!sessionId || !secretKey || !accessSecret) {
    return NextResponse.redirect(new URL("/?checkout=error", req.url));
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(new URL("/?checkout=unpaid", req.url));
    }

    const expiresAt = Date.now() + ACCESS_WINDOW_MS;
    const token = await createAccessToken(expiresAt, accessSecret);

    const response = NextResponse.redirect(new URL("/app", req.url));
    response.cookies.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL("/?checkout=error", req.url));
  }
}
