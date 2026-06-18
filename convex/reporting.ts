import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/** Log a click on a tracked email link. */
export const logClick = mutation({
  args: {
    linkType: v.string(),
    companyName: v.string(),
    companyDomain: v.string(),
    jobSlug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailClicks", {
      ...args,
      clickedAt: new Date().toISOString(),
    });
  },
});

/** Get all clicks since a given date. */
export const getClicksSince = query({
  args: { since: v.string() },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query("emailClicks")
      .withIndex("by_clickedAt")
      .order("desc")
      .take(500);

    return clicks.filter((c) => c.clickedAt >= args.since);
  },
});

/** Get jobs inserted since a given date (by _creationTime). */
export const getJobsSince = query({
  args: { sinceMs: v.number() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(500);

    return jobs.filter((j) => j._creationTime >= args.sinceMs);
  },
});

/** Get agency outreach logs since a given date. */
export const getAgencyOutreachSince = query({
  args: { since: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("agencyOutreachLog")
      .withIndex("by_sentAt")
      .order("desc")
      .take(500);

    return logs.filter((l) => l.sentAt >= args.since);
  },
});

/** Get webflow.jobs outreach logs since a given date. */
export const getOutreachSince = query({
  args: { since: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("outreachLog")
      .withIndex("by_sentAt")
      .order("desc")
      .take(500);

    return logs.filter((l) => l.sentAt >= args.since);
  },
});

/**
 * Core weekly metrics with a last-7-days vs previous-7-days comparison.
 * `nowMs` is passed in by the caller so the query stays deterministic.
 * Powers the automated Monday report email.
 */
export const weeklyMetrics = query({
  args: { nowMs: v.number() },
  handler: async (ctx, { nowMs }) => {
    const DAY = 24 * 60 * 60 * 1000;
    const sevenAgo = nowMs - 7 * DAY;
    const fourteenAgo = nowMs - 14 * DAY;
    const sevenAgoIso = new Date(sevenAgo).toISOString();
    const fourteenAgoIso = new Date(fourteenAgo).toISOString();

    const inLast7Ms = (ms: number) => ms >= sevenAgo && ms < nowMs;
    const inPrev7Ms = (ms: number) => ms >= fourteenAgo && ms < sevenAgo;
    const inLast7Iso = (iso?: string) => !!iso && iso >= sevenAgoIso;
    const inPrev7Iso = (iso?: string) =>
      !!iso && iso >= fourteenAgoIso && iso < sevenAgoIso;

    // ── Jobs ──────────────────────────────────────────────
    const jobs = await ctx.db.query("jobs").take(10000);
    const isManual = (source: string) => source === "manual";

    let newLast7 = 0,
      newPrev7 = 0,
      systemLast7 = 0,
      systemPrev7 = 0,
      ctaLast7 = 0,
      ctaPrev7 = 0;

    for (const j of jobs) {
      // Prefer publishedAt when present, else creation time.
      const ts = j.publishedAt ? Date.parse(j.publishedAt) : j._creationTime;
      if (Number.isNaN(ts)) continue;
      if (inLast7Ms(ts)) {
        newLast7++;
        if (isManual(j.source)) ctaLast7++;
        else systemLast7++;
      } else if (inPrev7Ms(ts)) {
        newPrev7++;
        if (isManual(j.source)) ctaPrev7++;
        else systemPrev7++;
      }
    }

    // ── Applicants ────────────────────────────────────────
    const applicants = await ctx.db.query("applicants").take(10000);
    let appLast7 = 0,
      appPrev7 = 0;
    for (const a of applicants) {
      if (inLast7Iso(a.submittedAt)) appLast7++;
      else if (inPrev7Iso(a.submittedAt)) appPrev7++;
    }

    // ── Revenue (completed sponsorship payments) ──────────
    const payments = await ctx.db.query("sponsorshipPayments").take(10000);
    let revLast7 = 0,
      revPrev7 = 0,
      payCountLast7 = 0,
      payCountPrev7 = 0;
    for (const p of payments) {
      const completed =
        p.status === "completed" || p.status === "paid" || !!p.completedAt;
      if (!completed) continue;
      const when = p.completedAt ?? p.createdAt;
      if (inLast7Iso(when)) {
        revLast7 += p.amountCents;
        payCountLast7++;
      } else if (inPrev7Iso(when)) {
        revPrev7 += p.amountCents;
        payCountPrev7++;
      }
    }

    return {
      generatedAt: new Date(nowMs).toISOString(),
      window: { last7Start: sevenAgoIso, prev7Start: fourteenAgoIso },
      totalJobs: jobs.length,
      newJobs: { last7: newLast7, prev7: newPrev7 },
      jobsBySource: {
        system: { last7: systemLast7, prev7: systemPrev7 },
        cta: { last7: ctaLast7, prev7: ctaPrev7 },
      },
      applicants: { last7: appLast7, prev7: appPrev7 },
      revenueCents: { last7: revLast7, prev7: revPrev7 },
      payments: { last7: payCountLast7, prev7: payCountPrev7 },
    };
  },
});
