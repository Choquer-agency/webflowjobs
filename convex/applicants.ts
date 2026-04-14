import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Capture an applicant lead from the Apply Now popup.
 *
 * Per-(email, jobSlug) is deduplicated so re-clicks after the user cleared
 * their localStorage don't inflate counts.
 */
export const captureApplicant = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    jobSlug: v.string(),
    jobTitle: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("applicants")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();

    const alreadyApplied = existing.find((a) => a.jobSlug === args.jobSlug);
    if (alreadyApplied) return alreadyApplied._id;

    return await ctx.db.insert("applicants", {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email,
      jobSlug: args.jobSlug,
      jobTitle: args.jobTitle,
      companyName: args.companyName,
      submittedAt: new Date().toISOString(),
    });
  },
});

export const countApplicants = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("applicants").collect();
    const uniqueEmails = new Set(all.map((a) => a.email));
    return {
      totalSubmissions: all.length,
      uniqueContacts: uniqueEmails.size,
    };
  },
});

export const listApplicants = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("applicants")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(1000);
  },
});
