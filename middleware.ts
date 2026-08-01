import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/accessToken";

// Gates the tool itself and every generation endpoint behind the signed
// 7-day access cookie set by /api/unlock after a paid Stripe Checkout.
// Everything else (the landing page, /api/checkout, /api/unlock) stays open.
export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/api/generate",
    "/api/generate-scripts",
    "/api/parse-intake",
  ],
};

// Every response this middleware produces must be uncacheable. Without this,
// a CDN or browser could cache one person's redirect (or one person's
// authorized pass-through) and serve it to someone else entirely, which
// would either lock out a paying customer or, worse, let a non-payer in.
function withNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    console.error("ACCESS_TOKEN_SECRET is not set — denying access.");
    return withNoStore(
      isApi
        ? NextResponse.json({ error: "Server misconfigured." }, { status: 500 })
        : NextResponse.redirect(new URL("/", req.url)),
    );
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const valid = token ? await verifyAccessToken(token, secret) : false;

  if (!valid) {
    return withNoStore(
      isApi
        ? NextResponse.json(
            { error: "Your 7-day access has expired. Purchase access again to continue." },
            { status: 401 },
          )
        : NextResponse.redirect(new URL("/?access=expired", req.url)),
    );
  }

  return withNoStore(NextResponse.next());
}
