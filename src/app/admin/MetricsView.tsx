"use client";

import { useMemo } from "react";
import type { Applicant } from "./LeadsView";
import type { Submission } from "./SubmissionsView";
import type { DesignerRow } from "./DesignersView";

export type JobRow = {
  slug: string;
  title: string;
  companyName: string;
  category?: string;
  jobType?: string;
  source: string;
  isSponsored?: boolean;
  publishedAt?: string;
  descLength: number;
};

const ORANGE = "#ff5a1f";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function normalizeType(t?: string): string {
  if (!t) return "Unknown";
  const s = t.toLowerCase();
  if (s.includes("full")) return "Full-time";
  if (s.includes("part")) return "Part-time";
  if (s.includes("contract")) return "Contract";
  if (s.includes("freelance")) return "Freelance";
  if (s.includes("project")) return "Project-based";
  return "Other";
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  // ISO week-ish: bucket by Monday
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------
export function MetricsView({
  jobs,
  applicants,
  designers,
  submissions,
}: {
  jobs: JobRow[];
  applicants: Applicant[];
  designers: DesignerRow[];
  submissions: Submission[];
}) {
  const m = useMemo(() => {
    // Live jobs = exclude the bulk csv-import seed (never truly live)
    const live = jobs.filter((j) => j.source !== "csv-import");
    const appsBySlug: Record<string, number> = {};
    for (const a of applicants) appsBySlug[a.jobSlug] = (appsBySlug[a.jobSlug] || 0) + 1;

    const enriched = live.map((j) => ({ ...j, apps: appsBySlug[j.slug] || 0 }));
    const totalApps = applicants.length;
    const uniqueApplicants = new Set(applicants.map((a) => a.email.toLowerCase())).size;
    const withApps = enriched.filter((j) => j.apps > 0).length;

    // top jobs
    const topJobs = [...enriched].sort((a, b) => b.apps - a.apps).slice(0, 10);

    // group avg helper
    const groupAvg = (keyFn: (j: (typeof enriched)[number]) => string | undefined) => {
      const g: Record<string, number[]> = {};
      for (const j of enriched) {
        const k = keyFn(j);
        if (!k) continue;
        (g[k] = g[k] || []).push(j.apps);
      }
      return Object.entries(g)
        .map(([k, arr]) => ({ key: k, n: arr.length, total: arr.reduce((a, b) => a + b, 0), avg: avg(arr) }))
        .sort((a, b) => b.avg - a.avg);
    };

    const byCategory = groupAvg((j) => j.category);
    const byType = groupAvg((j) => normalizeType(j.jobType));
    const bySource = groupAvg((j) => j.source);

    // keyword lift
    const baseline = enriched.length ? totalApps / enriched.length : 0;
    const KEYWORDS = ["webflow", "developer", "designer", "freelance", "contract", "senior", "junior", "remote", "seo", "marketing"];
    const keywordLift = KEYWORDS.map((kw) => {
      const matched = enriched.filter((j) => j.title.toLowerCase().includes(kw));
      return { key: kw, n: matched.length, avg: avg(matched.map((j) => j.apps)) };
    })
      .filter((r) => r.n >= 5)
      .sort((a, b) => b.avg - a.avg);

    // description length buckets
    const descBuckets = [
      { key: "Short (<1.5k)", test: (n: number) => n < 1500 },
      { key: "Medium (1.5k–3k)", test: (n: number) => n >= 1500 && n < 3000 },
      { key: "Long (3k+)", test: (n: number) => n >= 3000 },
    ].map((b) => {
      const arr = enriched.filter((j) => b.test(j.descLength)).map((j) => j.apps);
      return { key: b.key, n: arr.length, avg: avg(arr) };
    });

    // applications over last 10 weeks
    const weeks: Record<string, number> = {};
    for (const a of applicants) {
      if (!a.submittedAt) continue;
      weeks[weekKey(a.submittedAt)] = (weeks[weekKey(a.submittedAt)] || 0) + 1;
    }
    const weekTrend = Object.entries(weeks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([k, v]) => ({ key: k.slice(5), value: v }));

    // job submissions pipeline
    const subPending = submissions.filter((s) => s.status === "pending").length;
    const subApproved = submissions.filter((s) => s.status === "approved").length;
    const subRejected = submissions.filter((s) => s.status === "rejected").length;
    const spotlightInterest = submissions.filter((s) => s.wants4WeekSpotlight || s.wants1WeekSpotlight).length;
    const blastInterest = submissions.filter((s) => s.wantsEmailBlast).length;

    // designers
    const desApproved = designers.filter((d) => d.status === "approved").length;
    const desPending = designers.filter((d) => d.status === "pending").length;
    const desRejected = designers.filter((d) => d.status === "rejected").length;
    const specCount: Record<string, number> = {};
    const countryCount: Record<string, number> = {};
    for (const d of designers.filter((d) => d.status === "approved")) {
      for (const s of d.specialties || []) specCount[s] = (specCount[s] || 0) + 1;
      countryCount[d.country] = (countryCount[d.country] || 0) + 1;
    }
    const topSpecialties = Object.entries(specCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ key: k, n: v, avg: v }));
    const topCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ key: k, n: v, avg: v }));

    return {
      liveCount: enriched.length,
      seedCount: jobs.length - enriched.length,
      totalApps,
      uniqueApplicants,
      withApps,
      coverage: enriched.length ? Math.round((withApps / enriched.length) * 100) : 0,
      avgPerJob: enriched.length ? totalApps / enriched.length : 0,
      sponsoredCount: enriched.filter((j) => j.isSponsored).length,
      topJobs,
      byCategory,
      byType,
      bySource,
      keywordLift,
      descBuckets,
      baseline,
      weekTrend,
      subPending,
      subApproved,
      subRejected,
      spotlightInterest,
      blastInterest,
      desApproved,
      desPending,
      desRejected,
      topSpecialties,
      topCountries,
    };
  }, [jobs, applicants, designers, submissions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <Kpi label="Live jobs" value={m.liveCount} sub={`${m.seedCount} seed excluded`} />
        <Kpi label="Total applications" value={m.totalApps} sub={`${m.uniqueApplicants} unique people`} />
        <Kpi label="Avg / live job" value={m.avgPerJob.toFixed(1)} sub={`${m.coverage}% got ≥1`} />
        <Kpi label="Approved designers" value={m.desApproved} sub={m.desPending ? `${m.desPending} pending` : "0 pending"} highlight={m.desPending > 0} />
        <Kpi label="Pending reviews" value={m.subPending + m.desPending} sub={`${m.subPending} jobs · ${m.desPending} designers`} highlight={m.subPending + m.desPending > 0} />
        <Kpi label="Paid interest" value={m.spotlightInterest} sub="spotlight requests" />
      </div>

      {/* trend */}
      <Section title="Applications over time" subtitle="Weekly application volume (last 10 weeks)">
        {m.weekTrend.length === 0 ? (
          <Empty>No application data yet.</Empty>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingTop: 8 }}>
            {m.weekTrend.map((w) => {
              const max = Math.max(...m.weekTrend.map((x) => x.value), 1);
              return (
                <div key={w.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "#666", fontWeight: 600 }}>{w.value}</div>
                  <div style={{ width: "100%", maxWidth: 48, height: `${(w.value / max) * 120}px`, background: ORANGE, borderRadius: "4px 4px 0 0", minHeight: 2 }} />
                  <div style={{ fontSize: 10, color: "#999" }}>{w.key}</div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* What works */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Section title="What works — by category" subtitle="Avg applications per job">
          <BarList rows={m.byCategory} unit="avg" />
        </Section>
        <Section title="What works — by job type" subtitle="Avg applications per job">
          <BarList rows={m.byType} unit="avg" />
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Section title="Title keyword lift" subtitle={`Avg apps/job · directory baseline ${m.baseline.toFixed(1)}`}>
          <BarList rows={m.keywordLift} unit="avg" baseline={m.baseline} />
        </Section>
        <Section title="Description length" subtitle="Avg applications per job">
          <BarList rows={m.descBuckets} unit="avg" />
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Section title="Source performance" subtitle="Avg applications per job by source">
          <BarList rows={m.bySource} unit="avg" />
        </Section>
        <Section title="Top jobs by applications">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {m.topJobs.map((j, i) => (
              <div key={j.slug} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ color: "#bbb", width: 18, textAlign: "right" }}>{i + 1}</span>
                <span style={{ fontWeight: 700, color: ORANGE, width: 28 }}>{j.apps}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.title} <span style={{ color: "#999" }}>· {j.companyName}</span>
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Designer directory */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Section title="Designer directory" subtitle={`${m.desApproved} live · ${m.desPending} pending · ${m.desRejected} rejected`}>
          <BarList rows={m.topSpecialties} unit="count" label="Top specialties" />
        </Section>
        <Section title="Designers by country">
          <BarList rows={m.topCountries} unit="count" />
        </Section>
      </div>

      {/* Pipeline */}
      <Section title="Pipeline & monetization">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <MiniStat label="Job submissions" value={m.subApproved + m.subPending + m.subRejected} sub={`${m.subApproved} approved · ${m.subPending} pending`} />
          <MiniStat label="Designer submissions" value={m.desApproved + m.desPending + m.desRejected} sub={`${m.desApproved} approved · ${m.desPending} pending`} />
          <MiniStat label="Spotlight requests" value={m.spotlightInterest} sub="paid placement interest" />
          <MiniStat label="Email blast requests" value={m.blastInterest} sub="free candidate blast" />
          <MiniStat label="Sponsored live jobs" value={m.sponsoredCount} sub="currently featured" />
        </div>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// sub-components
// ---------------------------------------------------------------------------
function Kpi({ label, value, sub, highlight }: { label: string; value: number | string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ border: `1px solid ${highlight ? "#ffd9c9" : "#eee"}`, background: highlight ? "#fff7f3" : "#fff", borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0 2px", color: "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: highlight ? ORANGE : "#999" }}>{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: "12px 14px", background: "#fafafa" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#444", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 20, background: "#fff" }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "#999", fontSize: 13, padding: "12px 0" }}>{children}</div>;
}

function BarList({
  rows,
  unit,
  baseline,
  label,
}: {
  rows: { key: string; n: number; avg: number; total?: number }[];
  unit: "avg" | "count";
  baseline?: number;
  label?: string;
}) {
  if (rows.length === 0) return <Empty>No data yet.</Empty>;
  const max = Math.max(...rows.map((r) => r.avg), 0.0001);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {label && <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{label}</div>}
      {rows.map((r) => {
        const val = unit === "avg" ? r.avg.toFixed(2) : String(r.n);
        const aboveBase = baseline !== undefined && r.avg > baseline;
        return (
          <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <span style={{ width: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: unit === "count" ? "none" : "capitalize" }}>{r.key}</span>
            <div style={{ flex: 1, background: "#f3f3f3", borderRadius: 4, height: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ width: `${(r.avg / max) * 100}%`, height: "100%", background: aboveBase ? "#1f7a3a" : ORANGE, borderRadius: 4, minWidth: 2 }} />
            </div>
            <span style={{ width: 44, textAlign: "right", fontWeight: 700, color: "#111" }}>{val}</span>
            <span style={{ width: 56, textAlign: "right", color: "#bbb", fontSize: 11 }}>{unit === "avg" ? `${r.n} jobs` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}
