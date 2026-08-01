// Signed, stateless access token used to gate /app and the generation API
// routes for 7 days after a successful $7 Stripe payment. No login, no
// database: the cookie itself carries an expiry timestamp plus an HMAC
// signature, so it can be verified in both the Node API routes and the Edge
// middleware using only the Web Crypto API (available in both runtimes).

export const ACCESS_COOKIE = "mhc_access";
export const ACCESS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padLength = (4 - (value.length % 4)) % 4;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Creates a signed token that's valid until `expiresAt` (epoch ms). */
export async function createAccessToken(expiresAt: number, secret: string): Promise<string> {
  const payloadBytes = new TextEncoder().encode(JSON.stringify({ exp: expiresAt }));
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes as BufferSource);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Verifies signature and expiry. Returns false for anything malformed, tampered, or expired. */
export async function verifyAccessToken(token: string, secret: string): Promise<boolean> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return false;

    const payloadBytes = base64UrlDecode(payloadB64);
    const signatureBytes = base64UrlDecode(sigB64);
    const key = await getSigningKey(secret);

    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      payloadBytes as BufferSource,
    );
    if (!isValidSignature) return false;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number };
    return typeof payload.exp === "number" && Date.now() < payload.exp;
  } catch {
    return false;
  }
}
