// Industry add-on question blocks.
//
// Core onboarding questions apply to every client. These extra blocks are
// optional and get pulled into the form based on the client's business type,
// giving the model more specific context to work with when it writes the
// avatar, hooks, CTAs, and (eventually) scripts.
//
// Source of truth for this list: mhc_master_question_bank.json (industry_addons).

export type IndustryKey =
  | "food_and_beverage"
  | "home_services_trades"
  | "professional_services"
  | "health_wellness_fitness"
  | "retail_ecommerce"
  | "b2b_manufacturing_wholesale";

export interface IndustryQuestion {
  id: string;
  label: string;
}

export interface IndustryDef {
  key: IndustryKey;
  label: string;
  questions: IndustryQuestion[];
}

export const INDUSTRIES: IndustryDef[] = [
  {
    key: "food_and_beverage",
    label: "Food & Beverage",
    questions: [
      { id: "fb1", label: "What are your most popular menu items or products?" },
      {
        id: "fb2",
        label: "Do you have multiple locations, and should content be location-specific?",
      },
      {
        id: "fb3",
        label: "Any dietary or allergy callouts you want featured, like vegan or gluten-free?",
      },
      { id: "fb4", label: "What's your average ticket size or best deal to highlight?" },
    ],
  },
  {
    key: "home_services_trades",
    label: "Home Services & Trades",
    questions: [
      { id: "hs1", label: "What is your typical job size or project timeline?" },
      { id: "hs2", label: "Do you offer free estimates or emergency service?" },
      {
        id: "hs3",
        label: "What licenses, certifications, or guarantees should we highlight?",
      },
      {
        id: "hs4",
        label: "What's the biggest fear customers have about hiring someone in your trade?",
      },
    ],
  },
  {
    key: "professional_services",
    label: "Professional Services (mortgage, legal, financial, real estate, insurance)",
    questions: [
      { id: "ps1", label: "What is the average outcome or savings you help clients achieve?" },
      {
        id: "ps2",
        label: "Are there compliance or disclosure rules we need to follow in your content?",
      },
      { id: "ps3", label: "Do you serve a specific language, community, or niche within your field?" },
      { id: "ps4", label: "What credentials or licenses build trust with your clients?" },
    ],
  },
  {
    key: "health_wellness_fitness",
    label: "Health, Wellness & Fitness",
    questions: [
      {
        id: "hw1",
        label: "What transformation or result do clients typically see, and in what timeframe?",
      },
      {
        id: "hw2",
        label: "Are there before and after or progress photos we can use? Any consent needed?",
      },
      { id: "hw3", label: "What certifications or credentials should we highlight?" },
      { id: "hw4", label: "Are there safety or liability disclaimers required in your content?" },
    ],
  },
  {
    key: "retail_ecommerce",
    label: "Retail & E-commerce",
    questions: [
      { id: "re1", label: "What are your top 3 best-selling products?" },
      { id: "re2", label: "Do you ship, and what markets do you serve?" },
      { id: "re3", label: "What's your return policy or guarantee?" },
      { id: "re4", label: "Do you run promotions or sales we should plan content around?" },
    ],
  },
  {
    key: "b2b_manufacturing_wholesale",
    label: "B2B, Manufacturing & Wholesale",
    questions: [
      { id: "b2b1", label: "Who is the actual decision maker you're trying to reach? Title and role." },
      { id: "b2b2", label: "What is your typical sales cycle length?" },
      { id: "b2b3", label: "Do you have minimum order quantities or lead times to highlight?" },
      { id: "b2b4", label: "What industries or company sizes do you serve best?" },
    ],
  },
];

export function getIndustry(key: string | undefined | null): IndustryDef | undefined {
  return INDUSTRIES.find((i) => i.key === key);
}

/**
 * Resolves a human-readable industry label for prompts, covering all three
 * cases the form can produce: a known preset (key), "other" with free text
 * the client typed in, or nothing selected at all.
 */
export function resolveIndustryLabel(
  key: string | undefined | null,
  otherText?: string | null,
): string {
  if (key === "other") {
    return otherText?.trim() ? otherText.trim() : "Other (not specified)";
  }
  const found = getIndustry(key);
  return found ? found.label : "General / not specified";
}
