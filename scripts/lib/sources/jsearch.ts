/**
 * JSearch API fetcher (via RapidAPI).
 * Aggregates Google Jobs — covers LinkedIn, Indeed, Glassdoor, ZipRecruiter, etc.
 *
 * Free tier: 200 requests/month. Basic plan: ~$30/month for 10K requests.
 * Sign up at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 */

export interface RawJob {
  source: "jsearch";
  title: string;
  company: string;
  companyLogoUrl: string | null;
  companyWebsite: string | null;
  location: string | null;
  description: string | null;
  applyUrl: string | null;
  publishedAt: string | null;
  sourceId: string;
}

interface JSearchResult {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_description: string | null;
  job_apply_link: string | null;
  job_posted_at_datetime_utc: string | null;
  job_is_remote: boolean;
}

interface JSearchResponse {
  status: string;
  data: JSearchResult[];
}

const SEARCH_QUERIES = [
  "webflow developer",
  "webflow designer",
  "webflow SEO specialist",
  "webflow marketing manager",
  "no-code developer webflow",
  "webflow agency hiring",
  "webflow web designer",
  "webflow CRO specialist",
];

// Employers to exclude:
// - Freelance platforms (no real company info)
// - Webflow Inc itself (we want jobs USING Webflow, not AT Webflow)
const EXCLUDED_EMPLOYERS = new Set([
  "upwork",
  "fiverr",
  "freelancer",
  "webflow",
  "toptal",
  "peopleperhour",
]);

function formatLocation(result: JSearchResult): string {
  if (result.job_is_remote) return "Remote";
  const parts = [result.job_city, result.job_state, result.job_country].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

async function searchJobs(
  query: string,
  apiKey: string
): Promise<RawJob[]> {
  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("date_posted", "week");

  const response = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  });

  if (!response.ok) {
    console.error(
      `JSearch API error for "${query}": ${response.status} ${response.statusText}`
    );
    return [];
  }

  const json: JSearchResponse = await response.json();
  if (!json.data) return [];

  return json.data.map((r) => ({
    source: "jsearch" as const,
    title: r.job_title,
    company: r.employer_name,
    companyLogoUrl: r.employer_logo,
    companyWebsite: r.employer_website,
    location: formatLocation(r),
    description: r.job_description,
    applyUrl: r.job_apply_link,
    publishedAt: r.job_posted_at_datetime_utc,
    sourceId: r.job_id,
  }));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJSearchJobs(apiKey: string): Promise<RawJob[]> {
  // Run queries sequentially with delay to avoid rate limits
  const seen = new Set<string>();
  const jobs: RawJob[] = [];
  let skippedPlatforms = 0;

  for (const query of SEARCH_QUERIES) {
    const batch = await searchJobs(query, apiKey);
    for (const job of batch) {
      if (seen.has(job.sourceId)) continue;
      seen.add(job.sourceId);

      // Skip jobs from freelance platforms (no real company info)
      if (EXCLUDED_EMPLOYERS.has(job.company.toLowerCase())) {
        skippedPlatforms++;
        continue;
      }

      jobs.push(job);
    }
    // 1.5s delay between requests to stay within rate limits
    await delay(1500);
  }

  if (skippedPlatforms > 0) {
    console.log(`  Skipped ${skippedPlatforms} freelance platform listings (Upwork, etc.)`);
  }

  return jobs;
}
