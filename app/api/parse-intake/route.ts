import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CORE_FIELDS } from "@/lib/coreFields";
import { getIndustry } from "@/lib/industries";

// Run on the Node.js runtime (the Anthropic SDK needs it).
export const runtime = "nodejs";

const SYSTEM = `You extract structured answers from a business owner's raw
answer text (often pasted straight out of a Google Form or an old bio) and
map them onto a fixed set of fields.

You reply with ONLY a single JSON object and nothing else — no markdown, no
code fences, no commentary. The object must have exactly the field names
given to you as keys.

Rules:
- Match answers to fields by meaning, not by exact wording, question order in
  the source text may not match the field order you're given.
- If the source text doesn't contain a clear answer for a field, use an empty
  string for that field. Never invent or guess an answer.
- Copy the business owner's own words. Do not summarize, rewrite, or clean up
  their answers, just place them in the right field.
- Every value must be a plain string.`;

function buildPrompt(
  rawText: string,
  fields: { name: string; label: string }[],
): string {
  const fieldList = fields.map((f) => `- ${f.name}: ${f.label}`).join("\n");

  return `Fields to fill (key: what the field is asking):
${fieldList}

Raw answer text to extract from:
"""
${rawText}
"""

Return a JSON object with exactly these keys: ${fields.map((f) => f.name).join(", ")}.`;
}

// Pull the JSON object out of the model's text, tolerating stray characters.
function parseResult(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not read the parsed result.");
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
      rawText: string;
      industry?: string;
    };

    if (!body.rawText?.trim()) {
      return NextResponse.json(
        { error: "Paste your answers first." },
        { status: 400 },
      );
    }

    const fields: { name: string; label: string }[] = [...CORE_FIELDS];

    const industry = getIndustry(body.industry);
    if (industry) {
      for (const q of industry.questions) {
        fields.push({ name: `industry_${q.id}`, label: q.label });
      }
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(body.rawText, fields) }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");

    const fieldsResult = parseResult(text);
    return NextResponse.json({ fields: fieldsResult });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse the pasted answers. Please try again." },
      { status: 500 },
    );
  }
}
