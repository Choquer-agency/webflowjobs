import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const createSubmission = mutation({
  args: {
    title: v.string(),
    jobDescription: v.string(),
    jobType: v.string(),
    category: v.string(),
    location: v.string(),
    postingEmail: v.string(),
    postingUrl: v.optional(v.string()),
    companyName: v.string(),
    companyLogoUrl: v.optional(v.string()),
    companyWebsite: v.string(),
    aboutCompany: v.string(),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    salaryPeriod: v.optional(v.string()),
    comments: v.optional(v.string()),
    wantsEmailBlast: v.optional(v.boolean()),
    wants4WeekSpotlight: v.optional(v.boolean()),
    wants1WeekSpotlight: v.optional(v.boolean()),
    submitterIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobSubmissions", {
      ...args,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  },
});

export const listSubmissions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobSubmissions")
      .withIndex("by_submittedAt")
      .order("desc")
      .take(500);
  },
});

export const countPending = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("jobSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

export const approveSubmission = mutation({
  args: { id: v.id("jobSubmissions") },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.id);
    if (!s) throw new Error("Submission not found");
    if (s.status === "approved" && s.publishedJobId) return s.publishedJobId;

    const baseSlug = slugify(`${s.companyName}-${s.title}`);
    let slug = baseSlug;
    let attempt = 1;
    while (true) {
      const existing = await ctx.db
        .query("jobs")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!existing) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    const jobId = await ctx.db.insert("jobs", {
      title: s.title,
      slug,
      companyName: s.companyName,
      companyLogoUrl: s.companyLogoUrl,
      aboutCompany: s.aboutCompany,
      jobDescription: s.jobDescription,
      category: s.category,
      jobType: s.jobType,
      location: s.location,
      applyUrl: s.postingUrl || `mailto:${s.postingEmail}`,
      isVerified: true,
      source: "manual",
      publishedAt: new Date().toISOString(),
      contactEmail: s.postingEmail,
    });

    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedAt: new Date().toISOString(),
      publishedJobId: jobId,
    });

    return jobId;
  },
});

export const rejectSubmission = mutation({
  args: { id: v.id("jobSubmissions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "rejected",
      reviewedAt: new Date().toISOString(),
    });
  },
});

export const deleteSubmission = mutation({
  args: { id: v.id("jobSubmissions") },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.id);
    if (s?.publishedJobId) {
      await ctx.db.delete(s.publishedJobId);
    }
    await ctx.db.delete(args.id);
  },
});
