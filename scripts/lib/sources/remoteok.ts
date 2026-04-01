/**
 * RemoteOK API fetcher.
 * Free, no auth required. Returns remote-only job listings.
 * https://remoteok.com/api
 */

export interface RawJob {
  source: "remoteok";
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

interface RemoteOKJob {
  id: string;
  slug: string;
  company: string;
  position: string;
  description: string;
  location: string;
  tags: string[];
  url: string;
  date: string;
  logo: string;
  company_logo: string;
}

const WEBFLOW_KEYWORDS = [
  "webflow",
  "no-code",
  "nocode",
  "no code",
];

function isRelevant(job: RemoteOKJob): boolean {
  const text =
    `${job.position} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  return WEBFLOW_KEYWORDS.some((kw) => text.includes(kw));
}

export async function fetchRemoteOKJobs(): Promise<RawJob[]> {
  const response = await fetch("https://remoteok.com/api", {
    headers: {
      "User-Agent": "webflow-jobs-ingestion/1.0",
    },
  });

  if (!response.ok) {
    console.error(
      `RemoteOK API error: ${response.status} ${response.statusText}`
    );
    return [];
  }

  const json: RemoteOKJob[] = await response.json();

  // First item is metadata/legal notice, skip it
  const jobs = json.slice(1).filter(isRelevant);

  return jobs.map((j) => ({
    source: "remoteok" as const,
    title: j.position,
    company: j.company,
    companyLogoUrl: j.company_logo || j.logo || null,
    companyWebsite: null,
    location: j.location || "Remote",
    description: j.description,
    applyUrl: j.url,
    publishedAt: j.date ? new Date(j.date).toISOString() : null,
    sourceId: j.id,
  }));
}
