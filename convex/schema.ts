import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jobs: defineTable({
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
    .index("by_slug", ["slug"])
    .index("by_applyUrl", ["applyUrl"])
    .index("by_source", ["source"])
    .index("by_publishedAt", ["publishedAt"])
    .index("by_category", ["category"])
    .index("by_companyName", ["companyName"]),

  ingestionLogs: defineTable({
    runAt: v.string(),
    source: v.string(),
    jobsFetched: v.number(),
    jobsNew: v.number(),
    jobsDuplicate: v.number(),
    jobsRejected: v.number(),
    errors: v.optional(v.string()),
  }).index("by_runAt", ["runAt"]),

  designers: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    slug: v.string(),
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
    isSponsored: v.boolean(),
    sponsoredUntil: v.optional(v.string()),
    status: v.string(),
    submittedAt: v.string(),
    approvedAt: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_status_and_isSponsored", ["status", "isSponsored"]),

  designerProjects: defineTable({
    designerId: v.id("designers"),
    projectName: v.string(),
    projectUrl: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.string(),
    role: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_designerId", ["designerId"]),
});
