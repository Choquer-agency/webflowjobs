import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { NextResponse } from "next/server";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(CONVEX_URL);

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

    return NextResponse.json({ success: true, designerId });
  } catch (err: any) {
    const message = err.message || "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
