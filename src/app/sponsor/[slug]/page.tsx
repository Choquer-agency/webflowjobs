import { getJobBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import SponsorClient from "./SponsorClient";

export default async function SponsorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <SponsorClient
      slug={job.slug}
      jobId={job.id}
      title={job.title}
      companyName={job.companyName}
      companyLogoUrl={job.companyLogoUrl}
      category={job.category}
      location={job.location}
      isSponsored={job.isSponsored ?? false}
    />
  );
}
