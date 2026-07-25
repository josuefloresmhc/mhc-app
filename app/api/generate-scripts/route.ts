import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { resolveIndustryLabel } from "@/lib/industries";

// Run on the Node.js runtime (the Anthropic SDK needs it).
export const runtime = "nodejs";

// Canonical script breakdown, balanced across the 5 Content Pyramid
// frameworks. This mirrors the agency's manual SOP so the app produces the
// same mix a strategist would build by hand.
const DELIVERABLE_BREAKDOWN = {
  promo: 3,
  educational_mindset: 8,
  proof_testimonial: 6,
  authority_personal_story: 9,
  engagement_shareable: 4,
};

const TOTAL_SCRIPTS = Object.values(DELIVERABLE_BREAKDOWN).reduce((a, b) => a + b, 0);

const SYSTEM = `You are a marketing strategist who writes short spoken video scripts for
social media agency clients, using the Midnight Hour Content Pyramid.

You reply with ONLY a single JSON array and nothing else — no markdown, no code
fences, no commentary. The array must contain exactly ${TOTAL_SCRIPTS} objects, each
matching this exact shape:

{
  "framework": "promo" | "educational_mindset" | "proof_testimonial" | "authority_personal_story" | "engagement_shareable",
  "hookUsed": "one of the approved hooks, copied exactly",
  "ctaUsed": "one of the approved CTAs, copied exactly",
  "script": "the full spoken script"
}

Required mix across the ${TOTAL_SCRIPTS} scripts:
- promo: ${DELIVERABLE_BREAKDOWN.promo}
- educational_mindset: ${DELIVERABLE_BREAKDOWN.educational_mindset}
- proof_testimonial: ${DELIVERABLE_BREAKDOWN.proof_testimonial}
- authority_personal_story: ${DELIVERABLE_BREAKDOWN.authority_personal_story}
- engagement_shareable: ${DELIVERABLE_BREAKDOWN.engagement_shareable}

Content Pyramid frameworks:
1. Promo Video (direct offers and sales): Callout -> Pain -> Truth -> Solution -> Urgency -> CTA
2. Educational / Mindset (value and authority): Pattern Interrupt -> Expose the Mistake -> Reveal the Truth -> Authority Solution -> Proof -> Consequence of Inaction -> Identity Reframe -> CTA
3. Proof / Testimonial (trust and credibility): Callout -> Client Situation -> Result -> Identity -> CTA
4. Authority / Personal Story (brand and leadership): Hook -> Your Story -> Lesson -> Proof -> CTA
5. Engagement / Shareable (replies, polls, interaction): Quick Callout -> Simple Choice or Question -> Tie Back -> CTA

Context lock:
- Use ONLY the client information provided below. Do not invent new offers, prices, or claims.
- Reuse the provided hooks and CTAs — rotate through them across the ${TOTAL_SCRIPTS} scripts, do not invent new ones.
- If a line could apply to any business, rewrite or remove it.

Non-negotiables:
- Each script starts with one provided hook and ends with one provided CTA.
- Scripts must sound spoken, not written.
- 4th to 5th grade language. Short sentences. Punchy. Direct. No em dashes.
- Anchor every script in ROI, identity, urgency, or certainty.
- No fluff. No explaining twice. One idea per script.
- 6 to 10 short lines per script.`;

function buildPrompt(payload: {
  businessName: string;
  offer: string;
  industry?: string;
  industryOther?: string;
  differentiator?: string;
  idealCustomer?: string;
  hooks: string[];
  ctas: string[];
}): string {
  return `Client business name: ${payload.businessName}
What they sell/offer: ${payload.offer}
Industry: ${resolveIndustryLabel(payload.industry, payload.industryOther)}
Ideal customer: ${payload.idealCustomer ?? "not specified"}
What makes them different: ${payload.differentiator ?? "not specified"}

Approved hooks:
${payload.hooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Approved CTAs:
${payload.ctas.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Write the ${TOTAL_SCRIPTS} scripts as the JSON array described above.`;
}

// Pull the JSON array out of the model's text, tolerating stray characters.
function parseResult(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("Could not read the generated scripts.");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it and try again." },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as {
      businessName: string;
      offer: string;
      industry?: string;
      industryOther?: string;
      differentiator?: string;
      idealCustomer?: string;
      hooks: string[];
      ctas: string[];
    };

    if (!body.hooks?.length || !body.ctas?.length) {
      return NextResponse.json(
        { error: "Approve at least one hook and one CTA before generating scripts." },
        { status: 400 },
      );
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(body) }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const scripts = parseResult(text);
    return NextResponse.json({ scripts });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate scripts. Please try again." },
      { status: 500 },
    );
  }
}
