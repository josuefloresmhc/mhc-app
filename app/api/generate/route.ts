import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getIndustry, resolveIndustryLabel } from "@/lib/industries";

// Run on the Node.js runtime (the Anthropic SDK needs it).
export const runtime = "nodejs";

const SYSTEM = `You are a marketing strategist who helps social media agencies turn
client onboarding answers into a client avatar, a hook bank, and a CTA bank.

You reply with ONLY a single JSON object and nothing else — no markdown, no code
fences, no commentary. The JSON must match exactly this shape:

{
  "avatar": {
    "name": "a fictional first and last name",
    "ageGenderLocation": "age, gender, and location in one short line",
    "occupationIncome": "occupation and approximate income",
    "valuesLifestyle": "core values and lifestyle",
    "painPointsFears": "pain points and fears",
    "goalsTransformation": "goals and desired transformation",
    "onlinePresence": "where they spend time online"
  },
  "hooks": [
    "10 short hooks, each under 15 words"
  ],
  "ctas": [
    "3 to 5 short calls to action"
  ]
}

Rules:
- "hooks" must contain exactly 10 strings.
- Each hook is short, punchy, and under 15 words.
- Use a mix of curiosity, pain-point, and identity-based hooks.
- "ctas" must contain 3 to 5 short strings, each anchored in ROI, identity, urgency, or certainty.
- Write everything specifically for this client's audience and offer.
- If industry-specific answers are provided below, use them, do not write anything generic enough to apply to any business.
- Never use em dashes anywhere in your output. Use a period, comma, or start a new sentence instead.`;

function buildPrompt(form: Record<string, string>): string {
  const industry = getIndustry(form.industry);
  const isOther = form.industry === "other";

  let industryBlock = "";
  if (industry) {
    const lines = industry.questions
      .map((q) => {
        const answer = form[`industry_${q.id}`];
        return answer ? `${q.label}\n${answer}` : null;
      })
      .filter(Boolean)
      .join("\n\n");

    if (lines) {
      industryBlock = `\n\nIndustry: ${industry.label}\n\n${lines}`;
    }
  } else if (isOther && form.industryOther) {
    industryBlock = `\n\nIndustry: ${resolveIndustryLabel(form.industry, form.industryOther)}`;
  }

  return `Here are the client's onboarding answers:

Business name: ${form.businessName}
What they sell/offer: ${form.offer}
Location: ${form.location}
Ideal customer (as a person): ${form.idealCustomer}
Problem before finding them: ${form.problemBefore}
Life after buying: ${form.lifeAfter}
Common objections: ${form.objections}
Best-selling product/service: ${form.bestSeller}
What makes them different: ${form.differentiator}
Desired action after seeing content: ${form.callToAction}${industryBlock}

Generate the client avatar, hook bank, and CTA bank as the JSON object described above.`;
}

// Pull the JSON object out of the model's text, tolerating stray characters.
function parseResult(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not read the generated result.");
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
    const form = (await req.json()) as Record<string, string>;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(form) }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const result = parseResult(text);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate. Please try again." },
      { status: 500 },
    );
  }
}
