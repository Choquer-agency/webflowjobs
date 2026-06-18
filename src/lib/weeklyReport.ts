// Shared renderer for the weekly SEO + business report email.
// Used by the /api/weekly-report route (production send path).

export type WeeklyMetrics = {
  generatedAt: string;
  totalJobs: number;
  newJobs: { last7: number; prev7: number };
  jobsBySource: {
    system: { last7: number; prev7: number };
    cta: { last7: number; prev7: number };
  };
  applicants: { last7: number; prev7: number };
  revenueCents: { last7: number; prev7: number };
  payments: { last7: number; prev7: number };
};

export type ReportContent = {
  weekNumber: number | string;
  dateRange: string;
  siteVisits?: { last7: number; prev7: number } | null;
  siteVisitsNote?: string;
  seo?: {
    summary?: string;
    items?: Array<{ what: string; why: string }>;
    links?: Array<{ url: string; label: string; kind?: string }>;
  };
  prevWeekResults?: string | null;
  prevWeekResultsNote?: string;
};

const fmtMoney = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function delta(curr: number, prev: number) {
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

function metricRow(
  label: string,
  curr: number,
  prev: number,
  fmt: (x: number) => string = (x) => String(x)
) {
  const d = delta(curr, prev);
  return `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${label}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;font-weight:600;color:#111;text-align:right;">${fmt(curr)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;">${fmt(prev)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:13px;font-weight:600;color:${d.color};text-align:right;white-space:nowrap;">${d.arrow} ${d.label}</td>
    </tr>`;
}

export function renderReportHtml(
  m: WeeklyMetrics,
  content: ReportContent
): string {
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
        ${content.prevWeekResultsNote || "No prior week to compare yet."}
      </div>`;

  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
      <div style="background:#111;padding:24px 28px;">
        <div style="color:#ff9500;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Webflow Jobs — Weekly Report</div>
        <div style="color:#fff;font-size:20px;font-weight:700;margin-top:4px;">Week ${content.weekNumber} · ${content.dateRange}</div>
      </div>
      <div style="padding:24px 28px;">
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
        <div style="font-size:12px;font-weight:700;color:#ff9500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">② SEO — What I Did & Why</div>
        <div style="font-size:14px;color:#333;margin-bottom:12px;">${content.seo?.summary || ""}</div>
        <ul style="padding-left:18px;margin:0 0 16px;">${seoItems}</ul>
        ${links ? `<div style="font-size:13px;font-weight:600;color:#111;margin-bottom:6px;">New pages / changes</div><ul style="padding-left:18px;margin:0;">${links}</ul>` : ""}
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;"/>
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
