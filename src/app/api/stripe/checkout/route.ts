import { NextResponse } from "next/server";
import Stripe from "stripe";

const PLANS = {
  "4-week": {
    name: "4-Week Job Spotlight",
    description: "Pin your job to the top for 4 weeks — 12x more views",
    amountCents: 17500,
  },
  "1-week": {
    name: "1-Week Job Spotlight",
    description: "Pin your job to the top for 1 week — 4x more views",
    amountCents: 7500,
  },
} as const;

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { slug, plan, jobId, companyName } = body;

    if (!slug || !plan || !jobId || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (plan !== "4-week" && plan !== "1-week") {
      return NextResponse.json(
        { error: "Invalid plan. Must be '4-week' or '1-week'" },
        { status: 400 }
      );
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.webflow.jobs";

    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planDetails.name,
              description: planDetails.description,
            },
            unit_amount: planDetails.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        jobSlug: slug,
        jobId,
        plan,
        companyName,
      },
      success_url: `${siteUrl}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/jobs/${slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
