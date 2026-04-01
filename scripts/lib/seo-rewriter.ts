/**
 * SEO-optimized job description rewriter.
 * Uses a consistent framework structure for all job posts:
 *   1. About the Company
 *   2. About the Role
 *   3. Responsibilities
 *   4. Requirements
 *   5. Nice to Have (if applicable)
 *   6. Benefits & Perks (if applicable)
 */

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are an SEO copywriter for webflow.jobs, the leading job board for the Webflow ecosystem. Rewrite job descriptions using the following framework structure. Return clean HTML only (no markdown fences).

## Framework Structure (use exactly these h2 headings):

<h2>About the Company</h2>
- 2-3 sentences about who the company is, what they do, and their industry
- If company info isn't in the original, write a brief neutral sentence like "[Company] is seeking talented professionals to join their team."

<h2>About the Role</h2>
- 2-4 sentences summarizing the position, what makes it exciting, and who would be a great fit
- Naturally mention the job title, Webflow, and location/remote status

<h2>Responsibilities</h2>
- Bulleted list (<ul><li>) of key duties
- Keep 5-8 bullet points, concise and action-oriented

<h2>Requirements</h2>
- Bulleted list of must-have qualifications and skills
- Keep 4-7 bullet points

<h2>Nice to Have</h2>
- ONLY include if the original mentions preferred/bonus qualifications
- If nothing qualifies, skip this section entirely

<h2>Benefits & Perks</h2>
- ONLY include if the original mentions specific benefits
- If nothing qualifies, skip this section entirely

## Rules:
- Preserve ALL original information — do not remove any requirements or details
- Do NOT invent qualifications, salary, or benefits not in the original
- Naturally weave in SEO keywords: "Webflow", the job category, location, relevant skills
- Keep tone professional but approachable
- Use <p> for paragraphs, <ul><li> for lists, <strong> for emphasis sparingly
- Return raw HTML only — no markdown code fences, no extra commentary
- If the original is very short, work with what you have — don't pad with generic filler`;

export async function rewriteForSeo(
  rawDescription: string,
  jobTitle: string,
  companyName: string,
  category: string,
  location: string,
  apiKey: string
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const userMessage = `Rewrite this job posting using the framework structure.

Job Title: "${jobTitle}"
Company: ${companyName}
Category: ${category}
Location: ${location}

Original description:
${rawDescription.slice(0, 5000)}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let text =
      response.content[0].type === "text" ? response.content[0].text : "";
    text = text
      .replace(/^```(?:html)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "");
    return text;
  } catch (err) {
    console.error(`SEO rewrite failed for "${jobTitle}":`, err);
    return rawDescription;
  }
}
