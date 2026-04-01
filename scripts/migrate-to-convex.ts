/**
 * One-time migration: reads src/data/jobs.json and bulk-inserts into Convex.
 *
 * Usage:
 *   CONVEX_URL=<your-convex-url> npx tsx scripts/migrate-to-convex.ts
 *
 * The CONVEX_URL should be your deployment URL (e.g. https://your-project.convex.cloud).
 * You can find it in .env.local as NEXT_PUBLIC_CONVEX_URL after running `npx convex dev`.
 */

import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

interface LegacyJob {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogoUrl: string | null;
  aboutCompany: string | null;
  jobDescription: string | null;
  category: string | null;
  jobType: string | null;
  location: string | null;
  applyUrl: string | null;
  isVerified: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error(
    "Error: Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable.\n" +
      "You can find it in .env.local after running `npx convex dev`."
  );
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const JOBS_JSON = path.resolve(__dirname, "../src/data/jobs.json");
const BATCH_SIZE = 50;

async function main() {
  console.log("--- Migrate jobs.json → Convex ---");
  console.log(`Reading: ${JOBS_JSON}`);

  const raw = fs.readFileSync(JOBS_JSON, "utf-8");
  const legacyJobs: LegacyJob[] = JSON.parse(raw);
  console.log(`Total jobs in JSON: ${legacyJobs.length}`);

  const convexJobs = legacyJobs.map((j) => ({
    title: j.title,
    slug: j.slug,
    companyName: j.companyName,
    ...(j.companyLogoUrl ? { companyLogoUrl: j.companyLogoUrl } : {}),
    ...(j.aboutCompany ? { aboutCompany: j.aboutCompany } : {}),
    ...(j.jobDescription ? { jobDescription: j.jobDescription } : {}),
    ...(j.category ? { category: j.category } : {}),
    ...(j.jobType ? { jobType: j.jobType } : {}),
    ...(j.location ? { location: j.location } : {}),
    ...(j.applyUrl ? { applyUrl: j.applyUrl } : {}),
    isVerified: j.isVerified,
    source: "csv-import" as const,
    sourceId: j.id,
    ...(j.publishedAt ? { publishedAt: j.publishedAt } : {}),
  }));

  // Insert one at a time using the public mutation
  let inserted = 0;
  for (const job of convexJobs) {
    await client.mutation(api.jobs.insertJob, job);
    inserted++;
    if (inserted % 25 === 0) {
      console.log(`  Progress: ${inserted}/${convexJobs.length}`);
    }
  }

  console.log(`\nDone! Migrated ${inserted} jobs to Convex.`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
