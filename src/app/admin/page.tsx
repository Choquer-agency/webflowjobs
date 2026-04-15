import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { isAuthed } from "./actions";
import { LoginForm } from "./LoginForm";
import { LeadsDashboard } from "./LeadsDashboard";

export const metadata = {
  title: "Admin · Webflow Jobs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function fetchApplicants() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return [];
  const convex = new ConvexHttpClient(url);
  const rows = await convex.query(api.applicants.listApplicants, {});
  return rows.map((r: any) => ({
    _id: String(r._id),
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    jobSlug: r.jobSlug,
    jobTitle: r.jobTitle,
    companyName: r.companyName,
    submittedAt: r.submittedAt,
  }));
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

  const applicants = await fetchApplicants();
  return <LeadsDashboard applicants={applicants} />;
}
