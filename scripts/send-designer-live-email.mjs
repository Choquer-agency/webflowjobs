import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { Resend } from "resend";
import fs from "node:fs";

// Load env from .env.local
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const TEST_ONLY = "bryce@choquer.agency"; // <-- test send target
const prod = new ConvexHttpClient("https://determined-ptarmigan-458.convex.cloud");
const resend = new Resend(process.env.CHOQUER_RESEND_API_KEY);
const FROM = `Webflow Jobs <${process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency"}>`;

function emailHtml(firstName, profileUrl) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.6;">
    <p style="margin:0 0 4px;font-size:16px;">Hey ${firstName}!</p>
    <h1 style="font-size:22px;margin:0 0 16px;">Your profile is now live on Webflow.Jobs</h1>
    <p style="margin:0 0 24px;">Your designer profile is now live in the Webflow.jobs directory — companies looking to hire Webflow talent can find you, see your work, and reach out directly.</p>
    <p style="margin:0 0 24px;">
      <a href="${profileUrl}" style="color:#ff9500;text-decoration:none;font-weight:600;">View your profile →</a>
    </p>
    <p style="margin:0 0 16px;">If anything looks off or you want to update your details, just reply to this email and I'll sort it out.</p>
    <p style="margin:0;">— Bryce<br><span style="color:#888;">Webflow.jobs</span></p>
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0 12px;">
    <p style="font-size:12px;color:#aaa;margin:0;">You're receiving this because you submitted a profile to Webflow.jobs.</p>
  </div>`;
}

const bryce = await prod.query(api.designers.getBySlug, { slug: "bryce-choquer" });
const profileUrl = `https://www.webflow.jobs/designers/${bryce.slug}`;

const res = await resend.emails.send({
  from: FROM,
  to: [TEST_ONLY],
  replyTo: "bryce@choquer.agency",
  subject: `You're live on Webflow.jobs 🎉`,
  html: emailHtml(bryce.firstName, profileUrl),
});

console.log("TEST sent to", TEST_ONLY);
console.log("profile:", profileUrl);
console.log("resend id:", res.data?.id || JSON.stringify(res.error));
