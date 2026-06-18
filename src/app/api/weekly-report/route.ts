import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { Resend } from "resend";
import {
  renderReportHtml,
  type ReportContent,
  type WeeklyMetrics,
} from "@/lib/weeklyReport";

export const dynamic = "force-dynamic";

/**
 * Token-protected weekly report sender.
 * The Monday cloud routine POSTs the week's SEO narrative here; this route
 * computes live metrics from production Convex and emails the report via Resend
 * using the production secrets (so the cloud agent never needs them).
 *
 * POST /api/weekly-report
 *   headers: x-report-token: <WEEKLY_REPORT_TOKEN>
 *   body: ReportContent JSON (weekNumber, dateRange, seo, prevWeekResults, ...)
 */
export async function POST(request: Request) {
  const token = process.env.WEEKLY_REPORT_TOKEN;
  if (!token) {
    return Response.json(
      { error: "WEEKLY_REPORT_TOKEN not configured" },
      { status: 500 }
    );
  }
  if (request.headers.get("x-report-token") !== token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let content: ReportContent;
  try {
    content = (await request.json()) as ReportContent;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!content?.weekNumber || !content?.dateRange) {
    return Response.json(
      { error: "Body must include weekNumber and dateRange" },
      { status: 400 }
    );
  }

  const convexUrl =
    process.env.REPORT_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return Response.json({ error: "Convex URL not set" }, { status: 500 });
  }

  let metrics: WeeklyMetrics;
  try {
    const convex = new ConvexHttpClient(convexUrl);
    metrics = (await convex.query(api.reporting.weeklyMetrics, {
      nowMs: Date.now(),
    })) as WeeklyMetrics;
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch metrics", detail: String(err) },
      { status: 502 }
    );
  }

  const html = renderReportHtml(metrics, content);

  const resendKey = process.env.CHOQUER_RESEND_API_KEY;
  if (!resendKey) {
    return Response.json(
      { error: "CHOQUER_RESEND_API_KEY not set" },
      { status: 500 }
    );
  }
  const from = process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
  const to = process.env.REPORT_TO_EMAIL || "bryce@choquer.agency";

  try {
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from: `Webflow Jobs Report <${from}>`,
      to,
      subject: `Webflow Jobs — Week ${content.weekNumber} Report (${content.dateRange})`,
      html,
    });
    if (error) {
      return Response.json(
        { error: "Resend error", detail: error },
        { status: 502 }
      );
    }
    return Response.json({ sent: true, id: data?.id, metrics });
  } catch (err) {
    return Response.json(
      { error: "Send failed", detail: String(err) },
      { status: 502 }
    );
  }
}
