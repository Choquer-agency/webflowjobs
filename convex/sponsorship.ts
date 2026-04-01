import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

/** Activate sponsorship on a job after successful payment. */
export const activateSponsorship = mutation({
  args: {
    jobId: v.id("jobs"),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    plan: v.string(),
    amountCents: v.number(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const durationDays = args.plan === "4-week" ? 28 : 7;
    const sponsoredUntil = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000
    ).toISOString();

    // Update the job
    await ctx.db.patch(args.jobId, {
      isSponsored: true,
      sponsoredUntil,
      sponsorshipPlan: args.plan,
    });

    // Record the payment
    await ctx.db.insert("sponsorshipPayments", {
      jobId: args.jobId,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      plan: args.plan,
      amountCents: args.amountCents,
      status: "completed",
      companyName: args.companyName,
      createdAt: now.toISOString(),
      completedAt: now.toISOString(),
    });

    return { sponsoredUntil };
  },
});

/** Expire sponsorships that have passed their end date. */
export const expireExpiredSponsorships = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    // Find all sponsored jobs and check if expired
    const jobs = await ctx.db
      .query("jobs")
      .take(5000);

    let expiredCount = 0;
    for (const job of jobs) {
      if (job.isSponsored && job.sponsoredUntil && job.sponsoredUntil < now) {
        await ctx.db.patch(job._id, {
          isSponsored: false,
        });
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} sponsorship(s)`);
    }
  },
});

/** Look up a payment by Stripe session ID. */
export const getPaymentBySessionId = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sponsorshipPayments")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
  },
});

/** Get a job by its slug (for sponsor page). */
export const getJobBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
