import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";
import { Resend } from "resend";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      bio,
      profilePhotoUrl,
      portfolioUrl,
      country,
      yearsExperience,
      specialties,
      hourlyRateMin,
      hourlyRateMax,
      projectRateMin,
      projectRateMax,
      currency,
      linkedinUrl,
      twitterUrl,
      dribbbleUrl,
      githubUrl,
      projects,
    } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !bio || !portfolioUrl || !country || !yearsExperience || !currency) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!specialties || specialties.length === 0) {
      return NextResponse.json({ error: "Please select at least one specialty." }, { status: 400 });
    }

    if (!projects || projects.length === 0 || !projects[0].projectName || !projects[0].projectUrl || !projects[0].description) {
      return NextResponse.json({ error: "At least one showcase project is required." }, { status: 400 });
    }

    // Submit designer application
    const convex = getConvexClient();
    const designerId = await convex.mutation(api.designers.submitDesignerApplication, {
      firstName,
      lastName,
      email,
      bio,
      profilePhotoUrl: profilePhotoUrl || undefined,
      portfolioUrl,
      country,
      yearsExperience,
      specialties,
      hourlyRateMin: hourlyRateMin ? Number(hourlyRateMin) : undefined,
      hourlyRateMax: hourlyRateMax ? Number(hourlyRateMax) : undefined,
      projectRateMin: projectRateMin ? Number(projectRateMin) : undefined,
      projectRateMax: projectRateMax ? Number(projectRateMax) : undefined,
      currency,
      linkedinUrl: linkedinUrl || undefined,
      twitterUrl: twitterUrl || undefined,
      dribbbleUrl: dribbbleUrl || undefined,
      githubUrl: githubUrl || undefined,
    });

    // Add showcase projects
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (p.projectName && p.projectUrl && p.description) {
        await convex.mutation(api.designers.addDesignerProject, {
          designerId,
          projectName: p.projectName,
          projectUrl: p.projectUrl,
          imageUrl: p.imageUrl || undefined,
          description: p.description,
          role: p.role || undefined,
          sortOrder: i,
        });
      }
    }

    // Notify admin of the new submission (mirrors the job-submission flow)
    const resendKey = process.env.CHOQUER_RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const from = process.env.CHOQUER_FROM_EMAIL || "bryce@choquer.agency";
        const to = process.env.REPORT_TO_EMAIL || "bryce@choquer.agency";
        const rate =
          hourlyRateMin || hourlyRateMax
            ? `${currency} ${hourlyRateMin ?? "?"}-${hourlyRateMax ?? "?"}/hr`
            : projectRateMin || projectRateMax
              ? `${currency} ${projectRateMin ?? "?"}-${projectRateMax ?? "?"}/project`
              : "—";
        await resend.emails.send({
          from: `Webflow Jobs <${from}>`,
          to: [to],
          replyTo: typeof email === "string" ? email : undefined,
          subject: `New designer submission: ${firstName} ${lastName}`,
          html: `
            <h2>New designer profile submitted</h2>
            <p><strong>${firstName} ${lastName}</strong> wants to be featured.</p>
            <ul>
              <li>Email: ${email}</li>
              <li>Country: ${country} · ${yearsExperience} experience</li>
              <li>Specialties: ${(specialties || []).join(", ")}</li>
              <li>Rate: ${rate}</li>
              <li>Portfolio: <a href="${portfolioUrl}">${portfolioUrl}</a></li>
              <li>Projects submitted: ${projects?.length || 0}</li>
            </ul>
            <p><a href="https://www.webflow.jobs/admin">Review in admin dashboard →</a></p>
          `,
        });
      } catch (mailErr) {
        console.error("Failed to send designer notification email:", mailErr);
      }
    }

    return NextResponse.json({ success: true, designerId });
  } catch (err: any) {
    const message = err.message || "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
