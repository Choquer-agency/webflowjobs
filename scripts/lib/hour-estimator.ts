/**
 * Claude AI hour estimator for Choquer Agency retainer recommendations.
 * Estimates monthly hours needed based on job description and maps to retainer tiers.
 */

import Anthropic from "@anthropic-ai/sdk";

export interface HourEstimate {
  estimatedHours: 10 | 15 | 20 | 30 | 40;
  roleLabel: string;
  projectScope: string;
}

const RETAINER_TIERS = [10, 15, 20, 30, 40] as const;

const SYSTEM_PROMPT = `You are a project estimator for a Webflow agency. Given a job listing, estimate how many hours per month an agency retainer would need to handle this work.

Available retainer tiers (pick the closest match):
- 10 hours/month: Simple sites, basic maintenance, light SEO/marketing work
- 15 hours/month: Multi-page sites, email templates, landing pages, moderate design work
- 20 hours/month: Complex sites with CMS, integrations, ongoing design + development
- 30 hours/month: Large-scale Webflow development, CRO, analytics, custom code, multiple projects
- 40 hours/month: Full-service engagement — development, design, copy, SEO, ongoing optimization

Consider these complexity signals:
- Number of pages or templates needed
- Custom interactions/animations
- CMS collections and dynamic content
- eCommerce or payment integrations
- Third-party tool integrations (analytics, CRM, etc.)
- SEO/content requirements
- Design complexity (brand identity, UI/UX)
- Ongoing maintenance vs one-time build

If the description is vague, default to 20 hours (mid-range).

Respond with ONLY a JSON object with these fields:
- estimatedHours: one of 10, 15, 20, 30, 40
- roleLabel: a short, natural way to refer to the role in conversation (2-4 words, lowercase). Examples: "webflow developer", "digital designer", "SEO specialist", "marketing lead". Do NOT just copy the full job title — simplify it.
- projectScope: 2-3 sentences describing what the project actually needs, written casually like you're briefing a coworker. Reference specific things from the job description — tools they mentioned, types of pages they need, integrations they called out. This is the "we actually read your listing" proof. Do NOT use phrases like "comprehensive", "cutting-edge", "high-converting", "dynamic", or any marketing fluff. Just describe the work plainly and specifically.

No markdown code fences, no explanation.`;

export async function estimateProjectHours(
  title: string,
  companyName: string,
  description: string | null,
  category: string | null,
  jobType: string | null,
  apiKey: string
): Promise<HourEstimate> {
  const client = new Anthropic({ apiKey });

  const userMessage = `Job Title: ${title}
Company: ${companyName}
Category: ${category ?? "Not specified"}
Job Type: ${jobType ?? "Not specified"}
Description: ${description?.slice(0, 3000) ?? "No description available"}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let text =
      response.content[0].type === "text" ? response.content[0].text : "";
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
    const parsed = JSON.parse(text);

    // Snap to nearest valid tier
    const hours = RETAINER_TIERS.reduce((closest, tier) =>
      Math.abs(tier - parsed.estimatedHours) <
      Math.abs(closest - parsed.estimatedHours)
        ? tier
        : closest
    );

    return {
      estimatedHours: hours as HourEstimate["estimatedHours"],
      roleLabel: parsed.roleLabel ?? "webflow developer",
      projectScope: parsed.projectScope ?? "Webflow development and design work",
    };
  } catch (err) {
    console.error(`Hour estimation failed for "${title}":`, err);
    return {
      estimatedHours: 20,
      roleLabel: "webflow developer",
      projectScope: "Webflow development and design work",
    };
  }
}
