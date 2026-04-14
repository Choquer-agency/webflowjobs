/**
 * Daily job ingestion pipeline.
 *
 * Fetches jobs from multiple sources, deduplicates, classifies with Claude AI,
 * and inserts approved jobs into Convex.
 *
 * Usage:
 *   CONVEX_URL=<url> RAPIDAPI_KEY=<key> ANTHROPIC_API_KEY=<key> npx tsx scripts/ingest-jobs.ts
 *
 * Environment variables:
 *   CONVEX_URL          - Convex deployment URL (or NEXT_PUBLIC_CONVEX_URL)
 *   RAPIDAPI_KEY        - RapidAPI key for JSearch
 *   ANTHROPIC_API_KEY   - Anthropic API key for Claude classification
 *   MIN_RELEVANCE_SCORE - Minimum score to accept (default: 5)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { fetchJSearchJobs, type RawJob as JSearchRawJob } from "./lib/sources/jsearch";
import { fetchRemoteOKJobs, type RawJob as RemoteOKRawJob } from "./lib/sources/remoteok";
import { fetchLinkedInJobs, type RawJob as LinkedInRawJob } from "./lib/sources/linkedin";
import { classifyBatch } from "./lib/classifier";
import { rewriteForSeo } from "./lib/seo-rewriter";
import { filterNewJobs, generateSlug, ensureUniqueSlug } from "./lib/dedup";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONVEX_URL =
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MIN_SCORE = Number(process.env.MIN_RELEVANCE_SCORE ?? "5");

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL is required");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

type RawJob = JSearchRawJob | RemoteOKRawJob | LinkedInRawJob;

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

async function main() {
  const runAt = new Date().toISOString();
  console.log(`\n=== Job Ingestion Pipeline ===`);
  console.log(`Run at: ${runAt}\n`);

  // Step 1: Fetch from all sources
  console.log("[1/5] Fetching jobs from sources...");

  const fetchResults = await Promise.allSettled([
    RAPIDAPI_KEY
      ? fetchJSearchJobs(RAPIDAPI_KEY)
      : Promise.resolve([] as JSearchRawJob[]),
    fetchRemoteOKJobs(),
    fetchLinkedInJobs(),
  ]);

  const allJobs: RawJob[] = [];
  const errors: string[] = [];

  for (const result of fetchResults) {
    if (result.status === "fulfilled") {
      allJobs.push(...result.value);
    } else {
      errors.push(result.reason?.message ?? "Unknown fetch error");
    }
  }

  if (!RAPIDAPI_KEY) {
    console.warn("  ⚠ RAPIDAPI_KEY not set — skipping JSearch (primary source)");
  }

  console.log(`  Fetched ${allJobs.length} raw jobs`);

  if (allJobs.length === 0) {
    console.log("No jobs fetched. Exiting.");
    await logRun(runAt, 0, 0, 0, 0, errors);
    return;
  }

  // Step 2: Deduplicate against Convex
  console.log("\n[2/5] Deduplicating against existing jobs...");
  const dedupResults = await filterNewJobs(allJobs, convex);
  const duplicateCount = allJobs.length - dedupResults.length;
  console.log(
    `  ${dedupResults.length} new candidates (${duplicateCount} duplicates skipped)`
  );

  if (dedupResults.length === 0) {
    console.log("No new jobs to process. Exiting.");
    await logRun(runAt, allJobs.length, 0, duplicateCount, 0, errors);
    return;
  }

  // Step 3: Classify with Claude AI
  console.log("\n[3/5] Classifying with Claude AI...");
  const classifications = await classifyBatch(
    dedupResults.map(({ job }) => ({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
    })),
    ANTHROPIC_API_KEY!
  );

  // Step 4: Transform and filter
  console.log("\n[4/5] Transforming and filtering...");
  let rejectedCount = 0;
  let insertedCount = 0;

  for (let i = 0; i < dedupResults.length; i++) {
    const { job: raw, applyUrlNormalized, dedupeKey } = dedupResults[i];
    const classified = classifications[i];

    if (!classified || classified.relevanceScore < MIN_SCORE) {
      rejectedCount++;
      if (classified) {
        console.log(
          `  ✗ Rejected (score ${classified.relevanceScore}): ${raw.title}`
        );
      }
      continue;
    }

    const slug = await ensureUniqueSlug(
      generateSlug(classified.cleanTitle, classified.companyName),
      convex
    );

    // Step 5: Resolve company logo
    // Priority: JSearch logo > Clearbit logo from domain > null
    let logoUrl: string | undefined = raw.companyLogoUrl ?? undefined;
    if (!logoUrl && classified.companyDomain) {
      // Clearbit Logo API (free, no auth) — returns a logo image for any domain
      const clearbitUrl = `https://logo.clearbit.com/${classified.companyDomain}`;
      try {
        const logoCheck = await fetch(clearbitUrl, { method: "HEAD" });
        if (logoCheck.ok) {
          logoUrl = clearbitUrl;
        }
      } catch {
        // Clearbit unavailable, skip
      }
    }

    // Step 6: SEO-optimize the description
    let description: string | undefined = raw.description ?? undefined;
    if (description && ANTHROPIC_API_KEY) {
      description = await rewriteForSeo(
        description,
        classified.cleanTitle,
        classified.companyName,
        classified.category,
        classified.location,
        ANTHROPIC_API_KEY
      );
    }

    // Step 7: Insert into Convex
    await convex.mutation(api.jobs.insertJob, {
      title: classified.cleanTitle,
      slug,
      companyName: classified.companyName,
      companyLogoUrl: logoUrl,
      jobDescription: description,
      category: classified.category,
      jobType: classified.jobType,
      location: classified.location,
      applyUrl: raw.applyUrl ?? undefined,
      isVerified: false,
      relevanceScore: classified.relevanceScore,
      source: raw.source,
      sourceId: raw.sourceId,
      publishedAt: raw.publishedAt ?? new Date().toISOString(),
      ...(classified.aboutCompany
        ? { aboutCompany: classified.aboutCompany }
        : {}),
      ...(classified.companyDomain
        ? { companyDomain: classified.companyDomain }
        : {}),
      ...(classified.companyType
        ? { companyType: classified.companyType }
        : {}),
      ...(applyUrlNormalized ? { applyUrlNormalized } : {}),
      dedupeKey,
    });

    insertedCount++;
    console.log(
      `  ✓ Inserted (score ${classified.relevanceScore}, ${classified.category}): ${classified.cleanTitle} [${classified.companyName}]`
    );
  }

  // Log the run
  await logRun(
    runAt,
    allJobs.length,
    insertedCount,
    duplicateCount,
    rejectedCount,
    errors
  );

  console.log(`\n=== Summary ===`);
  console.log(`  Fetched:    ${allJobs.length}`);
  console.log(`  Duplicates: ${duplicateCount}`);
  console.log(`  Rejected:   ${rejectedCount}`);
  console.log(`  Inserted:   ${insertedCount}`);
  if (errors.length > 0) {
    console.log(`  Errors:     ${errors.join("; ")}`);
  }
  console.log(`\nDone!`);
}

async function logRun(
  runAt: string,
  fetched: number,
  inserted: number,
  duplicates: number,
  rejected: number,
  errors: string[]
) {
  try {
    await convex.mutation(api.jobs.logIngestionRun, {
      runAt,
      source: "pipeline",
      jobsFetched: fetched,
      jobsNew: inserted,
      jobsDuplicate: duplicates,
      jobsRejected: rejected,
      ...(errors.length > 0 ? { errors: errors.join("; ") } : {}),
    });
  } catch (err) {
    console.error("Failed to log ingestion run:", err);
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
