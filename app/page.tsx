"use client";

import { useState } from "react";

// The onboarding form fields, in order.
const FIELDS: { name: string; label: string; multiline?: boolean }[] = [
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

type Avatar = {
  name: string;
  ageGenderLocation: string;
  occupationIncome: string;
  valuesLifestyle: string;
  painPointsFears: string;
  goalsTransformation: string;
  onlinePresence: string;
};

type Result = { avatar: Avatar; hooks: string[] };

const AVATAR_ROWS: { key: keyof Avatar; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "ageGenderLocation", label: "Age, gender, location" },
  { key: "occupationIncome", label: "Occupation & income" },
  { key: "valuesLifestyle", label: "Core values & lifestyle" },
  { key: "painPointsFears", label: "Pain points & fears" },
  { key: "goalsTransformation", label: "Goals & desired transformation" },
  { key: "onlinePresence", label: "Where they spend time online" },
];

const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

export default function Home() {
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function update(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="header">
        <h1>Client Avatar &amp; Hook Bank Generator</h1>
        <p>
          Fill in the onboarding answers below and generate a client avatar and
          a bank of 10 hooks.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="card">
          {FIELDS.map((f) => (
            <div className="field" key={f.name}>
              <label htmlFor={f.name}>{f.label}</label>
              {f.multiline ? (
                <textarea
                  id={f.name}
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                  required
                />
              ) : (
                <input
                  id={f.name}
                  type="text"
                  value={form[f.name]}
                  onChange={(e) => update(f.name, e.target.value)}
                  required
                />
              )}
            </div>
          ))}
        </div>

        <button className="generate" type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate"}
        </button>
      </form>

      {error && (
        <div className="error" style={{ marginTop: 20 }}>
          {error}
        </div>
      )}

      {result && (
        <div className="results" style={{ marginTop: 24 }}>
          <div className="card">
            <h2>Avatar Profile</h2>
            {AVATAR_ROWS.map((row) => (
              <div className="avatar-row" key={row.key}>
                <div className="k">{row.label}</div>
                <div>{result.avatar[row.key]}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Hook Bank</h2>
            <ol className="hook-list">
              {result.hooks.map((hook, i) => (
                <li key={i}>{hook}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </main>
  );
}
