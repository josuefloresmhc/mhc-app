# Midnight Hour Content Generator — App Overview

For continuing work in a new chat (the one with the Lead Magnet / Lead Generation coursework). This describes what the app actually is and does today, so that thread has full context without needing this one.

## What it is, in one sentence

A paid web tool for social media agency owners (built by and for Josue Flores / Midnight Hour Creative) that turns a client's onboarding answers into a ready-to-use content package: a client avatar, a hook bank, a CTA bank, and a full set of 30 video scripts.

## Who it's for

Two audiences, same tool:
1. **Josh, running it himself** — for his own agency clients, replacing manual work he used to do by hand in Claude chat (onboarding breakdown → hooks/CTAs → scripts).
2. **Paying strangers** — since it's now behind a $7 / 7-day paywall, it also works as a low-cost, self-serve tool anyone running a one-person marketing agency could pay for and use on their own clients.

## What it does, step by step

1. **Intake** — the user fills in 10 core business questions (business name, offer, location, ideal customer, problem before, life after, objections, best-seller, differentiator, desired action), or pastes a client's raw answers (e.g. copied from a Google Form) into a box and the app auto-fills the fields with AI.
2. **Industry-specific depth (optional)** — picking an industry (Food & Beverage, Home Services & Trades, Professional Services, Health/Wellness/Fitness, Retail & E-commerce, B2B/Manufacturing/Wholesale, or a free-text "Other") reveals 4 extra tailored questions, so the output isn't generic.
3. **Generate** — one click produces: a fictional-but-realistic client avatar (name, demographics, values, pain points, goals, where they spend time online), 10 hooks, and 3-5 CTAs, all specific to that business, not templated filler.
4. **Approve** — every hook and CTA has a checkbox (all checked by default). The user unchecks whatever they don't want before moving forward, a real approval step, not a black box.
5. **Scripts** — clicking "Generate Scripts" turns the approved hooks/CTAs into exactly 30 full video scripts, balanced across five proven content frameworks (Promo, Educational/Mindset, Proof/Testimonial, Authority/Personal Story, Engagement/Shareable), each script starting with an approved hook and ending with an approved CTA.

Everything is generated fresh each time. **No database, no saved history** — it's a stateless tool by design (matches the "no database for V1" rule from the BSR cohort).

## The business model

- Landing page at `/` explains the tool and has one button: "Get 7-Day Access — $7."
- Clicking it goes straight to Stripe Checkout (no account/signup on the app's side), Stripe collects payment and email.
- On successful payment, a signed cookie grants 7 days of unlimited access to the actual tool at `/app`.
- No login, no password, no user accounts anywhere. Access is purely "do you have a valid, unexpired cookie."
- Currently running in **Stripe test mode** — not yet charging real money.

## Brand identity (locked, now correctly applied in the app)

- Colors: `#2d57e5` (primary blue), `#141516` (near black), `#ffffff`, `#f0f1f5` (light gray). Design references: Porsche, Fear of God, Nike, Ralph Lauren, clean, minimal, flat, high contrast, no gradients, no drop shadows.
- Copy rules baked into every AI prompt in the app: no em dashes ever, 4th-5th grade reading level, short/punchy/direct, every hook/CTA/script anchored in ROI, Identity, Urgency, Certainty.
- The app's outputs already reflect Classical Marketing Theory concepts from the cohort, LF8 (LifeForce 8) desires and Escape-to-Arrival transformation mapping are built into the underlying question structure, even before this specific cohort unit was covered.

## Tech, briefly

Next.js (React/TypeScript), deployed on Vercel via GitHub auto-deploy, Anthropic Claude API for all generation. Live at `mhc-content-system.vercel.app`. No database, no external services besides Anthropic and Stripe.

## Where it stands in its own roadmap

V1 (10-field form → avatar + hooks) → V2 (paste-box auto-fill) → V3 (script generation) are **done**. V4 (saved client profiles, needs a real database) and V5 (white-label for other agency owners) are **not started**.

## Why this matters for the Lead Magnet / Lead Gen chat specifically

A few natural connection points worth thinking through in that thread:

- **The app itself has no lead magnet or email capture of its own**, beyond Stripe collecting an email at the moment of payment. There's no free top-of-funnel offer, no squeeze page, no nurture sequence bringing cold traffic in before asking for $7. Rich's lead magnet framework (the 8 keys, painkiller vs. vitamin positioning, the squeeze page technical requirements) could apply directly to building a real funnel in front of this app, not just the app's UI itself.
- **The app could also become the fulfillment engine for a lead magnet**, e.g., "free client avatar + 3 hooks" as the painkiller-style teaser, with the full hook bank, CTA bank, and 30 scripts behind the $7 tripwire. That reframes the existing paywall as a proper Escape-and-Arrival tripwire offer rather than a flat paywall.
- Whatever gets designed in that thread (squeeze page copy, lead magnet concept, email sequence) would need to be built back into this same codebase, so bring the output back here when it's ready.
