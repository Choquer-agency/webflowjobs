import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Return jobs eligible for Choquer Agency outreach:
 * - webflow.jobs outreach already sent (outreachStatus === "sent")
 * - company is a business, not an agency (companyType === "business")
 * - agency outreach not yet processed (agencyOutreachStatus not set)
 * - outreachSentAt is at least 20 hours ago (next-day delay)
 */
export const getJobsPendingAgencyOutreach = query({
  args: {},
  handler: async (ctx) => {
    const twentyHoursAgo = new Date(
      Date.now() - 20 * 60 * 60 * 1000
    ).toISOString();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_outreachStatus")
      .take(500);

    return jobs.filter(
      (j) =>
        j.outreachStatus === "sent" &&
        j.companyType === "business" &&
        !j.agencyOutreachStatus &&
        j.companyDomain &&
        j.outreachSentAt &&
        j.outreachSentAt < twentyHoursAgo
    );
  },
});

/** Mark a job's agency outreach status and optionally store estimation data. */
export const markAgencyOutreachStatus = mutation({
  args: {
    id: v.id("jobs"),
    agencyOutreachStatus: v.string(),
    estimatedHours: v.optional(v.number()),
    projectScope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      agencyOutreachStatus: args.agencyOutreachStatus,
    };
    if (args.estimatedHours !== undefined) {
      patch.estimatedHours = args.estimatedHours;
    }
    if (args.projectScope !== undefined) {
      patch.projectScope = args.projectScope;
    }
    await ctx.db.patch(args.id, patch);
  },
});

/** Log an agency outreach email that was sent. */
export const logAgencyOutreach = mutation({
  args: {
    companyDomain: v.string(),
    companyName: v.string(),
    contactEmail: v.string(),
    jobSlug: v.string(),
    sentAt: v.string(),
    status: v.string(),
    resendMessageId: v.optional(v.string()),
    estimatedHours: v.number(),
    quotedPackage: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agencyOutreachLog", args);
  },
});

/** Check if we've sent agency outreach to this domain recently (within days). */
export const getRecentAgencyOutreachByDomain = query({
  args: { companyDomain: v.string(), sinceDaysAgo: v.number() },
  handler: async (ctx, args) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - args.sinceDaysAgo);
    const cutoffStr = cutoff.toISOString();

    const logs = await ctx.db
      .query("agencyOutreachLog")
      .withIndex("by_companyDomain", (q) =>
        q.eq("companyDomain", args.companyDomain)
      )
      .take(10);

    return logs.filter((l) => l.sentAt >= cutoffStr);
  },
});

/** Check if an email has unsubscribed from agency emails. */
export const checkAgencyUnsubscribed = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agencyUnsubscribes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

/** Add an email to the agency unsubscribe list. */
export const addAgencyUnsubscribe = mutation({
  args: {
    email: v.string(),
    companyDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agencyUnsubscribes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("agencyUnsubscribes", {
      email: args.email,
      companyDomain: args.companyDomain,
      unsubscribedAt: new Date().toISOString(),
    });
  },
});
