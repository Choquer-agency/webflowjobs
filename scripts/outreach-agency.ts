/**
 * Choquer Agency lead generation pipeline.
 *
 * Sends personalized retainer pitch emails to businesses found on Webflow Jobs.
 * Runs after the webflow.jobs outreach pipeline — only contacts businesses
 * (not agencies) whose webflow.jobs email was sent 20+ hours ago.
 *
 * Usage:
 *   CONVEX_URL=<url> CHOQUER_RESEND_API_KEY=<key> ANTHROPIC_API_KEY=<key> npx tsx scripts/outreach-agency.ts
 *
 * Environment variables:
 *   CONVEX_URL              - Convex deployment URL (or NEXT_PUBLIC_CONVEX_URL)
 *   CHOQUER_RESEND_API_KEY  - Resend API key for choquer.agency domain
 *   CHOQUER_FROM_EMAIL      - Sender email (default: bryce@choquer.agency)
 *   CHOQUER_HMAC_SECRET     - Secret for signing agency unsubscribe tokens
 *   CHOQUER_SITE_URL        - Agency website URL (default: https://choquer.agency)
 *   ANTHROPIC_API_KEY       - Anthropic API key for hour estimation
 *   DRY_RUN                 - Set to "true" to preview without sending
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { estimateProjectHours } from "./lib/hour-estimator";
import {
  sendAgencyEmail,
  calculateSavings,
  RETAINER_PACKAGES,
  type AgencyEmailData,
} from "./lib/agency-email-sender";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONVEX_URL =
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const CHOQUER_RESEND_API_KEY = process.env.CHOQUER_RESEND_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL is required");
  process.exit(1);
}
if (!CHOQUER_RESEND_API_KEY && !DRY_RUN) {
  console.error("Error: CHOQUER_RESEND_API_KEY is required (or set DRY_RUN=true)");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY is required");
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
  contactEmail?: string;
  category?: string;
  jobType?: string;
  jobDescription?: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function main() {
  console.log(`\n=== Choquer Agency Outreach Pipeline ===`);
  console.log(`Run at: ${new Date().toISOString()}`);
  if (DRY_RUN) console.log("*** DRY RUN MODE — no emails will be sent ***");
  console.log();

  // Step 1: Get eligible jobs
  console.log("[1/4] Fetching jobs eligible for agency outreach...");
  const pendingJobs = (await convex.query(
    api.agencyOutreach.getJobsPendingAgencyOutreach,
    {}
  )) as PendingJob[];

  console.log(`  Found ${pendingJobs.length} eligible jobs`);

  if (pendingJobs.length === 0) {
    console.log("No jobs to process. Done!");
    return;
  }

  // Step 2: Process each job individually (not grouped — each gets its own email)
  console.log("\n[2/4] Processing jobs...");
  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const job of pendingJobs) {
    const domain = job.companyDomain!;

    // Check if already emailed this company recently (60-day cooldown)
    const recentOutreach = await convex.query(
      api.agencyOutreach.getRecentAgencyOutreachByDomain,
      { companyDomain: domain, sinceDaysAgo: 60 }
    );

    if (recentOutreach.length > 0) {
      console.log(
        `  ⊘ Skipped (emailed recently): ${job.companyName} (${domain})`
      );
      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "skipped",
      });
      skippedCount++;
      continue;
    }

    // Use existing contact email from webflow.jobs outreach
    const contactEmail = job.contactEmail;
    if (!contactEmail) {
      console.log(
        `  ⊘ Skipped (no contact email): ${job.companyName} (${domain})`
      );
      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "skipped",
      });
      skippedCount++;
      continue;
    }

    // Check if email has unsubscribed from agency emails
    const unsub = await convex.query(
      api.agencyOutreach.checkAgencyUnsubscribed,
      { email: contactEmail }
    );

    if (unsub) {
      console.log(
        `  ⊘ Skipped (unsubscribed): ${job.companyName} (${contactEmail})`
      );
      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "skipped",
      });
      skippedCount++;
      continue;
    }

    // Estimate hours
    console.log(`  Estimating hours for: ${job.title} [${job.companyName}]`);
    const estimate = await estimateProjectHours(
      job.title,
      job.companyName,
      job.jobDescription ?? null,
      job.category ?? null,
      job.jobType ?? null,
      ANTHROPIC_API_KEY!
    );

    const { monthlyRetainer, savingsPercent } = calculateSavings(
      estimate.estimatedHours,
      job.category ?? "Other"
    );

    const quotedPackage = `${estimate.estimatedHours}h/${formatMoney(monthlyRetainer)}`;

    console.log(
      `    → ${estimate.estimatedHours}h/mo (${formatMoney(monthlyRetainer)}/mo, ~${savingsPercent}% savings)`
    );
    console.log(`    → Scope: ${estimate.projectScope}`);

    const emailData: AgencyEmailData = {
      contactEmail,
      companyName: job.companyName,
      companyDomain: domain,
      jobTitle: job.title,
      jobSlug: job.slug,
      roleLabel: estimate.roleLabel,
      projectScope: estimate.projectScope,
      estimatedHours: estimate.estimatedHours,
      category: job.category ?? "Other",
    };

    if (DRY_RUN) {
      console.log(`  📧 [DRY RUN] Would send to ${contactEmail}:`);
      console.log(
        `    Subject: ${job.companyName} — Webflow help for your ${job.title} role`
      );
      console.log(`    Package: ${quotedPackage}`);
      sentCount++;

      // Still update the job with estimation data in dry run
      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "skipped",
        estimatedHours: estimate.estimatedHours,
        projectScope: estimate.projectScope,
      });
      continue;
    }

    // Send the email
    const result = await sendAgencyEmail(CHOQUER_RESEND_API_KEY!, emailData);

    if (result.success) {
      console.log(
        `  ✓ Sent to ${job.companyName} (${contactEmail}) — ${quotedPackage}`
      );

      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "sent",
        estimatedHours: estimate.estimatedHours,
        projectScope: estimate.projectScope,
      });

      await convex.mutation(api.agencyOutreach.logAgencyOutreach, {
        companyDomain: domain,
        companyName: job.companyName,
        contactEmail,
        jobSlug: job.slug,
        sentAt: new Date().toISOString(),
        status: "sent",
        resendMessageId: result.messageId,
        estimatedHours: estimate.estimatedHours,
        quotedPackage,
      });

      sentCount++;
    } else {
      console.log(
        `  ✗ Failed for ${job.companyName} (${contactEmail}): ${result.error}`
      );

      await convex.mutation(api.agencyOutreach.markAgencyOutreachStatus, {
        id: job._id as any,
        agencyOutreachStatus: "failed",
        estimatedHours: estimate.estimatedHours,
        projectScope: estimate.projectScope,
      });

      failedCount++;
    }

    // Brief delay between sends
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Step 4: Summary
  console.log(`\n[4/4] Summary`);
  console.log(`  Emails sent:    ${sentCount}`);
  console.log(`  Jobs skipped:   ${skippedCount}`);
  console.log(`  Emails failed:  ${failedCount}`);
  console.log(`\nDone!`);
}

main().catch((err) => {
  console.error("Agency outreach pipeline failed:", err);
  process.exit(1);
});
