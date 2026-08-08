/**
 * Server-only Stripe access.
 *
 * Deliberately talks to the Stripe REST API over `fetch` instead of the Node
 * SDK: the app's server code runs in a Worker runtime where the SDK's Node
 * transport and crypto paths are unreliable. The `.server.ts` extension makes
 * the bundler refuse any client import, so the secret key can never reach the
 * browser.
 */

/** Pinned so response shapes (e.g. `subscription.current_period_end`) are stable. */
const STRIPE_API_VERSION = "2024-06-20";
const STRIPE_BASE = "https://api.stripe.com/v1";

/** Rejects webhook signatures older than this to blunt replay attempts. */
const SIGNATURE_TOLERANCE_SECONDS = 300;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Billing is not configured: missing ${name}.`);
  return value;
}

/** Stripe accepts only form encoding, including for nested params. */
function encodeForm(params: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const path = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object" && !Array.isArray(value)) {
      parts.push(...encodeForm(value as Record<string, unknown>, path));
    } else if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (typeof entry === "object" && entry !== null) {
          parts.push(...encodeForm(entry as Record<string, unknown>, `${path}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${path}[${index}]`)}=${encodeURIComponent(String(entry))}`);
        }
      });
    } else {
      parts.push(`${encodeURIComponent(path)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

type StripeCallOptions = {
  /** Stripe-side idempotency: safe to retry a create without duplicating it. */
  idempotencyKey?: string;
};

export async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params: Record<string, unknown> = {},
  options: StripeCallOptions = {},
): Promise<T> {
  const body = encodeForm(params).join("&");
  const url = method === "GET" && body ? `${STRIPE_BASE}${path}?${body}` : `${STRIPE_BASE}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv("STRIPE_SECRET_KEY")}`,
    "Stripe-Version": STRIPE_API_VERSION,
  };
  if (method === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const response = await fetch(url, {
    method,
    headers,
    ...(method === "POST" ? { body } : {}),
  });

  const payload = (await response.json()) as { error?: { message?: string; type?: string } };
  if (!response.ok) {
    // Provider detail stays in server logs; callers surface a generic message.
    console.error("[stripe] request failed", {
      path,
      status: response.status,
      type: payload.error?.type,
      message: payload.error?.message,
    });
    throw new Error("Stripe request failed.");
  }
  return payload as T;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/**
 * Verifies a `Stripe-Signature` header against the exact raw request body.
 * Returns the parsed event only when a `v1` signature matches and the
 * timestamp is inside the tolerance window; otherwise `null`.
 */
export async function verifyStripeEvent(
  rawBody: string,
  signatureHeader: string | null,
): Promise<StripeEvent | null> {
  if (!signatureHeader) return null;

  const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
  let timestamp: string | null = null;
  const candidates: string[] = [];

  for (const segment of signatureHeader.split(",")) {
    const [key, value] = segment.trim().split("=");
    if (key === "t" && value) timestamp = value;
    if (key === "v1" && value) candidates.push(value);
  }
  if (!timestamp || candidates.length === 0) return null;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`)),
  );

  const matched = candidates.some((candidate) => {
    const bytes = hexToBytes(candidate);
    return bytes ? timingSafeEqual(bytes, expected) : false;
  });
  if (!matched) return null;

  try {
    return JSON.parse(rawBody) as StripeEvent;
  } catch {
    return null;
  }
}

export type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
};

export type StripeSubscription = {
  id: string;
  status: string;
  customer: string;
  cancel_at_period_end: boolean;
  current_period_end: number;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } }> };
};

/** Maps Stripe subscription status onto the app's own `profiles.plan` values. */
export function planForStatus(status: string): "active" | "past_due" | "canceled" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

export function priceIdForInterval(interval: "monthly" | "yearly"): string {
  return interval === "monthly"
    ? requireEnv("STRIPE_PRICE_MONTHLY")
    : requireEnv("STRIPE_PRICE_YEARLY");
}
