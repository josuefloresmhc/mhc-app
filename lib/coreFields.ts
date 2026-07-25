// Core onboarding form fields, in order. Every client answers these,
// regardless of industry. Shared between the form (app/page.tsx) and the
// paste-and-parse endpoint (app/api/parse-intake/route.ts) so the two never
// drift out of sync.

export interface CoreField {
  name: string;
  label: string;
  multiline?: boolean;
}

export const CORE_FIELDS: CoreField[] = [
  { name: "businessName", label: "Business name" },
  { name: "offer", label: "What do you sell or offer?", multiline: true },
  { name: "location", label: "Where are you located?" },
  {
    name: "idealCustomer",
    label: "Who is your ideal customer? Describe them as a person.",
    multiline: true,
  },
  {
    name: "problemBefore",
    label: "What problem do they have before they find you?",
    multiline: true,
  },
  {
    name: "lifeAfter",
    label: "What does their life look like after buying from you?",
    multiline: true,
  },
  {
    name: "objections",
    label: "What objections do customers usually have before buying?",
    multiline: true,
  },
  {
    name: "bestSeller",
    label: "What is your best-selling product or service right now?",
    multiline: true,
  },
  {
    name: "differentiator",
    label: "What makes you different from competitors?",
    multiline: true,
  },
  {
    name: "callToAction",
    label: "What do you want people to do after seeing your content?",
    multiline: true,
  },
];
