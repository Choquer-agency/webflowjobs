/**
 * One-time backfill + duplicate collapse for the jobs table.
 *
 * Phase 1 (always): compute applyUrlNormalized + dedupeKey for every job that
 *                   doesn't already have them, and patch in place.
 * Phase 2 (--apply): group by normalized URL and by dedupeKey, pick a winner
 *                    per cluster, delete the losers.
 *
 * Without --apply the script runs as a dry-run and just prints what it would
 * do. Run with --apply to actually mutate.
 *
 * Usage:
 *   CONVEX_URL=<url> npx tsx scripts/dedupe-backfill.ts           # dry-run
 *   CONVEX_URL=<url> npx tsx scripts/dedupe-backfill.ts --apply   # execute
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { normalizeUrl, makeDedupeKey } from "./lib/dedup";

const CONVEX_URL =
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const APPLY = process.argv.includes("--apply");

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

interface JobRow {
  _id: string;
  _creationTime: number;
  title: string;
  companyName: string;
  applyUrl?: string;
  applyUrlNormalized?: string;
  dedupeKey?: string;
  publishedAt?: string;
  isVerified?: boolean;
  isSponsored?: boolean;
  relevanceScore?: number;
}

/**
 * Winner selection for a cluster of duplicates.
 * Priority: sponsored > verified > has applyUrl > oldest _creationTime
 * (the oldest row has had the most time to be indexed by search engines).
 */
function pickWinner(cluster: JobRow[]): JobRow {
  return cluster.reduce((best, job) => {
    if ((job.isSponsored ? 1 : 0) !== (best.isSponsored ? 1 : 0)) {
      return job.isSponsored ? job : best;
    }
    if ((job.isVerified ? 1 : 0) !== (best.isVerified ? 1 : 0)) {
      return job.isVerified ? job : best;
    }
    const jobHasUrl = job.applyUrl ? 1 : 0;
    const bestHasUrl = best.applyUrl ? 1 : 0;
    if (jobHasUrl !== bestHasUrl) return jobHasUrl ? job : best;
    return job._creationTime < best._creationTime ? job : best;
  });
}

async function main() {
  console.log(`\n=== Dedup Backfill ===`);
  console.log(`Mode: ${APPLY ? "APPLY (mutating)" : "DRY RUN"}\n`);

  const jobs = (await convex.query(api.jobs.listAllForBackfill, {})) as JobRow[];
  console.log(`Loaded ${jobs.length} jobs`);

  // Phase 1: backfill normalized fields
  let backfilled = 0;
  for (const job of jobs) {
    const urlNorm = normalizeUrl(job.applyUrl ?? null);
    const key = makeDedupeKey(job.companyName, job.title);
    const needsUrl = urlNorm && job.applyUrlNormalized !== urlNorm;
    const needsKey = job.dedupeKey !== key;
    if (!needsUrl && !needsKey) continue;

    // Mutate local copy so Phase 2 clustering uses the new values
    if (urlNorm) job.applyUrlNormalized = urlNorm;
    job.dedupeKey = key;

    if (APPLY) {
      await convex.mutation(api.jobs.patchJob, {
        id: job._id as never,
        ...(urlNorm ? { applyUrlNormalized: urlNorm } : {}),
        dedupeKey: key,
      });
    }
    backfilled++;
  }
  console.log(
    `Phase 1: ${backfilled} jobs ${APPLY ? "patched" : "would be patched"} with normalized fields`
  );

  // Phase 2: cluster and collapse
  const byUrl = new Map<string, JobRow[]>();
  const byKey = new Map<string, JobRow[]>();

  for (const job of jobs) {
    if (job.applyUrlNormalized) {
      const arr = byUrl.get(job.applyUrlNormalized) ?? [];
      arr.push(job);
      byUrl.set(job.applyUrlNormalized, arr);
    }
    if (job.dedupeKey) {
      const arr = byKey.get(job.dedupeKey) ?? [];
      arr.push(job);
      byKey.set(job.dedupeKey, arr);
    }
  }

  const toDelete = new Map<string, JobRow>();
  let urlDupClusters = 0;
  let keyDupClusters = 0;

  for (const cluster of byUrl.values()) {
    if (cluster.length < 2) continue;
    urlDupClusters++;
    const winner = pickWinner(cluster);
    for (const job of cluster) {
      if (job._id !== winner._id) toDelete.set(job._id, job);
    }
  }

  // Only merge dedupeKey clusters that weren't already resolved by URL match —
  // otherwise we'd over-collapse genuinely separate postings at the same company.
  // A cluster is considered safe to collapse when at least two members share
  // either the same normalized URL OR have no URL at all (LinkedIn source etc).
  for (const cluster of byKey.values()) {
    if (cluster.length < 2) continue;
    const urlGroups = new Map<string, JobRow[]>();
    const noUrl: JobRow[] = [];
    for (const j of cluster) {
      if (j.applyUrlNormalized) {
        const arr = urlGroups.get(j.applyUrlNormalized) ?? [];
        arr.push(j);
        urlGroups.set(j.applyUrlNormalized, arr);
      } else {
        noUrl.push(j);
      }
    }
    // Same company + same title + no URL → collapse (can't distinguish anyway)
    if (noUrl.length > 1) {
      keyDupClusters++;
      const winner = pickWinner(noUrl);
      for (const job of noUrl) {
        if (job._id !== winner._id) toDelete.set(job._id, job);
      }
    }
    // Same company + same title + different URLs → collapse across the whole
    // cluster, because different sources produce different URLs for the same
    // posting. This is the cross-source case the old dedup missed.
    if (urlGroups.size > 1 || (urlGroups.size === 1 && noUrl.length > 0)) {
      keyDupClusters++;
      const winner = pickWinner(cluster);
      for (const job of cluster) {
        if (job._id !== winner._id) toDelete.set(job._id, job);
      }
    }
  }

  console.log(
    `Phase 2: ${urlDupClusters} URL clusters, ${keyDupClusters} composite-key clusters`
  );
  console.log(
    `         ${toDelete.size} jobs ${APPLY ? "will be deleted" : "would be deleted"}`
  );

  // Print a sample so the user can sanity-check before applying
  const sample = Array.from(toDelete.values()).slice(0, 10);
  if (sample.length > 0) {
    console.log(`\nSample of duplicates to remove:`);
    for (const j of sample) {
      console.log(`  - "${j.title}" @ ${j.companyName}  (${j.applyUrl ?? "no url"})`);
    }
  }

  if (APPLY) {
    for (const job of toDelete.values()) {
      await convex.mutation(api.jobs.deleteJob, { id: job._id as never });
    }
    console.log(`\nDeleted ${toDelete.size} duplicate jobs.`);
  } else {
    console.log(`\nDry run complete. Re-run with --apply to execute.`);
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
