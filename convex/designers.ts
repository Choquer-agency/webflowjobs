import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ---------------------------------------------------------------------------
// Public Queries
// ---------------------------------------------------------------------------

/** Returns all approved designers, sponsored first, then by submission date. */
export const listApprovedDesigners = query({
  args: {},
  handler: async (ctx) => {
    const designers = await ctx.db
      .query("designers")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(500);

    // Sponsored designers first, then by submittedAt descending
    return designers.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  },
});

/** Find a single approved designer by slug. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const designer = await ctx.db
      .query("designers")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!designer || designer.status !== "approved") return null;
    return designer;
  },
});

/** Return all projects for a designer, ordered by sortOrder. */
export const getProjectsByDesignerId = query({
  args: { designerId: v.id("designers") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("designerProjects")
      .withIndex("by_designerId", (q) => q.eq("designerId", args.designerId))
      .take(10);
    return projects.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/** Check if an email is already registered. */
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("designers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return !!existing;
  },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Submit a new designer application. Returns the new designer ID. */
export const submitDesignerApplication = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    bio: v.string(),
    profilePhotoUrl: v.optional(v.string()),
    portfolioUrl: v.string(),
    country: v.string(),
    yearsExperience: v.string(),
    specialties: v.array(v.string()),
    hourlyRateMin: v.optional(v.number()),
    hourlyRateMax: v.optional(v.number()),
    projectRateMin: v.optional(v.number()),
    projectRateMax: v.optional(v.number()),
    currency: v.string(),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    dribbbleUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicate email
    const existing = await ctx.db
      .query("designers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) {
      throw new Error("An application with this email already exists.");
    }

    // Generate slug from name, only add suffix if collision
    const base = `${args.firstName}-${args.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    let slug = base;
    const collision = await ctx.db
      .query("designers")
      .withIndex("by_slug", (q) => q.eq("slug", base))
      .first();
    if (collision) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${base}-${suffix}`;
    }

    return await ctx.db.insert("designers", {
      ...args,
      slug,
      isSponsored: false,
      status: "pending",
      submittedAt: new Date().toISOString(),
    });
  },
});

/** Add a showcase project to a designer profile. */
export const addDesignerProject = mutation({
  args: {
    designerId: v.id("designers"),
    projectName: v.string(),
    projectUrl: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.string(),
    role: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("designerProjects", args);
  },
});

/** Admin: patch a designer project. */
export const patchDesignerProject = mutation({
  args: {
    id: v.id("designerProjects"),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

/** Admin: update designer status (approved/rejected). */
export const updateDesignerStatus = mutation({
  args: {
    id: v.id("designers"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, string> = { status: args.status };
    if (args.status === "approved") {
      updates.approvedAt = new Date().toISOString();
    }
    await ctx.db.patch(args.id, updates);
  },
});

/** Admin: patch designer profile fields. */
export const patchDesigner = mutation({
  args: {
    id: v.id("designers"),
    profilePhotoUrl: v.optional(v.string()),
    slug: v.optional(v.string()),
    hourlyRateMin: v.optional(v.number()),
    hourlyRateMax: v.optional(v.number()),
    projectRateMin: v.optional(v.number()),
    projectRateMax: v.optional(v.number()),
    yearsExperience: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

/** Admin: toggle sponsored status. */
export const setSponsored = mutation({
  args: {
    id: v.id("designers"),
    isSponsored: v.boolean(),
    sponsoredUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isSponsored: args.isSponsored,
      sponsoredUntil: args.sponsoredUntil,
    });
  },
});
