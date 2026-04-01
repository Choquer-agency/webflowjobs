/**
 * Daily outreach pipeline.
 *
 * Finds contact emails for newly posted jobs and sends personalized
 * outreach emails to companies, grouped by company domain.
 *
 * Usage:
 *   CONVEX_URL=<url> RESEND_API_KEY=<key> npx tsx scripts/outreach-jobs.ts
 *
 * Environment variables:
 *   CONVEX_URL          - Convex deployment URL (or NEXT_PUBLIC_CONVEX_URL)
 *   RESEND_API_KEY      - Resend API key for sending emails
 *   HUNTER_API_KEY      - Hunter.io API key (optional, falls back to generic emails)
 *   OUTREACH_HMAC_SECRET - Secret for signing unsubscribe tokens
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { findCompanyEmail } from "./lib/email-finder";
import { sendOutreachEmail, type OutreachJob } from "./lib/email-sender";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONVEX_URL =
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL is required");
  process.exit(1);
}
if (!RESEND_API_KEY) {
  console.error("Error: RESEND_API_KEY is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

interface PendingJob {
  _id: string;
  slug: string;
  title: string;
  companyName: string;
  companyDomain?: string;
  category?: string;
}

async function main() {
  console.log(`\n=== Outreach Pipeline ===`);
  console.log(`Run at: ${new Date().toISOString()}\n`);

  // Step 1: Get jobs pending outreach
  console.log("[1/4] Fetching jobs pending outreach...");
  const pendingJobs = (await convex.query(
    api.outreach.getJobsPendingOutreach,
    {}
  )) as PendingJob[];

  console.log(`  Found ${pendingJobs.length} jobs pending outreach`);

  if (pendingJobs.length === 0) {
    console.log("No jobs to process. Done!");
    return;
  }

  // Step 2: Group by company domain
  console.log("\n[2/4] Grouping by company domain...");
  const byDomain = new Map<
    string,
    { companyName: string; jobs: PendingJob[] }
  >();

  for (const job of pendingJobs) {
    if (!job.companyDomain) continue;

    const existing = byDomain.get(job.companyDomain);
    if (existing) {
      existing.jobs.push(job);
    } else {
      byDomain.set(job.companyDomain, {
        companyName: job.companyName,
        jobs: [job],
      });
    }
  }

  console.log(`  ${byDomain.size} unique companies to contact`);

  // Step 3: Process each company
  console.log("\n[3/4] Processing outreach...");
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const [domain, { companyName, jobs }] of byDomain) {
    // Check if already emailed recently (last 30 days)
    const recentOutreach = await convex.query(
      api.outreach.getRecentOutreachByDomain,
      { companyDomain: domain, sinceDaysAgo: 30 }
    );

    if (recentOutreach.length > 0) {
      console.log(`  ⊘ Skipped (emailed recently): ${companyName} (${domain})`);
      // Mark jobs as skipped
      for (const job of jobs) {
        await convex.mutation(api.outreach.markOutreachStatus, {
          id: job._id as any,
          outreachStatus: "skipped",
        });
      }
      skippedCount += jobs.length;
      continue;
    }

    // Find contact email
    const emailResult = await findCompanyEmail(domain, HUNTER_API_KEY);

    // Check if this email has unsubscribed
    const unsub = await convex.query(api.outreach.checkUnsubscribed, {
      email: emailResult.email,
    });

    if (unsub) {
      console.log(
        `  ⊘ Skipped (unsubscribed): ${companyName} (${emailResult.email})`
      );
      for (const job of jobs) {
        await convex.mutation(api.outreach.markOutreachStatus, {
          id: job._id as any,
          outreachStatus: "skipped",
          contactEmail: emailResult.email,
        });
      }
      skippedCount += jobs.length;
      continue;
    }

    // Send the email
    const outreachJobs: OutreachJob[] = jobs.map((j) => ({
      slug: j.slug,
      title: j.title,
      companyName: j.companyName,
      category: j.category,
    }));

    const result = await sendOutreachEmail(
      RESEND_API_KEY!,
      emailResult.email,
      companyName,
      outreachJobs
    );

    if (result.success) {
      console.log(
        `  ✓ Sent to ${companyName} (${emailResult.email}) — ${jobs.length} job(s) [${emailResult.source}]`
      );

      // Mark jobs as sent
      for (const job of jobs) {
        await convex.mutation(api.outreach.markOutreachStatus, {
          id: job._id as any,
          outreachStatus: "sent",
          contactEmail: emailResult.email,
        });
      }

      // Log outreach
      await convex.mutation(api.outreach.logOutreach, {
        companyDomain: domain,
        companyName,
        contactEmail: emailResult.email,
        jobSlugs: jobs.map((j) => j.slug),
        sentAt: new Date().toISOString(),
        status: "sent",
        resendMessageId: result.messageId,
      });

      sentCount++;
    } else {
      console.log(
        `  ✗ Failed for ${companyName} (${emailResult.email}): ${result.error}`
      );

      for (const job of jobs) {
        await convex.mutation(api.outreach.markOutreachStatus, {
          id: job._id as any,
          outreachStatus: "failed",
          contactEmail: emailResult.email,
        });
      }

      failedCount++;
    }

    // Brief delay between sends to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Step 4: Summary
  console.log(`\n[4/4] Summary`);
  console.log(`  Companies emailed: ${sentCount}`);
  console.log(`  Companies skipped: ${skippedCount}`);
  console.log(`  Companies failed:  ${failedCount}`);
  console.log(`\nDone!`);
}

main().catch((err) => {
  console.error("Outreach pipeline failed:", err);
  process.exit(1);
});
