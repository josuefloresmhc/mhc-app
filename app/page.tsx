import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-content">
        <h1>From Client Answers to Ready-to-Film Scripts</h1>
        <p>
          Built for social media agencies and content strategists. Turn a
          client&apos;s onboarding answers into an avatar, hook bank, CTA
          bank, and a full set of video scripts, all in one place.
        </p>
        <Link href="/app" className="cta-button">
          Open the App
        </Link>
      </div>
    </main>
  );
}
