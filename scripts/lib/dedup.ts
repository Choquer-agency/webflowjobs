/**
 * Deduplication logic for the ingestion pipeline.
 *
 * Runs three checks against Convex, cheapest first:
 *   1. Exact applyUrl match          (legacy rows with no normalized field)
 *   2. Normalized applyUrl match     (catches tracking-param variants)
 *   3. (company + title) dedupeKey   (catches cross-source + re-postings)
 *
 * The composite key check also enforces a 30-day cool-down so legitimate
 * re-hires after a long gap are allowed through.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const COOLDOWN_DAYS = 30;

const COMPANY_SUFFIXES = [
  "inc",
  "incorporated",
  "llc",
  "ltd",
  "limited",
  "co",
  "corp",
  "corporation",
  "company",
  "gmbh",
  "sa",
  "bv",
  "ag",
  "plc",
  "pty",
];

/** Normalize a URL for dedup: lowercase host, strip query/hash, drop trailing slash. */
export function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    let path = u.pathname.replace(/\/+$/, "");
    if (path === "") path = "/";
    return `${host}${path}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Normalize a company name — strips legal suffixes, punctuation, extra whitespace. */
export function normalizeCompany(name: string): string {
  let n = name
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Strip trailing legal suffix (possibly repeated: "Acme Inc Ltd")
  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of COMPANY_SUFFIXES) {
      if (n.endsWith(` ${suffix}`)) {
        n = n.slice(0, -suffix.length - 1).trim();
        changed = true;
      }
    }
  }
  return n;
}

/** Normalize a title — lowercase, strip punctuation, collapse whitespace. */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Composite key used for cross-source / re-posting dedup. */
export function makeDedupeKey(company: string, title: string): string {
  return `${normalizeCompany(company)}::${normalizeTitle(title)}`;
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

export interface DedupCandidate {
  applyUrl: string | null;
  sourceId: string;
  title: string;
  company: string;
}

export interface DedupResult<T> {
  job: T;
  applyUrlNormalized: string | null;
  dedupeKey: string;
}

/**
 * Filter a batch of incoming jobs down to truly new ones.
 *
 * In-memory dedup within the batch happens first (cheap), then Convex lookups.
 * Returns the jobs that passed all checks, annotated with the computed
 * normalized fields so the caller can persist them on insert.
 */
export async function filterNewJobs<T extends DedupCandidate>(
  jobs: T[],
  convexClient: ConvexHttpClient
): Promise<DedupResult<T>[]> {
  const batchUrls = new Set<string>();
  const batchKeys = new Set<string>();
  const survivors: DedupResult<T>[] = [];

  for (const job of jobs) {
    const urlNorm = normalizeUrl(job.applyUrl);
    const key = makeDedupeKey(job.company, job.title);

    // In-batch dedup — cross-source and cross-query collisions within one run
    if (urlNorm && batchUrls.has(urlNorm)) continue;
    if (batchKeys.has(key)) continue;

    // Convex check #1: exact legacy applyUrl
    if (job.applyUrl) {
      const legacy = await convexClient.query(api.jobs.getByApplyUrl, {
        applyUrl: job.applyUrl,
      });
      if (legacy) continue;
    }

    // Convex check #2: normalized applyUrl
    if (urlNorm) {
      const normMatch = await convexClient.query(
        api.jobs.getByApplyUrlNormalized,
        { applyUrlNormalized: urlNorm }
      );
      if (normMatch) continue;
    }

    // Convex check #3: composite key with cool-down window
    const keyMatch = await convexClient.query(api.jobs.getByDedupeKey, {
      dedupeKey: key,
    });
    if (keyMatch && daysSince(keyMatch.publishedAt) < COOLDOWN_DAYS) {
      continue;
    }

    if (urlNorm) batchUrls.add(urlNorm);
    batchKeys.add(key);
    survivors.push({ job, applyUrlNormalized: urlNorm, dedupeKey: key });
  }

  return survivors;
}

/** Generate a URL-friendly slug from title and company name. */
export function generateSlug(title: string, company: string): string {
  const raw = `${title}-${company}`;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Ensure slug uniqueness by appending a suffix if needed. */
export async function ensureUniqueSlug(
  slug: string,
  convexClient: ConvexHttpClient
): Promise<string> {
  const existing = await convexClient.query(api.jobs.getBySlugInternal, {
    slug,
  });
  if (!existing) return slug;

  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug}-${suffix}`;
}
