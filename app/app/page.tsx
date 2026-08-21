"use client";

import { useState } from "react";
import { INDUSTRIES, getIndustry } from "@/lib/industries";
import { CORE_FIELDS as FIELDS } from "@/lib/coreFields";

type Avatar = {
  name: string;
  ageGenderLocation: string;
  occupationIncome: string;
  valuesLifestyle: string;
  painPointsFears: string;
  goalsTransformation: string;
  onlinePresence: string;
};

type GenerateResult = { avatar: Avatar; hooks: string[]; ctas: string[] };

type Script = {
  framework: string;
  hookUsed: string;
  ctaUsed: string;
  script: string;
};

const AVATAR_ROWS: { key: keyof Avatar; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "ageGenderLocation", label: "Age, gender, location" },
  { key: "occupationIncome", label: "Occupation & income" },
  { key: "valuesLifestyle", label: "Core values & lifestyle" },
  { key: "painPointsFears", label: "Pain points & fears" },
  { key: "goalsTransformation", label: "Goals & desired transformation" },
  { key: "onlinePresence", label: "Where they spend time online" },
];

const FRAMEWORK_LABELS: Record<string, string> = {
  promo: "Sales Pitch",
  educational_mindset: "Teach Something",
  proof_testimonial: "Customer Win",
  authority_personal_story: "Your Story",
  engagement_shareable: "Quick Question",
};

const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.name, ""]));

export default function Home() {
  const [form, setForm] = useState<Record<string, string>>({
    ...emptyForm,
    industry: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);

  const [approvedHooks, setApprovedHooks] = useState<Set<number>>(new Set());
  const [approvedCtas, setApprovedCtas] = useState<Set<number>>(new Set());

  const [scriptsLoading, setScriptsLoading] = useState(false);
  const [scriptsError, setScriptsError] = useState("");
  const [scripts, setScripts] = useState<Script[] | null>(null);

  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [parseMessage, setParseMessage] = useState("");

  const selectedIndustry = getIndustry(form.industry);

  function update(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onParseIntake() {
    if (!pasteText.trim()) return;
    setParsing(true);
    setParseError("");
    setParseMessage("");
    try {
      const res = await fetch("/api/parse-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: pasteText, industry: form.industry }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      const fields = (data.fields ?? {}) as Record<string, string>;
      let filled = 0;
      setForm((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(fields)) {
          if (value && value.trim()) {
            next[key] = value;
            filled += 1;
          }
        }
        return next;
      });
      setParseMessage(
        filled > 0
          ? `Filled ${filled} field${filled === 1 ? "" : "s"} from the pasted text. Review before generating.`
          : "Couldn't match any fields in that text. Try pasting the full response.",
      );
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setParsing(false);
    }
  }

  function toggleHook(i: number) {
    setApprovedHooks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleCta(i: number) {
    setApprovedCtas((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setScripts(null);
    setScriptsError("");
    setApprovedHooks(new Set());
    setApprovedCtas(new Set());
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
      setResult(data as GenerateResult);
      // Default everything to approved so a strategist can just uncheck what
      // they don't want, instead of starting from nothing.
      setApprovedHooks(new Set((data.hooks ?? []).map((_: string, i: number) => i)));
      setApprovedCtas(new Set((data.ctas ?? []).map((_: string, i: number) => i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onGenerateScripts() {
    if (!result) return;
    setScriptsLoading(true);
    setScriptsError("");
    setScripts(null);
    try {
      const res = await fetch("/api/generate-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          offer: form.offer,
          industry: form.industry,
          industryOther: form.industryOther,
          differentiator: form.differentiator,
          idealCustomer: form.idealCustomer,
          hooks: result.hooks.filter((_, i) => approvedHooks.has(i)),
          ctas: result.ctas.filter((_, i) => approvedCtas.has(i)),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setScripts(data.scripts as Script[]);
    } catch (err) {
      setScriptsError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setScriptsLoading(false);
    }
  }

  const canGenerateScripts = approvedHooks.size > 0 && approvedCtas.size > 0;

  return (
    <main className="container">
      <div className="header">
        <h1>Midnight Hour Content Generator</h1>
        <p>
          Paste or fill in the answers below and we&apos;ll figure out who
          your customer is, give you words that grab attention and words
          that get people to buy, then turn the ones you approve into a
          full set of video scripts.
        </p>
      </div>

      <div className="card paste-card">
        <h2>Paste Your Answers</h2>
        <p className="approval-hint">
          Already written this up somewhere, like a bio, About page, or an
          old questionnaire? Paste the whole thing here and it&apos;ll fill
          in the fields below for you. Pick an industry first if you want
          those questions filled too.
        </p>
        <div className="field">
          <textarea
            aria-label="Paste your answers"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your raw answers here…"
            style={{ minHeight: 140 }}
          />
        </div>
        <button
          className="generate secondary"
          type="button"
          disabled={!pasteText.trim() || parsing}
          onClick={onParseIntake}
        >
          {parsing ? "Reading answers…" : "Auto-fill fields from paste"}
        </button>
        {parseMessage && (
          <p className="approval-hint" style={{ marginTop: 10 }}>
            {parseMessage}
          </p>
        )}
        {parseError && (
          <div className="error" style={{ marginTop: 12 }}>
            {parseError}
          </div>
        )}
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

          <div className="field">
            <label htmlFor="industry">Industry (optional)</label>
            <select
              id="industry"
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
            >
              <option value="">General / not listed</option>
              {INDUSTRIES.map((i) => (
                <option key={i.key} value={i.key}>
                  {i.label}
                </option>
              ))}
              <option value="other">Other (tell us your industry)</option>
            </select>
          </div>

          {selectedIndustry && (
            <div className="industry-block">
              <div className="industry-block-label">{selectedIndustry.label} questions</div>
              {selectedIndustry.questions.map((q) => {
                const fieldName = `industry_${q.id}`;
                return (
                  <div className="field" key={q.id}>
                    <label htmlFor={fieldName}>{q.label}</label>
                    <textarea
                      id={fieldName}
                      value={form[fieldName] ?? ""}
                      onChange={(e) => update(fieldName, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {form.industry === "other" && (
            <div className="industry-block">
              <div className="industry-block-label">Tell us about your industry</div>
              <div className="field">
                <label htmlFor="industryOther">
                  What industry are you in? (a sentence is fine)
                </label>
                <input
                  id="industryOther"
                  type="text"
                  value={form.industryOther ?? ""}
                  onChange={(e) => update("industryOther", e.target.value)}
                />
              </div>
            </div>
          )}
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
            <h2>Your Ideal Customer</h2>
            {AVATAR_ROWS.map((row) => (
              <div className="avatar-row" key={row.key}>
                <div className="k">{row.label}</div>
                <div>{result.avatar[row.key]}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Opening Lines</h2>
            <p className="approval-hint">
              Uncheck anything you don&apos;t want carried into the scripts.
            </p>
            <ul className="approval-list">
              {result.hooks.map((hook, i) => (
                <li key={i}>
                  <label>
                    <input
                      type="checkbox"
                      checked={approvedHooks.has(i)}
                      onChange={() => toggleHook(i)}
                    />
                    <span>{hook}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Closing Lines</h2>
            <p className="approval-hint">
              Uncheck anything you don&apos;t want carried into the scripts.
            </p>
            <ul className="approval-list">
              {result.ctas.map((cta, i) => (
                <li key={i}>
                  <label>
                    <input
                      type="checkbox"
                      checked={approvedCtas.has(i)}
                      onChange={() => toggleCta(i)}
                    />
                    <span>{cta}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="generate"
            type="button"
            disabled={!canGenerateScripts || scriptsLoading}
            onClick={onGenerateScripts}
          >
            {scriptsLoading
              ? "Writing scripts…"
              : `Generate Scripts from ${approvedHooks.size} Opening Line${
                  approvedHooks.size === 1 ? "" : "s"
                } + ${approvedCtas.size} Closing Line${approvedCtas.size === 1 ? "" : "s"}`}
          </button>
          {!canGenerateScripts && (
            <p className="approval-hint" style={{ marginTop: 8 }}>
              Approve at least one opening line and one closing line to generate scripts.
            </p>
          )}
        </div>
      )}

      {scriptsError && (
        <div className="error" style={{ marginTop: 20 }}>
          {scriptsError}
        </div>
      )}

      {scripts && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Scripts ({scripts.length})</h2>
          {scripts.map((s, i) => (
            <div className="script-card" key={i}>
              <div className="script-framework">
                {FRAMEWORK_LABELS[s.framework] ?? s.framework}
              </div>
              <div className="script-text">{s.script}</div>
              <div className="script-meta">
                <span>Opens with: {s.hookUsed}</span>
                <span>Closes with: {s.ctaUsed}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
