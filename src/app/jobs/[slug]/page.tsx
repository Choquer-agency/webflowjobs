import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getJobs, getAllJobs, getJobBySlug } from '@/lib/data';

export const revalidate = 900;
import type { Job } from '@/lib/types';
import RichTextContent from '@/components/ui/RichTextContent';
import ApplyPopup from '@/components/ApplyPopup';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isNew(dateStr: string): boolean {
  const published = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map a category name to its URL slug on /jobs/category/[slug] */
function categoryToSlug(category: string): string {
  const map: Record<string, string> = {
    'webflow developer': 'webflow-developer',
    'designer': 'designer',
    'seo': 'seo',
    'cro': 'cro',
    'google ads': 'google-ads',
    'marketing': 'marketing',
    'other': 'other',
  };
  return map[category.toLowerCase()] ?? category.toLowerCase().replace(/\s+/g, '-');
}

/** Map a job type to its URL slug */
function jobTypeToSlug(jobType: string): string {
  const map: Record<string, string> = {
    'full-time': 'full-time',
    'part-time': 'part-time',
    'freelance': 'freelance',
    'contract': 'freelance',
  };
  return map[jobType.toLowerCase()] ?? jobType.toLowerCase().replace(/\s+/g, '-');
}

/** Map a location to a link — "Remote" goes to /jobs/category/remote, others are not linked */
function locationLink(location: string): string | null {
  if (location.toLowerCase().includes('remote')) return '/jobs/category/remote';
  return null;
}

export async function generateStaticParams() {
  const jobs = await getAllJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) {
    return { title: 'Job Not Found | Webflow Jobs' };
  }

  const title = `${job.title} at ${job.companyName} | Webflow Jobs`;
  const description = `Apply for ${job.title} at ${job.companyName}. ${job.jobType ?? ''} ${job.location ? `in ${job.location}` : ''} — Find more Webflow jobs at webflow.jobs`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.webflow.jobs/jobs/${job.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.webflow.jobs/jobs/${job.slug}`,
    },
  };
}

function getRelatedJobs(allJobs: Job[], currentJob: Job, count: number = 3): Job[] {
  const sameCategory = allJobs.filter(
    (j) => j.slug !== currentJob.slug && j.category === currentJob.category
  );
  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }
  const remaining = allJobs.filter(
    (j) => j.slug !== currentJob.slug && j.category !== currentJob.category
  );
  return [...sameCategory, ...remaining].slice(0, count);
}

function mapEmploymentType(jobType: string | null): string {
  if (!jobType) return 'FULL_TIME';
  const normalized = jobType.trim().toLowerCase();
  if (normalized === 'full-time' || normalized === 'full time') return 'FULL_TIME';
  if (normalized === 'part-time' || normalized === 'part time') return 'PART_TIME';
  if (normalized === 'freelance' || normalized === 'contract') return 'CONTRACTOR';
  return 'OTHER';
}

function computeValidThrough(publishedAt: string | null, createdAt: string): string {
  const base = new Date(publishedAt ?? createdAt);
  base.setDate(base.getDate() + 60);
  return base.toISOString().split('T')[0];
}

function isRemoteLocation(location: string | null): boolean {
  if (!location) return true;
  return location.trim().toLowerCase() === 'remote';
}

function buildJobPostingJsonLd(job: Job) {
  const datePosted = job.publishedAt ?? job.createdAt;
  const remote = isRemoteLocation(job.location);

  const locationFields = remote
    ? {
        jobLocationType: 'TELECOMMUTE',
        applicantLocationRequirements: {
          '@type': 'Country',
          name: 'US',
        },
      }
    : {
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location ?? '',
            addressCountry: 'US',
          },
        },
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.jobDescription ?? '',
    datePosted,
    validThrough: computeValidThrough(job.publishedAt, job.createdAt),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
      ...(job.companyLogoUrl ? { logo: job.companyLogoUrl } : {}),
    },
    ...locationFields,
    employmentType: mapEmploymentType(job.jobType),
    directApply: true,
    ...(job.applyUrl ? { url: job.applyUrl } : {}),
  };
}

/* ─── Tag pill component ─── */
function TagPill({ label, href }: { label: string; href: string | null }) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    color: '#333',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s',
  };

  if (href) {
    return <Link href={href} style={style}>{label}</Link>;
  }
  return <span style={style}>{label}</span>;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const allJobs = await getJobs();
  const relatedJobs = getRelatedJobs(allJobs, job, 3);
  const compSlug = companySlug(job.companyName);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobPostingJsonLd(job)),
        }}
      />

      <section className="section" style={{ paddingTop: '6rem' }}>
        <div className="padding-global">
          <div className="padding-section-medium">
            <div className="container-large">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem', alignItems: 'start' }}>
              {/* Left column */}
              <div>
                {/* Date badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {job.publishedAt && isNew(job.publishedAt) && (
                    <span
                      style={{
                        backgroundColor: 'rgb(255, 149, 0)',
                        color: '#fff',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      NEW
                    </span>
                  )}
                  {job.publishedAt && (
                    <span style={{ fontSize: '0.875rem', color: '#888' }}>
                      Posted {formatDate(job.publishedAt)}
                    </span>
                  )}
                </div>

                {/* Title — full width, no truncation */}
                <h1 className="hero-h1" style={{ margin: 0, wordBreak: 'break-word' }}>
                  {job.title}
                </h1>

                {/* Company name — linked to company page */}
                <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.125rem' }}>
                  <Link href={`/companies/${compSlug}`} style={{ color: '#666', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.15s' }}>
                    {job.companyName}
                  </Link>
                </p>

                {/* Feature tags — horizontal, clickable */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {job.jobType && (
                    <TagPill label={job.jobType} href={`/jobs/category/${jobTypeToSlug(job.jobType)}`} />
                  )}
                  {job.location && (
                    <TagPill label={job.location} href={locationLink(job.location)} />
                  )}
                  {job.category && (
                    <TagPill label={job.category} href={`/jobs/category/${categoryToSlug(job.category)}`} />
                  )}
                </div>

                {/* Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />

                {/* Job description — improved line spacing */}
                <div style={{ lineHeight: 1.8, fontSize: '1rem', color: '#333' }}>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1rem' }}>Job Description</h2>
                  {job.jobDescription ? (
                    <RichTextContent html={job.jobDescription} />
                  ) : (
                    <div>
                      <p>{job.companyName} is hiring a <strong>{job.title}</strong>{job.location ? ` in ${job.location}` : ''}. This is a {job.jobType?.toLowerCase() ?? 'full-time'} {job.category?.toLowerCase() ?? ''} position.</p>
                      {job.applyUrl && (
                        <p style={{ marginTop: '1rem' }}>
                          Click <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(255, 149, 0)', fontWeight: 600 }}>Apply Now</a> to view the full job description and submit your application.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* About the company */}
                {job.aboutCompany && (
                  <div style={{ marginTop: '2.5rem', lineHeight: 1.8 }}>
                    <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1rem' }}>About the Company</h2>
                    <RichTextContent html={job.aboutCompany} />
                  </div>
                )}
              </div>

              {/* Right column — sticky sidebar */}
              <div>
                <div className="card is-lighter_orange is-sticky" style={{ position: 'sticky', top: '6rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
                    {/* Company logo */}
                    {job.companyLogoUrl ? (
                      <Link href={`/companies/${compSlug}`}>
                        <img
                          src={job.companyLogoUrl}
                          alt={`${job.companyName} logo`}
                          style={{
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      </Link>
                    ) : (
                      <Link href={`/companies/${compSlug}`} style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 149, 0, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'rgba(255, 149, 0, 0.88)',
                          }}
                        >
                          {job.companyName.charAt(0).toUpperCase()}
                        </div>
                      </Link>
                    )}

                    {/* Company name */}
                    <div style={{ textAlign: 'center' }}>
                      <Link href={`/companies/${compSlug}`} style={{ fontWeight: 600, fontSize: '1.125rem', color: '#333', textDecoration: 'none' }}>
                        {job.companyName}
                      </Link>
                      {job.isVerified && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: 'rgb(255, 149, 0)',
                            marginTop: '0.25rem',
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* One-sentence summary */}
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#555', lineHeight: 1.6, margin: 0 }}>
                      {job.companyName} is looking for a {job.category?.toLowerCase() ?? 'professional'}{job.location ? ` based in ${job.location}` : ''}.
                    </p>

                    {/* CTA */}
                    <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#888', lineHeight: 1.5, margin: 0 }}>
                      Apply now through Webflow.Jobs and level up your career.
                    </p>

                    {/* Apply button with lead capture */}
                    {job.applyUrl && (
                      <ApplyPopup
                        jobTitle={job.title}
                        companyName={job.companyName}
                        jobSlug={job.slug}
                        applyUrl={job.applyUrl}
                      >
                        <span
                          className="button w-button"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          Apply Now
                        </span>
                      </ApplyPopup>
                    )}

                    {/* View all jobs link */}
                    <Link
                      href={`/companies/${compSlug}`}
                      style={{
                        fontSize: '0.8125rem',
                        color: 'rgb(255, 149, 0)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      View all jobs from {job.companyName} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related jobs */}
            {relatedJobs.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Related Jobs
                </h3>
                <div className="grid-3c_layout">
                  {relatedJobs.map((relJob) => (
                    <Link
                      key={relJob.slug}
                      href={`/jobs/${relJob.slug}`}
                      className="posting_item"
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '1.5rem' }}
                    >
                      <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: '0.25rem' }}>
                        {relJob.category}
                      </p>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.25rem' }}>
                        {relJob.title}
                      </h4>
                      <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                        {relJob.companyName}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {relJob.jobType && (
                          <span style={{ fontSize: '0.8rem', color: '#555' }}>{relJob.jobType}</span>
                        )}
                        {relJob.location && (
                          <>
                            <span style={{ color: '#ccc' }}>&bull;</span>
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>{relJob.location}</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
