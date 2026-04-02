import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/** Return jobs that have not been processed for outreach yet. */
export const getJobsPendingOutreach = query({
  args: {},
  handler: async (ctx) => {
    // Jobs with no outreachStatus are newly inserted and need outreach
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_outreachStatus")
      .take(200);

    return jobs.filter((j) => !j.outreachStatus && j.companyDomain);
  },
});

/** Mark a job's outreach status and store the contact email. */
export const markOutreachStatus = mutation({
  args: {
    id: v.id("jobs"),
    outreachStatus: v.string(),
    contactEmail: v.optional(v.string()),
    outreachSentAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      outreachStatus: args.outreachStatus,
    };
    if (args.contactEmail) {
      patch.contactEmail = args.contactEmail;
    }
    if (args.outreachSentAt) {
      patch.outreachSentAt = args.outreachSentAt;
    }
    await ctx.db.patch(args.id, patch);
  },
});

/** Log an outreach email that was sent to a company. */
export const logOutreach = mutation({
  args: {
    companyDomain: v.string(),
    companyName: v.string(),
    contactEmail: v.string(),
    jobSlugs: v.array(v.string()),
    sentAt: v.string(),
    status: v.string(),
    resendMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outreachLog", args);
  },
});

/** Check if we've emailed this company domain recently (within days). */
export const getRecentOutreachByDomain = query({
  args: { companyDomain: v.string(), sinceDaysAgo: v.number() },
  handler: async (ctx, args) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - args.sinceDaysAgo);
    const cutoffStr = cutoff.toISOString();

    const logs = await ctx.db
      .query("outreachLog")
      .withIndex("by_companyDomain", (q) =>
        q.eq("companyDomain", args.companyDomain)
      )
      .take(10);

    return logs.filter((l) => l.sentAt >= cutoffStr);
  },
});

/** Check if an email address has unsubscribed. */
export const checkUnsubscribed = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

/** Add an email to the unsubscribe list. */
export const addUnsubscribe = mutation({
  args: {
    email: v.string(),
    companyDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already unsubscribed
    const existing = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("unsubscribes", {
      email: args.email,
      companyDomain: args.companyDomain,
      unsubscribedAt: new Date().toISOString(),
    });
  },
});
