import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { isAuthed } from "./actions";
import { LoginForm } from "./LoginForm";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = {
  title: "Admin · Webflow Jobs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function fetchData() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return { applicants: [], submissions: [], jobs: [], designers: [] };
  const convex = new ConvexHttpClient(url);

  const [applicants, submissions, jobs, designers] = await Promise.all([
    convex.query(api.applicants.listApplicants, {}),
    convex.query(api.jobSubmissions.listSubmissions, {}),
    convex.query(api.jobs.listAllJobs, {}),
    convex.query(api.designers.listAllDesigners, {}),
  ]);

  // job _id -> slug, so admin "View live" links resolve to the real URL
  const slugById: Record<string, string> = {};
  for (const j of jobs) slugById[String(j._id)] = j.slug;

  return {
    jobs: jobs.map((j: any) => ({
      slug: j.slug,
      title: j.title,
      companyName: j.companyName,
      category: j.category,
      jobType: j.jobType,
      source: j.source,
      isSponsored: j.isSponsored,
      publishedAt: j.publishedAt,
      descLength: (j.jobDescription || "").length,
    })),
    designers: designers.map((d: any) => ({
      _id: String(d._id),
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      slug: d.slug,
      bio: d.bio,
      profilePhotoUrl: d.profilePhotoUrl,
      portfolioUrl: d.portfolioUrl,
      country: d.country,
      yearsExperience: d.yearsExperience,
      specialties: d.specialties || [],
      hourlyRateMin: d.hourlyRateMin,
      hourlyRateMax: d.hourlyRateMax,
      projectRateMin: d.projectRateMin,
      projectRateMax: d.projectRateMax,
      currency: d.currency,
      linkedinUrl: d.linkedinUrl,
      twitterUrl: d.twitterUrl,
      dribbbleUrl: d.dribbbleUrl,
      githubUrl: d.githubUrl,
      status: d.status,
      submittedAt: d.submittedAt,
    })),
    applicants: applicants.map((r: any) => ({
      _id: String(r._id),
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      jobSlug: r.jobSlug,
      jobTitle: r.jobTitle,
      companyName: r.companyName,
      submittedAt: r.submittedAt,
    })),
    submissions: submissions.map((s: any) => ({
      _id: String(s._id),
      title: s.title,
      jobDescription: s.jobDescription,
      jobType: s.jobType,
      category: s.category,
      location: s.location,
      postingEmail: s.postingEmail,
      postingUrl: s.postingUrl,
      companyName: s.companyName,
      companyLogoUrl: s.companyLogoUrl,
      companyWebsite: s.companyWebsite,
      aboutCompany: s.aboutCompany,
      salaryMin: s.salaryMin,
      salaryMax: s.salaryMax,
      salaryCurrency: s.salaryCurrency,
      salaryPeriod: s.salaryPeriod,
      comments: s.comments,
      wantsEmailBlast: s.wantsEmailBlast,
      wants4WeekSpotlight: s.wants4WeekSpotlight,
      wants1WeekSpotlight: s.wants1WeekSpotlight,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      publishedJobId: s.publishedJobId ? String(s.publishedJobId) : undefined,
      publishedJobSlug: s.publishedJobId ? slugById[String(s.publishedJobId)] : undefined,
    })),
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await isAuthed();
  const params = await searchParams;

  if (!authed) {
    return <LoginForm error={params.error === "1"} />;
  }

  const { applicants, submissions, jobs, designers } = await fetchData();
  return (
    <AdminDashboard
      applicants={applicants}
      submissions={submissions}
      jobs={jobs}
      designers={designers}
    />
  );
}
