# MHC App — Session Summary (Cowork thread, through Aug 5, 2026)

Written so this thread's work can be pasted into the other Claude thread (the one with the Rich UX Academy Master Knowledge Base) and both stay in sync. This Cowork session cannot see or access that other thread directly, so this doc is the bridge.

## App identity (locked)

- **One-sentence description:** "A tool for social media agency owners that turns client onboarding answers into a ready-to-use avatar and hook bank in seconds."
- **Live URL:** https://mhc-content-system.vercel.app (landing page at `/`, the actual tool at `/app`)
- **Repo:** github.com/josuefloresmhc/mhc-app (originally created as `avif-creator`, renamed)
- **Stack:** Next.js 15.1.6, React 19, TypeScript, deployed via GitHub → Vercel auto-deploy
- **AI model:** claude-sonnet-4-6 via `@anthropic-ai/sdk`
- **No database.** Everything is stateless — form in, generation out, resets on reload. Matches the BSR cohort's "no database for V1" rule.

⚠️ **Brand color mismatch worth fixing:** the app's UI uses `#5b5bd6` (purple/indigo) as its primary accent color throughout. The Master Knowledge Base says MHC's locked brand palette is `#2d57e5` (blue), `#141516`, `#ffffff`, `#f0f1f5`. The app was never built against the real palette. Worth a pass to fix before this goes further, especially before showing it to any client or prospect.

## What's been built, in order

**Day 1 (base app):** 10-field onboarding form → generates a client avatar + 10-hook bank in one Claude API call. Deployed, GitHub → Vercel push-to-deploy confirmed working.

**Day 2 additions:**

1. **Industry dropdown** — 6 industries (Food & Beverage, Home Services & Trades, Professional Services, Health/Wellness/Fitness, Retail & E-commerce, B2B/Manufacturing/Wholesale), each with 4 extra onboarding questions, plus an "Other" option with a free-text field. Defined in `lib/industries.ts`.
2. **CTA bank** — `/api/generate` now returns 3-5 CTAs alongside the avatar and hooks (previously hooks only).
3. **Hook/CTA approval UI** — checkboxes on every hook and CTA, all checked by default, uncheck what you don't want carried forward.
4. **Script generation** — new `/api/generate-scripts` route. Generates exactly 30 scripts in the canonical framework mix (3 Promo, 8 Educational/Mindset, 6 Proof/Testimonial, 9 Authority/Personal Story, 4 Engagement/Shareable), built only from the approved hooks/CTAs.
5. **Paste-and-parse intake** — new `/api/parse-intake` route + a paste box at the top of the form. Paste a client's raw answers (e.g. copied from a Google Form response) and it auto-fills the matching fields instead of manual retyping.
6. **Mobile responsiveness** — CSS-only pass: no horizontal scroll, larger tap targets and spacing, 16px input font (prevents iOS Safari auto-zoom), one mobile breakpoint at 640px.
7. **Landing page split** — the tool moved from `/` to `/app` (byte-for-byte unchanged functionality). New marketing landing page built at `/`: headline, one-line audience/problem statement, CTA button.
8. **$7 / 7-day paywall** — Stripe Checkout (currently **test mode**), no accounts/login. A signed HMAC cookie (7-day expiry, no database) gates `/app` and all three generation API routes via `middleware.ts`. Stripe collects the payer's email itself, so that's the lead-capture mechanism.
   - **Known bug, fix pushed but not yet confirmed:** right after paying, the app worked once, then locked on refresh. Suspected cause: Vercel's CDN caching a middleware redirect response and serving it regardless of cookie validity. Fix applied: explicit `Cache-Control: no-store` headers on middleware and both Stripe routes, plus `force-dynamic` on the routes. **This still needs a live retest to confirm it actually fixed it** — last status before this thread got interrupted.

## File map (what does what)

- `app/page.tsx` — landing page (`/`)
- `app/app/page.tsx` — the actual tool (`/app`): form, paste box, results, approval UI, scripts
- `app/layout.tsx` — root layout + page metadata ("Midnight Hour Content Generator")
- `app/globals.css` — all styles, including the mobile breakpoint and landing page styles
- `app/api/generate/route.ts` — avatar + hooks + CTAs generation
- `app/api/generate-scripts/route.ts` — 30-script generation
- `app/api/parse-intake/route.ts` — paste-and-parse auto-fill
- `app/api/checkout/route.ts` — starts a $7 Stripe Checkout session
- `app/api/unlock/route.ts` — Stripe's success redirect target; verifies payment, sets the access cookie
- `middleware.ts` — gates `/app` and the three generation routes behind the access cookie
- `lib/industries.ts` — the 6 industry definitions + questions + "other" label resolver
- `lib/coreFields.ts` — the 10 core onboarding fields (shared by the form and parse-intake)
- `lib/accessToken.ts` — signs/verifies the 7-day access cookie (Web Crypto API — works in both the Node API routes and Edge middleware)

## Environment variables required

Set in **both** `.env.local` (local dev) and Vercel → Settings → Environment Variables (production):

- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` — currently a **test-mode** key (`sk_test_...`). Needs to switch to a live key (`sk_live_...`) before real charges can happen.
- `ACCESS_TOKEN_SECRET` — a random secret used only to sign the access cookie, not a Stripe value. Must be the exact same value in both places.

## Open decisions / not yet built

1. **Confirm the paywall bug is actually fixed.** Pay with Stripe's test card (`4242 4242 4242 4242`, any future date, any CVC) on the live site, then refresh several times over a minute or two to confirm access holds.
2. **Brand Voice toolkit (A1-A5 from the Content Creation AI Toolkit resource)** — full prompt content is in hand, not yet built. Open question: standalone tool for Josh's own agency voice, or a per-client tool that replaces/expands the current thin "brand personality" onboarding field and feeds the avatar/hooks/CTA/script pipeline. Note: Josh's own project memory says he dislikes interview-style prompting used on himself, which argues against building A1 (the 22-question interview) for his own personal use — A2 (reverse-engineer voice from existing writing) fits him better if it's for himself. Leaning recommendation: build it per-client, which also matches the app's own already-stated roadmap step V4 ("saved client profiles").
3. **FAME Funnel Audit** — full content now in hand (all 15 areas, both the 21-step and 13-step sales page frameworks, the complete consultation question bank). Not yet built. This is a genuinely different tool than the current app (auditing a business's whole funnel to sell audit/optimization services, vs. generating one client's content from onboarding answers), which stretches past the app's locked one-sentence scope. Open question: new section in this same app, or its own separate tool/app.
4. **App version roadmap (from Master Knowledge Base, already partly done):** V1 (live) → V2 single paste box ✅ done → V3 script generation ✅ done → V4 saved client profiles (not started, needs a database) → V5 white-label for other agency owners (not started).

## Standing rules already baked into the app's prompts

- No em dashes, anywhere, ever.
- 4th-5th grade reading level, short/punchy/direct.
- Every hook/CTA/script anchored in ROI, Identity, Urgency, Certainty.
- LF8 (LifeForce 8) and Escape-to-Arrival are already reflected in the master question bank's "Core Desire" and "Escape to Arrival" sections, built before this cohort even started, and line up with what Rich teaches.
