import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";

// ---------------------------------------------------------------------------
// Public Queries (used by the Next.js frontend)
// ---------------------------------------------------------------------------

/** Returns jobs published within the last 60 days, newest first. */
export const listRecentJobs = query({
  args: {},
  handler: async (ctx) => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const cutoff = sixtyDaysAgo.toISOString();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(500);

    return jobs.filter(
      (j) => !j.publishedAt || j.publishedAt >= cutoff
    );
  },
});

/** Returns ALL jobs, newest first. Used for generateStaticParams. */
export const listAllJobs = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(5000);
    return jobs;
  },
});

/** Find a single job by its slug. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

/** Return jobs matching a category, newest first. */
export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .take(200);
    return jobs;
  },
});

/** Return all jobs from a given company. */
export const listByCompanyName = query({
  args: { companyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_companyName", (q) => q.eq("companyName", args.companyName))
      .take(200);
  },
});

/** Return all unique company names. */
export const listCompanies = query({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(5000);
    const seen = new Set<string>();
    const companies: Array<{ name: string; logoUrl: string | undefined; jobCount: number }> = [];
    for (const job of jobs) {
      if (!seen.has(job.companyName)) {
        seen.add(job.companyName);
        companies.push({
          name: job.companyName,
          logoUrl: job.companyLogoUrl,
          jobCount: 1,
        });
      } else {
        const existing = companies.find((c) => c.name === job.companyName);
        if (existing) existing.jobCount++;
      }
    }
    return companies;
  },
});

// ---------------------------------------------------------------------------
// Internal Queries (used by ingestion pipeline)
// ---------------------------------------------------------------------------

/** Check if a job with this applyUrl already exists. */
export const getByApplyUrl = query({
  args: { applyUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_applyUrl", (q) => q.eq("applyUrl", args.applyUrl))
      .unique();
  },
});

/** Check if a job with this slug already exists. */
export const getBySlugInternal = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Insert a single job. */
export const insertJob = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    companyName: v.string(),
    companyLogoUrl: v.optional(v.string()),
    aboutCompany: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    jobType: v.optional(v.string()),
    location: v.optional(v.string()),
    applyUrl: v.optional(v.string()),
    isVerified: v.boolean(),
    relevanceScore: v.optional(v.number()),
    source: v.string(),
    sourceId: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", args);
  },
});

/** Bulk insert jobs (for migration). Accepts up to 100 jobs at a time. */
export const bulkInsertJobs = internalMutation({
  args: {
    jobs: v.array(
      v.object({
        title: v.string(),
        slug: v.string(),
        companyName: v.string(),
        companyLogoUrl: v.optional(v.string()),
        aboutCompany: v.optional(v.string()),
        jobDescription: v.optional(v.string()),
        category: v.optional(v.string()),
        jobType: v.optional(v.string()),
        location: v.optional(v.string()),
        applyUrl: v.optional(v.string()),
        isVerified: v.boolean(),
        relevanceScore: v.optional(v.number()),
        source: v.string(),
        sourceId: v.optional(v.string()),
        publishedAt: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const job of args.jobs) {
      await ctx.db.insert("jobs", job);
    }
    return args.jobs.length;
  },
});

/** Patch a job's fields. */
export const patchJob = mutation({
  args: {
    id: v.id("jobs"),
    companyLogoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

/** Delete a job by ID. */
export const deleteJob = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Delete all jobs from a given source. */
export const deleteBySource = mutation({
  args: { source: v.string() },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .take(500);
    for (const job of jobs) {
      await ctx.db.delete(job._id);
    }
    return jobs.length;
  },
});

/** Log an ingestion run. */
export const logIngestionRun = mutation({
  args: {
    runAt: v.string(),
    source: v.string(),
    jobsFetched: v.number(),
    jobsNew: v.number(),
    jobsDuplicate: v.number(),
    jobsRejected: v.number(),
    errors: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ingestionLogs", args);
  },
});
