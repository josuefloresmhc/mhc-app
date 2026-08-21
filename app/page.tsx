type SearchParams = { [key: string]: string | string[] | undefined };

function getNotice(searchParams: SearchParams): string | null {
  const access = searchParams.access;
  const checkout = searchParams.checkout;

  if (access === "expired") {
    return "Your 7-day access has ended. Grab another pass below to keep going.";
  }
  if (checkout === "cancelled") {
    return "Checkout was cancelled — no charge was made.";
  }
  if (checkout === "unpaid") {
    return "That payment didn't go through. No worries, try again below.";
  }
  if (checkout === "error") {
    return "Something went wrong confirming your payment. Try again, or reach out if it keeps happening.";
  }
  return null;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const notice = getNotice(await searchParams);

  return (
    <main className="landing">
      <div className="landing-content">
        <h1>From Your Business to Ready-to-Film Scripts</h1>
        <p>
          Built for business owners who want to create their own content.
          Answer a few questions about your business. Get your ideal
          customer, what to say, and full video scripts ready to film. All
          in one place.
        </p>
        {notice && <p className="landing-notice">{notice}</p>}
        <a href="/api/checkout" className="cta-button">
          Get 7-Day Access — $7
        </a>
      </div>
    </main>
  );
}
