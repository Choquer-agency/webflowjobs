/**
 * Email finder using Hunter.io with fallback to generic addresses.
 *
 * Strategy:
 * 1. Hunter.io Domain Search (if API key available)
 * 2. Fall back to info@domain
 */

export interface EmailResult {
  email: string;
  source: "hunter" | "fallback";
  confidence: number;
  firstName?: string;
  lastName?: string;
  position?: string;
}

interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
}

interface HunterResponse {
  data: {
    domain: string;
    emails: HunterEmail[];
  };
  errors?: Array<{ id: string; details: string }>;
}

export async function findCompanyEmail(
  domain: string,
  hunterApiKey?: string
): Promise<EmailResult> {
  // Try Hunter.io first if we have a key
  if (hunterApiKey) {
    try {
      const result = await searchHunter(domain, hunterApiKey);
      if (result) return result;
    } catch (err) {
      console.warn(`  Hunter.io lookup failed for ${domain}:`, err);
    }
  }

  // Fallback to generic email
  return {
    email: `info@${domain}`,
    source: "fallback",
    confidence: 30,
  };
}

async function searchHunter(
  domain: string,
  apiKey: string
): Promise<EmailResult | null> {
  const url = new URL("https://api.hunter.io/v2/domain-search");
  url.searchParams.set("domain", domain);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString());

  if (!res.ok) {
    if (res.status === 429) {
      console.warn("  Hunter.io rate limit reached");
      return null;
    }
    if (res.status === 402) {
      console.warn("  Hunter.io quota exhausted");
      return null;
    }
    throw new Error(`Hunter.io API error: ${res.status}`);
  }

  const json = (await res.json()) as HunterResponse;

  if (!json.data?.emails?.length) {
    return null;
  }

  // Pick the email with highest confidence
  const sorted = [...json.data.emails].sort(
    (a, b) => b.confidence - a.confidence
  );
  const best = sorted[0];

  return {
    email: best.value,
    source: "hunter",
    confidence: best.confidence,
    firstName: best.first_name ?? undefined,
    lastName: best.last_name ?? undefined,
    position: best.position ?? undefined,
  };
}
