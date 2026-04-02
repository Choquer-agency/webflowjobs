/**
 * Choquer Agency outreach email sender using Resend.
 * Sends personalized retainer pitch emails to businesses found on Webflow Jobs.
 */

import { Resend } from "resend";
import { createHmac } from "crypto";

const CHOQUER_SITE_URL =
  process.env.CHOQUER_SITE_URL || "https://choquer.agency";
const CHOQUER_FROM_EMAIL =
  process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
const CHOQUER_HMAC_SECRET =
  process.env.CHOQUER_HMAC_SECRET || "default-agency-secret";
const CHOQUER_CAL_LINK =
  process.env.CHOQUER_CAL_LINK || "https://cal.com/brycechoquer/discovery";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.webflow.jobs";

export const RETAINER_PACKAGES: Record<
  number,
  { monthly: number; hourlyRate: number }
> = {
  10: { monthly: 2200, hourlyRate: 220 },
  15: { monthly: 3150, hourlyRate: 210 },
  20: { monthly: 4000, hourlyRate: 200 },
  30: { monthly: 5700, hourlyRate: 190 },
  40: { monthly: 7200, hourlyRate: 180 },
};

// Rough full-time equivalent benchmarks for savings calculation
const FULLTIME_BENCHMARKS: Record<string, number> = {
  "Webflow Developer": 7500, // ~$90K/yr
  Designer: 7000, // ~$84K/yr
  SEO: 5500, // ~$66K/yr
  CRO: 6500, // ~$78K/yr
  "Google Ads": 5500, // ~$66K/yr
  Marketing: 5500, // ~$66K/yr
  Other: 6000, // ~$72K/yr
};

export interface AgencyEmailData {
  contactEmail: string;
  companyName: string;
  companyDomain: string;
  jobTitle: string;
  jobSlug: string;
  roleLabel: string;
  projectScope: string;
  estimatedHours: number;
  category: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function buildTrackingUrl(
  dest: string,
  linkType: string,
  data: AgencyEmailData
): string {
  const params = new URLSearchParams({
    dest,
    t: linkType,
    cn: data.companyName,
    cd: data.companyDomain,
    js: data.jobSlug,
  });
  return `${SITE_URL}/api/track?${params.toString()}`;
}

function generateUnsubscribeToken(email: string): string {
  const hmac = createHmac("sha256", CHOQUER_HMAC_SECRET);
  hmac.update(email);
  return hmac.digest("hex");
}

function buildUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const encodedEmail = encodeURIComponent(email);
  return `${SITE_URL}/api/agency-unsubscribe?email=${encodedEmail}&token=${token}`;
}

export function calculateSavings(
  estimatedHours: number,
  category: string
): { monthlyRetainer: number; savingsPercent: number } {
  const pkg = RETAINER_PACKAGES[estimatedHours] ?? RETAINER_PACKAGES[20];
  const benchmark =
    FULLTIME_BENCHMARKS[category] ?? FULLTIME_BENCHMARKS["Other"];
  const savingsPercent = Math.round(
    ((benchmark - pkg.monthly) / benchmark) * 100
  );

  return {
    monthlyRetainer: pkg.monthly,
    savingsPercent: Math.max(savingsPercent, 10), // Floor at 10%
  };
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildAgencyEmailHtml(data: AgencyEmailData): string {
  const { monthlyRetainer } = calculateSavings(
    data.estimatedHours,
    data.category
  );
  const unsubscribeUrl = buildUnsubscribeUrl(data.contactEmail);
  const calTrackUrl = buildTrackingUrl(CHOQUER_CAL_LINK, "cal", data);
  const siteTrackUrl = buildTrackingUrl(
    `${CHOQUER_SITE_URL}/certified-webflow-experts`,
    "website",
    data
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-size: 15px; line-height: 1.6;">

    <p>Hey,</p>

    <p>I came across your ${data.roleLabel} posting and thought I'd reach out to see if my agency could help.</p>

    <p>I had my team take a look at your listing and here's what we're thinking: ${data.projectScope}</p>

    <p>We're estimating around <strong>${data.estimatedHours} hours</strong> of work at <strong>${formatMoney(monthlyRetainer)}</strong>. That gets you our full team &mdash; design, development, copy, SEO &mdash; not just one person. And if the scope shifts once we dig in, we can adjust. No contracts, completely flexible.</p>

    <p>If you're open to it, happy to jump on a quick call and walk you through how we'd approach it.</p>

    <p style="margin: 24px 0 12px;">
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="50%" fillcolor="#1a1a1a"><center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Book a Call &rarr;</center></v:roundrect><![endif]-->
      <a href="${calTrackUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: -0.2px;">Book a Call &rarr;</a>
    </p>

    <p style="margin: 0 0 24px;"><a href="${siteTrackUrl}" style="color: #999; font-size: 13px; text-decoration: none;">Our work &mdash; <span style="text-decoration: underline;">visit our website</span></a></p>

    <p>
      Bryce<br>
      <span style="color: #888; font-size: 13px;">Choquer Agency</span>
    </p>

    <p style="margin-top: 32px; font-size: 11px; color: #bbb;">
      <a href="${unsubscribeUrl}" style="color: #bbb; text-decoration: underline;">Unsubscribe</a> from future emails.
    </p>

  </div>
</body>
</html>`;
}

export async function sendAgencyEmail(
  resendApiKey: string,
  data: AgencyEmailData
): Promise<SendResult> {
  const resend = new Resend(resendApiKey);

  const subject = `${data.companyName} — re: your ${data.roleLabel} posting`;
  const html = buildAgencyEmailHtml(data);
  const unsubscribeUrl = buildUnsubscribeUrl(data.contactEmail);

  try {
    const { data: result, error } = await resend.emails.send({
      from: `Bryce at Choquer Agency <${CHOQUER_FROM_EMAIL}>`,
      to: [data.contactEmail],
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
