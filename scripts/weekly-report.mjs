#!/usr/bin/env node
/**
 * Weekly SEO + business report emailer for webflow.jobs.
 *
 * - Pulls core metrics (7d vs prev 7d) from Convex (reporting.weeklyMetrics).
 * - Loads the week's SEO narrative + results from a content JSON file.
 * - Renders an email-safe HTML report and sends it via Resend.
 *
 * Usage:
 *   node scripts/weekly-report.mjs scripts/report-content/week-01.json
 *
 * Designed to be run by the Monday automation: generate next week's content
 * JSON, then invoke this script.
 */
import fs from "node:fs";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Resend } from "resend";

// ── Load .env.local ───────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv();

// ── Helpers ───────────────────────────────────────────────
const fmtMoney = (cents) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function delta(curr, prev) {
  const diff = curr - prev;
  if (prev === 0) {
    if (diff === 0) return { label: "—", color: "#888", arrow: "" };
    return { label: "new", color: "#16a34a", arrow: "▲" };
  }
  const pct = Math.round((diff / prev) * 100);
  if (diff > 0) return { label: `+${pct}%`, color: "#16a34a", arrow: "▲" };
  if (diff < 0) return { label: `${pct}%`, color: "#dc2626", arrow: "▼" };
  return { label: "0%", color: "#888", arrow: "" };
}

function metricRow(label, curr, prev, fmt = (x) => String(x)) {
  const d = delta(curr, prev);
  return `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${label}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#111;text-align:right;">${fmt(curr)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;">${fmt(prev)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;font-weight:600;color:${d.color};text-align:right;white-space:nowrap;">${d.arrow} ${d.label}</td>
    </tr>`;
}

function renderHtml(m, content) {
  const visitsRow = content.siteVisits
    ? metricRow("Site visits", content.siteVisits.last7, content.siteVisits.prev7)
    : `<tr>
        <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;color:#333;">Site visits</td>
        <td colspan="3" style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#b45309;text-align:right;">${content.siteVisitsNote || "Analytics not yet instrumented"}</td>
      </tr>`;

  const seoItems = (content.seo?.items || [])
    .map(
      (it) => `
      <li style="margin-bottom:14px;">
        <span style="font-weight:600;color:#111;">${it.what}</span><br/>
        <span style="font-size:13px;color:#555;">Why: ${it.why}</span>
      </li>`
    )
    .join("");

  const links = (content.seo?.links || [])
    .map(
      (l) =>
        `<li style="margin-bottom:6px;"><a href="${l.url}" style="color:#d97706;text-decoration:none;">${l.label}</a> <span style="color:#999;font-size:12px;">${l.kind || ""}</span></li>`
    )
    .join("");

  const section3 = content.prevWeekResults
    ? `<div style="font-size:14px;color:#333;line-height:1.7;">${content.prevWeekResults}</div>`
    : `<div style="font-size:14px;color:#555;line-height:1.7;background:#fafafa;border:1px dashed #ddd;border-radius:8px;padding:16px;">
        ${content.prevWeekResultsNote || "No prior week to compare yet. Starting next Monday, this section will report how the previous week's SEO changes performed — rich-result impressions (JobPosting / FAQ / Breadcrumb), click-through rate changes, and AI/LLM referral traffic."}
      </div>`;

  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:#111;padding:24px 28px;">
        <div style="color:#ff9500;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Webflow Jobs — Weekly Report</div>
        <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px;">Week ${content.weekNumber} · ${content.dateRange}</div>
      </div>

      <div style="padding:24px 28px;">
        <!-- SECTION 1 -->
        <div style="font-size:12px;font-weight:700;color:#ff9500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">① Core Metrics</div>
        <div style="font-size:12px;color:#999;margin-bottom:12px;">Last 7 days vs previous 7 days</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:#999;text-transform:uppercase;padding:6px 8px;">Metric</th>
              <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;padding:6px 8px;">Last 7d</th>
              <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;padding:6px 8px;">Prev 7d</th>
              <th style="text-align:right;font-size:11px;color:#999;text-transform:uppercase;padding:6px 8px;">Δ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;color:#333;">Total job postings (live)</td>
              <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#111;text-align:right;">${m.totalJobs}</td>
              <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;">—</td>
              <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;">—</td>
            </tr>
            ${metricRow("New jobs", m.newJobs.last7, m.newJobs.prev7)}
            ${metricRow("&nbsp;&nbsp;↳ System-found (automation)", m.jobsBySource.system.last7, m.jobsBySource.system.prev7)}
            ${metricRow("&nbsp;&nbsp;↳ Added via CTA (self-serve)", m.jobsBySource.cta.last7, m.jobsBySource.cta.prev7)}
            ${metricRow("Applicants", m.applicants.last7, m.applicants.prev7)}
            ${visitsRow}
            ${metricRow("Revenue", m.revenueCents.last7, m.revenueCents.prev7, fmtMoney)}
          </tbody>
        </table>
        <div style="font-size:12px;color:#999;margin-top:10px;">System-found vs CTA tracks our automation finding jobs vs companies finding us and posting themselves.</div>

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;"/>

        <!-- SECTION 2 -->
        <div style="font-size:12px;font-weight:700;color:#ff9500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">② SEO — What I Did & Why</div>
        <div style="font-size:14px;color:#333;margin-bottom:12px;">${content.seo?.summary || ""}</div>
        <ul style="padding-left:18px;margin:0 0 16px;">${seoItems}</ul>
        ${links ? `<div style="font-size:13px;font-weight:600;color:#111;margin-bottom:6px;">New pages / changes</div><ul style="padding-left:18px;margin:0;">${links}</ul>` : ""}

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;"/>

        <!-- SECTION 3 -->
        <div style="font-size:12px;font-weight:700;color:#ff9500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">③ Did Last Week's SEO Move the Needle?</div>
        ${section3}
      </div>

      <div style="background:#fafafa;padding:16px 28px;border-top:1px solid #eee;font-size:12px;color:#999;">
        Automated report · generated ${m.generatedAt.slice(0, 10)} · webflow.jobs
      </div>
    </div>
  </div>
</body></html>`;
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const contentPath = process.argv[2];
  if (!contentPath) {
    console.error("Usage: node scripts/weekly-report.mjs <content.json>");
    process.exit(1);
  }
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

  // Report against PRODUCTION data. REPORT_CONVEX_URL overrides the (dev)
  // NEXT_PUBLIC_CONVEX_URL found in local .env.local.
  const convexUrl =
    process.env.REPORT_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("REPORT_CONVEX_URL / NEXT_PUBLIC_CONVEX_URL not set");
  const convex = new ConvexHttpClient(convexUrl);
  const metrics = await convex.query(api.reporting.weeklyMetrics, {
    nowMs: Date.now(),
  });

  const html = renderHtml(metrics, content);

  const resendKey = process.env.CHOQUER_RESEND_API_KEY;
  if (!resendKey) throw new Error("CHOQUER_RESEND_API_KEY not set");
  const from = process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
  const to = process.env.REPORT_TO_EMAIL || "bryce@choquer.agency";

  if (process.env.DRY_RUN === "1") {
    fs.writeFileSync("scripts/.report-preview.html", html);
    console.log("DRY_RUN: wrote scripts/.report-preview.html");
    console.log(JSON.stringify(metrics, null, 2));
    return;
  }

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from: `Webflow Jobs Report <${from}>`,
    to,
    subject: `Webflow Jobs — Week ${content.weekNumber} Report (${content.dateRange})`,
    html,
  });
  if (error) throw new Error("Resend error: " + JSON.stringify(error));
  console.log("Sent ✓ id=", data?.id, "to", to);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
