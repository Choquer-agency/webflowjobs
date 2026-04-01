/**
 * Claude AI classifier for job relevance scoring and data extraction.
 * Uses Claude Haiku for cost efficiency (~$0.02/day).
 */

import Anthropic from "@anthropic-ai/sdk";

export interface ClassifiedJob {
  relevanceScore: number;
  category: string;
  jobType: string;
  cleanTitle: string;
  companyName: string;
  companyDomain: string | null;
  location: string;
  isRemote: boolean;
  aboutCompany: string | null;
}

const SYSTEM_PROMPT = `You are a job relevance classifier for webflow.jobs, a job board focused on the Webflow ecosystem and adjacent web roles.

Score each job's relevance to the Webflow ecosystem on a scale of 1-10:
- 9-10: Webflow is a PRIMARY requirement (e.g., "Webflow Developer", "Build sites in Webflow")
- 7-8: Webflow is a SIGNIFICANT part of the role (e.g., designer who will use Webflow among 2-3 tools)
- 5-6: Webflow is MENTIONED as a nice-to-have or the role is clearly adjacent (SEO for Webflow sites, CRO specialist at a Webflow agency)
- 3-4: General web role where Webflow is barely mentioned
- 1-2: Not relevant to Webflow ecosystem

Also extract and return:
- category: one of "Webflow Developer", "Designer", "SEO", "CRO", "Google Ads", "Marketing", "Other"
- jobType: one of "Full-time", "Part-time", "Freelance", "Contract"
- cleanTitle: the actual job title, cleaned up (remove "... hiring ... in ... | LinkedIn" patterns, remove company name prefixes)
- companyName: the ACTUAL company that is hiring, NOT the job platform. If the company field says "Upwork", "LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", or similar job platforms, look in the job description for the real company name. If no real company name can be found, use "Confidential".
- companyDomain: the company's website domain (e.g., "acme.com") if mentioned or inferable from the description. Return null if unknown. Do NOT return job platform domains like upwork.com or linkedin.com.
- location: the job location, or "Remote" if remote
- isRemote: true if the job is remote or hybrid-remote
- aboutCompany: a 1-2 sentence summary of the company from the description, or null if not available

Respond with ONLY a JSON object, no markdown code fences, no explanation.`;

export async function classifyJob(
  title: string,
  company: string,
  description: string | null,
  location: string | null,
  apiKey: string
): Promise<ClassifiedJob | null> {
  const client = new Anthropic({ apiKey });

  const userMessage = `Job Title: ${title}
Company: ${company}
Location: ${location ?? "Not specified"}
Description: ${description?.slice(0, 3000) ?? "No description available"}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let text =
      response.content[0].type === "text" ? response.content[0].text : "";
    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    return JSON.parse(text) as ClassifiedJob;
  } catch (err) {
    console.error(`Classification failed for "${title}":`, err);
    return null;
  }
}

export async function classifyBatch(
  jobs: Array<{
    title: string;
    company: string;
    description: string | null;
    location: string | null;
  }>,
  apiKey: string,
  concurrency = 5
): Promise<(ClassifiedJob | null)[]> {
  const results: (ClassifiedJob | null)[] = new Array(jobs.length).fill(null);

  // Process in batches to respect rate limits
  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((j) =>
        classifyJob(j.title, j.company, j.description, j.location, apiKey)
      )
    );
    for (let k = 0; k < batchResults.length; k++) {
      results[i + k] = batchResults[k];
    }
  }

  return results;
}
