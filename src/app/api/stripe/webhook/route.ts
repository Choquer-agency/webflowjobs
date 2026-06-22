import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { notifySlack, section, context } from "@/lib/slack";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

const PLAN_AMOUNTS: Record<string, number> = {
  "4-week": 17500,
  "1-week": 7500,
};

import type { Id } from "@convex/_generated/dataModel";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeKey);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { jobId, submissionId, plan, companyName } = session.metadata || {};

    if (!plan || !companyName || (!jobId && !submissionId)) {
      console.error("Missing metadata in checkout session:", session.id);
      return NextResponse.json({ received: true });
    }

    try {
      const convex = getConvexClient();

      // Idempotency — already processed this session
      const existing = await convex.query(
        api.sponsorship.getPaymentBySessionId,
        { stripeSessionId: session.id }
      );

      if (existing) {
        console.log(`Session ${session.id} already processed, skipping`);
        return NextResponse.json({ received: true });
      }

      // If this came from the Post A Job form, approve the submission first
      // (which publishes it to the jobs table) and then activate sponsorship.
      let targetJobId = jobId as Id<"jobs"> | undefined;
      if (submissionId) {
        targetJobId = await convex.mutation(
          api.jobSubmissions.approveSubmission,
          { id: submissionId as Id<"jobSubmissions"> }
        );
      }

      if (!targetJobId) {
        console.error("No target jobId resolved for session:", session.id);
        return NextResponse.json({ received: true });
      }

      await convex.mutation(api.sponsorship.activateSponsorship, {
        jobId: targetJobId,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined,
        plan,
        amountCents: PLAN_AMOUNTS[plan] ?? 0,
        companyName,
      });

      console.log(
        `Sponsorship activated: ${companyName} - ${plan} (session: ${session.id})`
      );

      // Slack: paid job! The one that matters most.
      const amount = (PLAN_AMOUNTS[plan] ?? 0) / 100;
      const planLabel = plan === "4-week" ? "4-week spotlight" : "1-week spotlight";
      await notifySlack(`💰 PAID JOB: ${companyName} ($${amount})`, [
        section(
          `:moneybag: :tada: *PAID JOB!*\n*${companyName}* just paid for a *${planLabel}* — *$${amount}*`,
        ),
        context(
          `${session.customer_details?.email || ""}  ·  Stripe session ${session.id}`,
        ),
        section(`<https://www.webflow.jobs/admin|Open admin →>`),
      ]);
    } catch (err) {
      console.error("Failed to activate sponsorship:", err);
      return NextResponse.json(
        { error: "Failed to process payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
