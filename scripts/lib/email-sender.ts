/**
 * Outreach email sender using Resend.
 * Sends personalized emails to companies whose jobs we've posted.
 */

import { Resend } from "resend";
import { createHmac } from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.webflow.jobs";
const FROM_EMAIL = process.env.OUTREACH_FROM_EMAIL || "jobs@webflow.jobs";
const HMAC_SECRET = process.env.OUTREACH_HMAC_SECRET || "default-secret";

export interface OutreachJob {
  slug: string;
  title: string;
  companyName: string;
  category?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function generateUnsubscribeToken(email: string): string {
  const hmac = createHmac("sha256", HMAC_SECRET);
  hmac.update(email);
  return hmac.digest("hex");
}

function buildUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  const encodedEmail = encodeURIComponent(email);
  return `${SITE_URL}/api/unsubscribe?email=${encodedEmail}&token=${token}`;
}

function buildEmailHtml(
  companyName: string,
  jobs: OutreachJob[],
  contactEmail: string
): string {
  const jobListHtml = jobs
    .map(
      (job) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
            <a href="${SITE_URL}/jobs/${job.slug}" style="color: #FF9500; text-decoration: none; font-weight: 600; font-size: 16px;">
              ${job.title}
            </a>
            ${job.category ? `<br><span style="color: #888; font-size: 13px;">${job.category}</span>` : ""}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right;">
            <a href="${SITE_URL}/sponsor/${jobs[0].slug}" style="color: #FF9500; text-decoration: none; font-size: 13px;">
              Sponsor &rarr;
            </a>
          </td>
        </tr>`
    )
    .join("\n");

  const sponsorSlug = jobs[0].slug;
  const unsubscribeUrl = buildUnsubscribeUrl(contactEmail);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9f9f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
              <span style="color: #FF9500; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">webflow.jobs</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">
                Your ${companyName} job${jobs.length > 1 ? "s are" : " is"} live!
              </h1>

              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi there! We wanted to let you know that we've featured your open position${jobs.length > 1 ? "s" : ""} on
                <a href="${SITE_URL}" style="color: #FF9500; text-decoration: none; font-weight: 600;">Webflow.jobs</a>,
                the #1 job board for the Webflow ecosystem.
              </p>

              <!-- Job listings -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #fafafa; padding: 10px 16px; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                    Your Listing${jobs.length > 1 ? "s" : ""}
                  </td>
                  <td style="background-color: #fafafa; padding: 10px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">
                    Action
                  </td>
                </tr>
                ${jobListHtml}
              </table>

              <!-- Sponsorship CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FFF8F0 0%, #FFF2E0 100%); border: 1px solid #FFE0B2; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a;">
                      Want more visibility?
                    </h2>
                    <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                      Sponsor your listing to pin it to the top of our job board and get significantly more views from qualified Webflow professionals.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="padding-right: 16px;">
                          <table cellpadding="0" cellspacing="0" style="border: 2px solid #FF9500; border-radius: 8px; overflow: hidden;">
                            <tr>
                              <td style="padding: 16px 20px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: #FF9500;">$175</div>
                                <div style="font-size: 13px; color: #888; margin-top: 4px;">4 weeks</div>
                                <div style="font-size: 12px; color: #FF9500; font-weight: 600; margin-top: 4px;">12x more views</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td>
                          <table cellpadding="0" cellspacing="0" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                            <tr>
                              <td style="padding: 16px 20px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: #333;">$75</div>
                                <div style="font-size: 13px; color: #888; margin-top: 4px;">1 week</div>
                                <div style="font-size: 12px; color: #666; font-weight: 600; margin-top: 4px;">4x more views</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <a href="${SITE_URL}/sponsor/${sponsorSlug}" style="display: inline-block; background-color: #FF9500; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">
                      Sponsor Your Listing
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Free posting CTA -->
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                Have more positions to fill? You can always post jobs for free on our platform:
              </p>
              <a href="${SITE_URL}/post-a-job" style="color: #FF9500; text-decoration: none; font-weight: 600; font-size: 14px;">
                Post a Job for Free &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0;">
                You're receiving this because ${companyName} has an active job listing on Webflow.jobs.<br>
                <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a> from future emails.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOutreachEmail(
  resendApiKey: string,
  contactEmail: string,
  companyName: string,
  jobs: OutreachJob[]
): Promise<SendResult> {
  const resend = new Resend(resendApiKey);

  const subject =
    jobs.length === 1
      ? `Your ${companyName} job is live on Webflow.jobs`
      : `Your ${companyName} jobs are live on Webflow.jobs`;

  const html = buildEmailHtml(companyName, jobs, contactEmail);
  const unsubscribeUrl = buildUnsubscribeUrl(contactEmail);

  try {
    const { data, error } = await resend.emails.send({
      from: `Webflow Jobs <${FROM_EMAIL}>`,
      to: [contactEmail],
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

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
