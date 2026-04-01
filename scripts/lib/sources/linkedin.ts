/**
 * LinkedIn Jobs fetcher via public search HTML.
 * LinkedIn's public job search pages don't require authentication.
 * We parse the HTML to extract job listings.
 */

export interface RawJob {
  source: "linkedin";
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

const SEARCH_QUERIES = [
  "webflow developer",
  "webflow designer",
  "webflow SEO",
  "webflow marketing",
];

async function fetchLinkedInSearch(query: string): Promise<RawJob[]> {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=&f_TPR=r604800&start=0`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.error(`LinkedIn search error for "${query}": ${response.status}`);
      return [];
    }

    const html = await response.text();
    return parseLinkedInHTML(html);
  } catch (err) {
    console.error(`LinkedIn fetch failed for "${query}":`, err);
    return [];
  }
}

function parseLinkedInHTML(html: string): RawJob[] {
  const jobs: RawJob[] = [];

  // LinkedIn returns <li> elements with job card data
  // Each card has a base-card class with data attributes
  const cardRegex = /<div[^>]*class="[^"]*base-card[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  const cards = html.match(cardRegex) || [];

  // Simpler approach: extract from the structured data in each <li>
  const liRegex = /<li>[\s\S]*?<\/li>/g;
  const items = html.match(liRegex) || [];

  for (const item of items) {
    try {
      // Extract title
      const titleMatch = item.match(
        /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/
      );
      const title = titleMatch?.[1]?.trim();
      if (!title) continue;

      // Extract company name
      const companyMatch = item.match(
        /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/
      );
      const company = companyMatch?.[1]?.trim() ?? "Unknown";

      // Extract location
      const locationMatch = item.match(
        /<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/
      );
      const location = locationMatch?.[1]?.trim() ?? null;

      // Extract job URL
      const urlMatch = item.match(
        /<a[^>]*class="[^"]*base-card__full-link[^"]*"[^>]*href="([^"]*)"[^>]*>/
      );
      const applyUrl = urlMatch?.[1]?.replace(/&amp;/g, "&").split("?")[0] ?? null;

      // Extract job ID from URL
      const idMatch = applyUrl?.match(/(\d+)/);
      const sourceId = idMatch?.[1] ?? `linkedin-${Date.now()}-${Math.random()}`;

      // Extract company logo
      const logoMatch = item.match(
        /<img[^>]*class="[^"]*artdeco-entity-image[^"]*"[^>]*data-delayed-url="([^"]*)"[^>]*/
      );
      const companyLogoUrl = logoMatch?.[1]?.replace(/&amp;/g, "&") ?? null;

      // Extract date
      const dateMatch = item.match(
        /<time[^>]*datetime="([^"]*)"[^>]*>/
      );
      const publishedAt = dateMatch?.[1] ?? null;

      jobs.push({
        source: "linkedin",
        title,
        company,
        companyLogoUrl,
        companyWebsite: null,
        location,
        description: null, // LinkedIn search doesn't include descriptions, will be filled by detail page
        applyUrl,
        publishedAt,
        sourceId,
      });
    } catch {
      // Skip malformed entries
    }
  }

  return jobs;
}

/** Fetch the description from a LinkedIn job detail page. */
async function fetchJobDescription(jobUrl: string): Promise<string | null> {
  try {
    const response = await fetch(jobUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // LinkedIn wraps the description in a div with class "description__text"
    const descMatch = html.match(
      /<div[^>]*class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/section|<footer)/
    );
    if (descMatch?.[1]) {
      // Clean up the HTML — remove LinkedIn-specific classes but keep structure
      return descMatch[1]
        .replace(/class="[^"]*"/g, "")
        .replace(/data-[a-z-]*="[^"]*"/g, "")
        .replace(/<\/?span[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Fallback: try show-more-less-html
    const showMoreMatch = html.match(
      /<div[^>]*class="[^"]*show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/
    );
    if (showMoreMatch?.[1]) {
      return showMoreMatch[1]
        .replace(/class="[^"]*"/g, "")
        .replace(/data-[a-z-]*="[^"]*"/g, "")
        .replace(/<\/?span[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }

    return null;
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exclude Webflow Inc — we want jobs USING Webflow, not AT Webflow
const EXCLUDED_COMPANIES = new Set(["webflow"]);

export async function fetchLinkedInJobs(): Promise<RawJob[]> {
  const seen = new Set<string>();
  const jobs: RawJob[] = [];

  for (const query of SEARCH_QUERIES) {
    const batch = await fetchLinkedInSearch(query);
    for (const job of batch) {
      if (seen.has(job.sourceId)) continue;
      seen.add(job.sourceId);
      if (EXCLUDED_COMPANIES.has(job.company.toLowerCase())) continue;
      jobs.push(job);
    }
    // 2s delay between requests to be respectful
    await delay(2000);
  }

  console.log(`  LinkedIn: found ${jobs.length} listings, fetching descriptions...`);

  // Fetch descriptions from detail pages (in batches to be respectful)
  let fetched = 0;
  for (const job of jobs) {
    if (job.applyUrl) {
      job.description = await fetchJobDescription(job.applyUrl);
      if (job.description) fetched++;
      await delay(1500);
    }
  }
  console.log(`  LinkedIn: got descriptions for ${fetched}/${jobs.length} jobs`);

  return jobs;
}
