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
