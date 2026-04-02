/**
 * Daily report — sends Bryce a summary email every day.
 *
 * Covers:
 * 1. Jobs posted today
 * 2. Agency emails sent today (with quotes)
 * 3. Click performance: today, yesterday, and rolling 7-day breakdown
 *
 * Usage:
 *   CONVEX_URL=<url> CHOQUER_RESEND_API_KEY=<key> npx tsx scripts/daily-report.ts
 *
 * Environment variables:
 *   CONVEX_URL              - Convex deployment URL
 *   CHOQUER_RESEND_API_KEY  - Resend API key
 *   CHOQUER_FROM_EMAIL      - Sender email
 *   REPORT_TO_EMAIL         - Where to send the report (default: bryce@choquer.agency)
 */

import { ConvexHttpClient } from "convex/browser";
import { Resend } from "resend";
import { api } from "../convex/_generated/api";

const CONVEX_URL =
  process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const CHOQUER_RESEND_API_KEY = process.env.CHOQUER_RESEND_API_KEY;
const CHOQUER_FROM_EMAIL =
  process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
const REPORT_TO_EMAIL =
  process.env.REPORT_TO_EMAIL || "bryce@choquer.agency";

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL is required");
  process.exit(1);
}
if (!CHOQUER_RESEND_API_KEY) {
  console.error("Error: CHOQUER_RESEND_API_KEY is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function dayLabel(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  return `${n} days ago`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Daily Report ===");
  console.log(`Generating report for ${formatDate(new Date())}...\n`);

  const sevenDaysAgo = daysAgo(7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();
  const sevenDaysAgoMs = sevenDaysAgo.getTime();
  const todayStart = daysAgo(0).toISOString();
  const todayMs = daysAgo(0).getTime();

  // Fetch all data in parallel
  const [jobs, agencyEmails, webflowEmails, clicks] = await Promise.all([
    convex.query(api.reporting.getJobsSince, { sinceMs: sevenDaysAgoMs }) as Promise<any[]>,
    convex.query(api.reporting.getAgencyOutreachSince, {
      since: sevenDaysAgoStr,
    }) as Promise<any[]>,
    convex.query(api.reporting.getOutreachSince, {
      since: sevenDaysAgoStr,
    }) as Promise<any[]>,
    convex.query(api.reporting.getClicksSince, {
      since: sevenDaysAgoStr,
    }) as Promise<any[]>,
  ]);

  // --- TODAY'S JOBS ---
  const todaysJobs = jobs.filter((j: any) => j._creationTime >= todayMs);

  // --- TODAY'S AGENCY EMAILS ---
  const todaysAgencyEmails = agencyEmails.filter(
    (e: any) => e.sentAt >= todayStart
  );

  // --- TODAY'S WEBFLOW EMAILS ---
  const todaysWebflowEmails = webflowEmails.filter(
    (e: any) => e.sentAt >= todayStart
  );

  // --- CLICKS BY DAY ---
  const clicksByDay: {
    day: string;
    label: string;
    cal: number;
    website: number;
    companies: Set<string>;
  }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = daysAgo(i).toISOString();
    const dayEnd = daysAgo(i - 1).toISOString();
    const dayClicks = clicks.filter(
      (c: any) => c.clickedAt >= dayStart && c.clickedAt < dayEnd
    );

    const companies = new Set<string>();
    let cal = 0;
    let website = 0;
    for (const c of dayClicks) {
      if (c.linkType === "cal") cal++;
      if (c.linkType === "website") website++;
      companies.add(c.companyName);
    }

    clicksByDay.push({
      day: formatDate(daysAgo(i)),
      label: dayLabel(i),
      cal,
      website,
      companies,
    });
  }

  // --- EMAILS BY DAY ---
  const emailsByDay: { label: string; count: number; companies: string[] }[] =
    [];
  for (let i = 0; i < 7; i++) {
    const dayStart = daysAgo(i).toISOString();
    const dayEnd = daysAgo(i - 1).toISOString();
    const dayEmails = agencyEmails.filter(
      (e: any) => e.sentAt >= dayStart && e.sentAt < dayEnd
    );
    emailsByDay.push({
      label: dayLabel(i),
      count: dayEmails.length,
      companies: dayEmails.map((e: any) => e.companyName),
    });
  }

  // --- BUILD WEBFLOW SENT LOOKUP (company domain → true) ---
  const webflowSentDomains = new Set<string>();
  for (const e of webflowEmails) {
    webflowSentDomains.add(e.companyDomain);
  }

  // --- BUILD HTML ---
  const html = buildReportHtml({
    todaysJobs,
    todaysAgencyEmails,
    clicksByDay,
    emailsByDay,
    webflowSentDomains,
  });

  // --- SEND ---
  const resend = new Resend(CHOQUER_RESEND_API_KEY);
  const today = formatDate(new Date());

  const { error } = await resend.emails.send({
    from: `Choquer Daily Report <${CHOQUER_FROM_EMAIL}>`,
    to: [REPORT_TO_EMAIL],
    subject: `Daily Report — ${today} | ${todaysJobs.length} jobs, ${todaysAgencyEmails.length} emails sent`,
    html,
  });

  if (error) {
    console.error("Failed to send report:", error.message);
    process.exit(1);
  }

  console.log(`✓ Report sent to ${REPORT_TO_EMAIL}`);
  console.log(`  Jobs today: ${todaysJobs.length}`);
  console.log(`  Agency emails today: ${todaysAgencyEmails.length}`);
  console.log(`  Clicks today: ${clicksByDay[0].cal + clicksByDay[0].website}`);
}

// ---------------------------------------------------------------------------
// HTML Builder
// ---------------------------------------------------------------------------

interface ReportData {
  todaysJobs: any[];
  todaysAgencyEmails: any[];
  clicksByDay: {
    day: string;
    label: string;
    cal: number;
    website: number;
    companies: Set<string>;
  }[];
  emailsByDay: { label: string; count: number; companies: string[] }[];
  webflowSentDomains: Set<string>;
}

function buildReportHtml(data: ReportData): string {
  const sectionStyle =
    "margin-bottom: 28px; border-bottom: 1px solid #eee; padding-bottom: 20px;";
  const h2Style = "font-size: 16px; color: #1a1a1a; margin: 0 0 12px;";
  const tableStyle =
    "width: 100%; border-collapse: collapse; font-size: 13px;";
  const thStyle =
    "text-align: left; padding: 8px 12px; background: #f5f5f5; border-bottom: 1px solid #eee; font-weight: 600; color: #555;";
  const tdStyle =
    "padding: 8px 12px; border-bottom: 1px solid #f0f0f0; color: #333;";
  const checkmark = '<span style="color: #16a34a; font-weight: 700;">&#10003;</span>';
  const dash = '<span style="color: #ccc;">—</span>';

  // --- Today's Jobs (with W. Sent column) ---
  let jobsHtml = "";
  if (data.todaysJobs.length === 0) {
    jobsHtml = '<p style="color: #888; font-size: 13px;">No new jobs today.</p>';
  } else {
    const rows = data.todaysJobs
      .map((j: any) => {
        const wSent = j.companyDomain && data.webflowSentDomains.has(j.companyDomain)
          ? checkmark
          : dash;
        return `<tr><td style="${tdStyle}">${j.title}</td><td style="${tdStyle}">${j.companyName}</td><td style="${tdStyle}">${j.category || "—"}</td><td style="${tdStyle} text-align: center;">${wSent}</td></tr>`;
      })
      .join("");
    jobsHtml = `<table style="${tableStyle}"><tr><th style="${thStyle}">Title</th><th style="${thStyle}">Company</th><th style="${thStyle}">Category</th><th style="${thStyle} text-align: center;">W. Sent</th></tr>${rows}</table>`;
  }

  // --- Today's Agency Emails ---
  let agencyHtml = "";
  if (data.todaysAgencyEmails.length === 0) {
    agencyHtml =
      '<p style="color: #888; font-size: 13px;">No agency emails sent today.</p>';
  } else {
    const rows = data.todaysAgencyEmails
      .map(
        (e: any) =>
          `<tr><td style="${tdStyle}">${e.companyName}</td><td style="${tdStyle}">${e.contactEmail}</td><td style="${tdStyle}">${e.quotedPackage}</td></tr>`
      )
      .join("");
    agencyHtml = `<table style="${tableStyle}"><tr><th style="${thStyle}">Company</th><th style="${thStyle}">Email</th><th style="${thStyle}">Quoted</th></tr>${rows}</table>`;
  }

  // --- Click Performance (7-day breakdown) ---
  const clickRows = data.clicksByDay
    .map((d) => {
      const total = d.cal + d.website;
      const hasClicks = total > 0;
      const companyList =
        d.companies.size > 0 ? [...d.companies].join(", ") : "";
      const calColor = d.cal > 0 ? "color: #16a34a; font-weight: 600;" : "";
      const webColor =
        d.website > 0 ? "color: #2563eb; font-weight: 600;" : "";
      const rowBg = hasClicks ? "background-color: #f0fdf4;" : "";
      return `<tr style="${rowBg}">
        <td style="${tdStyle} font-weight: 600;">${d.label}</td>
        <td style="${tdStyle}">${d.day}</td>
        <td style="${tdStyle} ${calColor}">${d.cal}</td>
        <td style="${tdStyle} ${webColor}">${d.website}</td>
        <td style="${tdStyle} font-weight: 600;">${total}</td>
        ${companyList ? `<td style="${tdStyle} font-size: 12px; color: #555;">${companyList}</td>` : `<td style="${tdStyle}"></td>`}
      </tr>`;
    })
    .join("");

  const clicksHtml = `<table style="${tableStyle}">
    <tr>
      <th style="${thStyle}"></th>
      <th style="${thStyle}">Date</th>
      <th style="${thStyle}">Book a Call</th>
      <th style="${thStyle}">Website</th>
      <th style="${thStyle}">Total</th>
      <th style="${thStyle}">Who Clicked</th>
    </tr>
    ${clickRows}
  </table>`;

  // --- 7-Day Agency Email Summary ---
  const emailSummaryRows = data.emailsByDay
    .filter((d) => d.count > 0)
    .map(
      (d) =>
        `<tr><td style="${tdStyle} font-weight: 600;">${d.label}</td><td style="${tdStyle}">${d.count}</td><td style="${tdStyle} font-size: 12px; color: #666;">${d.companies.join(", ")}</td></tr>`
    )
    .join("");

  const emailSummaryHtml =
    emailSummaryRows.length > 0
      ? `<table style="${tableStyle}"><tr><th style="${thStyle}">Day</th><th style="${thStyle}">Sent</th><th style="${thStyle}">Companies</th></tr>${emailSummaryRows}</table>`
      : '<p style="color: #888; font-size: 13px;">No agency emails sent in the past 7 days.</p>';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #333;">
  <div style="max-width: 700px; margin: 0 auto; padding: 24px;">

    <h1 style="font-size: 20px; color: #1a1a1a; margin: 0 0 4px;">Daily Report</h1>
    <p style="color: #888; font-size: 13px; margin: 0 0 24px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

    <!-- Stats bar -->
    <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse;">
      <tr>
        <td style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${data.todaysJobs.length}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Jobs Posted</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: #1a1a1a;">${data.todaysAgencyEmails.length}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Agency Emails</div>
        </td>
        <td style="width: 8px;"></td>
        <td style="background: #f5f5f5; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 28px; font-weight: 700; color: ${data.clicksByDay[0].cal > 0 ? "#16a34a" : "#1a1a1a"};">${data.clicksByDay[0].cal + data.clicksByDay[0].website}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px;">Clicks Today</div>
        </td>
      </tr>
    </table>

    <div style="${sectionStyle}">
      <h2 style="${h2Style}">Jobs Posted Today</h2>
      ${jobsHtml}
    </div>

    <div style="${sectionStyle}">
      <h2 style="${h2Style}">Agency Emails Sent Today</h2>
      ${agencyHtml}
    </div>

    <div style="${sectionStyle}">
      <h2 style="${h2Style}">Click Performance (7 Days)</h2>
      ${clicksHtml}
    </div>

    <div style="margin-bottom: 28px;">
      <h2 style="${h2Style}">Agency Emails — 7 Day History</h2>
      ${emailSummaryHtml}
    </div>

  </div>
</body>
</html>`;
}

main().catch((err) => {
  console.error("Report failed:", err);
  process.exit(1);
});
