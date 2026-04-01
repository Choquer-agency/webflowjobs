import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import type { Job, Resource } from "../src/lib/types";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const JOBS_CSV = path.resolve(
  process.env.JOBS_CSV ??
    path.join(
      process.env.HOME ?? "~",
      "Downloads",
      "Webflow Jobs V2 - Job Postings - 67bdfce987b2aa59ad5f675e.csv"
    )
);

const RESOURCES_CSV = path.resolve(
  process.env.RESOURCES_CSV ??
    path.join(
      process.env.HOME ?? "~",
      "Downloads",
      "Webflow Jobs V2 - Resources - 67bf751437f9cec49c17afd1.csv"
    )
);

const OUT_DIR = path.resolve(__dirname, "../src/data");
const JOBS_JSON = path.join(OUT_DIR, "jobs.json");
const RESOURCES_JSON = path.join(OUT_DIR, "resources.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse the Webflow date format into ISO 8601. */
function parseWebflowDate(raw: string | undefined | null): string | null {
  if (!raw || raw.trim() === "") return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Normalize the job type string. */
function normalizeJobType(raw: string | undefined | null): string | null {
  if (!raw || raw.trim() === "") return null;
  const lower = raw.trim().toLowerCase();
  if (lower === "full time" || lower === "full-time" || lower === "permanent") return "Full-time";
  if (lower === "part-time" || lower === "part time") return "Part-time";
  if (lower === "freelance") return "Freelance";
  if (lower === "contract") return "Contract";
  // Return the original (trimmed) if it doesn't match a known normalization
  return raw.trim();
}

function emptyToNull(val: string | undefined | null): string | null {
  if (val === undefined || val === null || val.trim() === "") return null;
  return val;
}

function isTruthy(val: string | undefined | null): boolean {
  if (!val) return false;
  return val.trim().toLowerCase() === "true";
}

// ---------------------------------------------------------------------------
// CSV → typed array
// ---------------------------------------------------------------------------

function readCsv(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<Record<string, string>>(raw, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors.length > 0) {
    console.warn(`CSV parse warnings for ${filePath}:`, result.errors.slice(0, 5));
  }
  return result.data;
}

function mapJobs(rows: Record<string, string>[]): Job[] {
  return rows
    .filter((r) => !isTruthy(r["Archived"]) && !isTruthy(r["Draft"]))
    .map((r) => ({
      id: r["Item ID"] ?? "",
      title: r["Job Title"] ?? "",
      slug: r["Slug"] ?? "",
      companyName: r["Company Name"] ?? "",
      companyLogoUrl: emptyToNull(r["Company Logo"]),
      aboutCompany: emptyToNull(r["About The Company"]),
      jobDescription: emptyToNull(r["Description"]),
      category: emptyToNull(r["Category"]),
      jobType: normalizeJobType(r["Type"]),
      location: emptyToNull(r["Location"]),
      applyUrl: emptyToNull(r["Job Posting URL"]),
      isVerified: isTruthy(r["Verified"]),
      publishedAt: parseWebflowDate(r["Published On"]),
      createdAt: parseWebflowDate(r["Created On"]) ?? new Date().toISOString(),
      updatedAt: parseWebflowDate(r["Updated On"]) ?? new Date().toISOString(),
    }))
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da; // newest first
    });
}

function mapResources(rows: Record<string, string>[]): Resource[] {
  return rows
    .filter((r) => !isTruthy(r["Archived"]) && !isTruthy(r["Draft"]))
    .map((r) => ({
      id: r["Item ID"] ?? "",
      title: r["Title"] ?? "",
      slug: r["Slug"] ?? "",
      resourceType: r["Resource Type"] ?? "",
      content: emptyToNull(r["Content"]),
      thumbnailUrl: emptyToNull(r["Thumbnail"]),
      metaTitle: emptyToNull(r["Meta tite"]), // note: typo in CSV header
      metaDescription: emptyToNull(r["Meta Description"]),
      publishedAt: parseWebflowDate(r["Published On"]),
      createdAt: parseWebflowDate(r["Created On"]) ?? new Date().toISOString(),
      updatedAt: parseWebflowDate(r["Updated On"]) ?? new Date().toISOString(),
    }))
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return db - da;
    });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("--- CSV Import ---");

  // Ensure output directory exists
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Jobs
  console.log(`Reading jobs CSV: ${JOBS_CSV}`);
  const jobRows = readCsv(JOBS_CSV);
  console.log(`  Raw rows: ${jobRows.length}`);
  const jobs = mapJobs(jobRows);
  console.log(`  After filtering (no archived/draft): ${jobs.length}`);
  fs.writeFileSync(JOBS_JSON, JSON.stringify(jobs, null, 2));
  console.log(`  Written to ${JOBS_JSON}`);

  // Resources
  console.log(`Reading resources CSV: ${RESOURCES_CSV}`);
  const resourceRows = readCsv(RESOURCES_CSV);
  console.log(`  Raw rows: ${resourceRows.length}`);
  const resources = mapResources(resourceRows);
  console.log(`  After filtering (no archived/draft): ${resources.length}`);
  fs.writeFileSync(RESOURCES_JSON, JSON.stringify(resources, null, 2));
  console.log(`  Written to ${RESOURCES_JSON}`);

  console.log("\nDone!");
}

main();
