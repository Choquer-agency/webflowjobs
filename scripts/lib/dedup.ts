/**
 * Deduplication logic for the ingestion pipeline.
 * Checks applyUrl against existing jobs in Convex.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export async function filterNewJobs<
  T extends { applyUrl: string | null; sourceId: string }
>(jobs: T[], convexClient: ConvexHttpClient): Promise<T[]> {
  const newJobs: T[] = [];

  for (const job of jobs) {
    // Skip jobs without an apply URL — can't deduplicate them reliably
    if (!job.applyUrl) continue;

    const existing = await convexClient.query(api.jobs.getByApplyUrl, {
      applyUrl: job.applyUrl,
    });

    if (!existing) {
      newJobs.push(job);
    }
  }

  return newJobs;
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

  // Append random suffix
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug}-${suffix}`;
}
