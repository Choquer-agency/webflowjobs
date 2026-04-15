import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";
import { Resend } from "resend";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max = 10000): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function optNum(v: unknown): number | undefined {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = str(body.title, 256);
    const jobDescription = str(body.jobDescription, 20000);
    const jobType = str(body.jobType, 64);
    const category = str(body.category, 64);
    const location = str(body.location, 256);
    const postingEmail = str(body.postingEmail, 256).toLowerCase();
    const postingUrl = str(body.postingUrl, 512) || undefined;
    const companyName = str(body.companyName, 256);
    const companyLogoUrl = str(body.companyLogoUrl, 512) || undefined;
    const companyWebsite = str(body.companyWebsite, 512);
    const aboutCompany = str(body.aboutCompany, 10000);
    const comments = str(body.comments, 5000) || undefined;

    if (
      !title ||
      !jobDescription ||
      !jobType ||
      !category ||
      !location ||
      !postingEmail ||
      !companyName ||
      !companyWebsite ||
      !aboutCompany
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(postingEmail)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const submitterIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const convex = getConvexClient();
    await convex.mutation(api.jobSubmissions.createSubmission, {
      title,
      jobDescription,
      jobType,
      category,
      location,
      postingEmail,
      postingUrl,
      companyName,
      companyLogoUrl,
      companyWebsite,
      aboutCompany,
      salaryMin: optNum(body.salaryMin),
      salaryMax: optNum(body.salaryMax),
      salaryCurrency: str(body.salaryCurrency, 16) || undefined,
      salaryPeriod: str(body.salaryPeriod, 32) || undefined,
      comments,
      wantsEmailBlast: Boolean(body.wantsEmailBlast),
      wants4WeekSpotlight: Boolean(body.wants4WeekSpotlight),
      wants1WeekSpotlight: Boolean(body.wants1WeekSpotlight),
      submitterIp,
    });

    const resendKey = process.env.CHOQUER_RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const from = process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
        const to = process.env.REPORT_TO_EMAIL || "bryce@choquer.agency";
        await resend.emails.send({
          from: `Webflow Jobs <${from}>`,
          to: [to],
          subject: `New free job post: ${companyName} — ${title}`,
          html: `
            <h2>New job submission</h2>
            <p><strong>${companyName}</strong> posted <strong>${title}</strong></p>
            <ul>
              <li>Category: ${category}</li>
              <li>Job Type: ${jobType}</li>
              <li>Location: ${location}</li>
              <li>Posting Email: ${postingEmail}</li>
              <li>Website: ${companyWebsite}</li>
              ${postingUrl ? `<li>Posting URL: ${postingUrl}</li>` : ""}
            </ul>
            <p><a href="https://www.webflow.jobs/admin">Review in admin dashboard →</a></p>
          `,
        });
      } catch (err) {
        console.error("Failed to send notification email:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
