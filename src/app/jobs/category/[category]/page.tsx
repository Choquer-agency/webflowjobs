import type { Metadata } from 'next';
import Link from 'next/link';
import { getJobsByCategory, getJobsByType, getRemoteJobs } from '@/lib/data';

export const revalidate = 900;
import type { Job } from '@/lib/types';

const BASE_URL = 'https://www.webflow.jobs';

interface CategoryConfig {
  h1: string;
  metaDescription: string;
  intro: string;
}

const CATEGORIES: Record<string, CategoryConfig> = {
  'webflow-developer': {
    h1: 'Webflow Developer Jobs',
    metaDescription:
      'Find the latest Webflow developer job opportunities. Browse full-time, freelance, and remote positions for experienced Webflow developers.',
    intro:
      'Explore open positions for Webflow developers. Whether you specialize in custom code, Webflow CMS, or full-stack Webflow builds, find the role that matches your skill set.',
  },
  designer: {
    h1: 'Webflow Designer Jobs',
    metaDescription:
      'Browse designer positions in the Webflow ecosystem. Find UI/UX, web design, and visual design roles from companies hiring Webflow talent.',
    intro:
      'Discover design roles that let you put your Webflow skills to work. From UI/UX positions to brand and web design, these jobs are looking for creative professionals fluent in Webflow.',
  },
  seo: {
    h1: 'Webflow SEO Jobs',
    metaDescription:
      'Find SEO specialist positions in the Webflow ecosystem. Browse opportunities for technical SEO, content strategy, and search optimization professionals.',
    intro:
      'Looking for SEO roles that involve Webflow? Browse positions ranging from technical SEO to content strategy, all within companies that rely on the Webflow platform.',
  },
  cro: {
    h1: 'CRO Jobs in the Webflow Ecosystem',
    metaDescription:
      'Find conversion rate optimization jobs in the Webflow ecosystem. Browse CRO analyst, strategist, and optimization specialist positions.',
    intro:
      'Find conversion rate optimization roles at companies building on Webflow. These positions focus on A/B testing, landing page optimization, and data-driven growth.',
  },
  'google-ads': {
    h1: 'Google Ads Jobs | Webflow Jobs',
    metaDescription:
      'Find Google Ads specialist positions in the Webflow ecosystem. Browse PPC, SEM, and paid search roles from companies hiring Webflow-savvy marketers.',
    intro:
      'Browse Google Ads and paid search positions at Webflow-focused companies. These roles combine PPC expertise with landing page and conversion optimization skills.',
  },
  remote: {
    h1: 'Remote Webflow Jobs',
    metaDescription:
      'Find remote Webflow developer and designer positions. Browse work-from-home opportunities for Webflow professionals worldwide.',
    intro:
      'Work from anywhere. Browse remote Webflow positions spanning development, design, SEO, and more -- all offering the flexibility of working from home or wherever you choose.',
  },
  freelance: {
    h1: 'Freelance Webflow Jobs',
    metaDescription:
      'Browse freelance Webflow projects and contract opportunities. Find short-term and ongoing freelance work for Webflow developers and designers.',
    intro:
      'Find freelance Webflow gigs and contract projects. Whether you are looking for one-off builds or ongoing retainer work, these listings are tailored for independent professionals.',
  },
  'full-time': {
    h1: 'Full-Time Webflow Jobs',
    metaDescription:
      'Find full-time Webflow positions with benefits and career growth. Browse permanent roles for Webflow developers, designers, and marketers.',
    intro:
      'Ready for a permanent role? Browse full-time Webflow positions offering stability, benefits, and long-term career growth at companies that value Webflow expertise.',
  },
  'part-time': {
    h1: 'Part-Time Webflow Jobs',
    metaDescription:
      'Browse part-time Webflow opportunities. Find flexible, part-time roles for Webflow developers, designers, and digital marketers.',
    intro:
      'Looking for flexible hours? These part-time Webflow roles let you contribute your skills on a reduced schedule while maintaining work-life balance.',
  },
};

const CATEGORY_SLUGS = Object.keys(CATEGORIES);

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export const dynamicParams = false;

async function getJobsForCategory(slug: string): Promise<Job[]> {
  switch (slug) {
    case 'remote':
      return await getRemoteJobs();
    case 'freelance':
      return await getJobsByType('Freelance');
    case 'full-time':
      return await getJobsByType('Full Time');
    case 'part-time':
      return await getJobsByType('Part Time');
    case 'webflow-developer':
      return await getJobsByCategory('Webflow Developer');
    case 'google-ads':
      return await getJobsByCategory('Google Ads');
    default:
      return await getJobsByCategory(slug);
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isNew(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const published = new Date(dateStr);
  const now = new Date();
  const diffDays =
    (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

function prettyCategoryName(slug: string): string {
  return CATEGORIES[slug]?.h1 ?? slug;
}

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const config = CATEGORIES[category];
  if (!config) return {};
  return {
    title: `${config.h1} | Webflow Jobs`,
    description: config.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/jobs/category/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const config = CATEGORIES[category];
  if (!config) return null;

  const jobs = await getJobsForCategory(category);

  return (
    <>
      <section className="section" style={{ paddingTop: '6rem' }}>
        <div className="padding-global">
          <div className="padding-section-medium">
            <div className="container-large">
              <nav aria-label="Breadcrumb" style={{ fontSize: 'var(--size--small)', color: 'var(--base-color-neutral--grey-4)', marginBottom: '1rem' }}>
                <Link href="/" style={{ color: 'var(--base-color-neutral--grey-4)' }}>Home</Link>
                {' > '}
                <Link href="/" style={{ color: 'var(--base-color-neutral--grey-4)' }}>Jobs</Link>
                {' > '}
                <span style={{ color: 'var(--base-color-neutral--black)' }}>{prettyCategoryName(category)}</span>
              </nav>

              <div className="heading-content">
                <h1>{config.h1}</h1>
                <div className="spacer-xsmall"></div>
                <p className="max-width-medium">{config.intro}</p>
              </div>

              <div className="spacer-large"></div>
            {jobs.length === 0 ? (
              <p style={{ color: '#777', fontSize: '1.125rem' }}>
                No jobs found in this category right now. Check back soon or{' '}
                <Link href="/post-a-job" style={{ color: 'rgb(255, 149, 0)', textDecoration: 'underline' }}>
                  post a job
                </Link>{' '}
                to be the first.
              </p>
            ) : (
              <div className="w-dyn-list">
                <div role="list" className="posting_list w-dyn-items">
                  {jobs.map((job) => (
                    <div
                      key={job.slug}
                      role="listitem"
                      className="posting_item w-dyn-item"
                    >
                      {job.companyLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={job.companyLogoUrl}
                          loading="lazy"
                          alt=""
                          className="company_logo"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                          loading="lazy"
                          alt=""
                          className="company_logo"
                        />
                      )}
                      <p className="hide">{job.category}</p>
                      <div className="heading-content gap-0-25 align-middle is-title">
                        <h3 className="text-style-2lines">{job.title}</h3>
                        <div className="h-wrap gap-0-5">
                          <p className="paragraph">{job.companyName}</p>
                          {job.isVerified && (
                            <div className="icon-embed-xsmall w-embed">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                viewBox="0 0 14 14"
                                fill="none"
                                preserveAspectRatio="xMidYMid meet"
                                aria-hidden="true"
                                role="img"
                              >
                                <path
                                  d="M6.21266 0.65127C6.61132 0.192439 7.32374 0.192439 7.7224 0.65127L8.45517 1.49464C8.68144 1.75506 9.02598 1.88046 9.36671 1.82641L10.4702 1.65137C11.0705 1.55614 11.6162 2.01407 11.6267 2.62181L11.6459 3.73888C11.6518 4.08383 11.8352 4.40135 12.1309 4.57896L13.0887 5.15416C13.6098 5.46708 13.7335 6.16867 13.3509 6.64095L12.6476 7.50904C12.4304 7.7771 12.3667 8.13818 12.4791 8.46435L12.8431 9.52063C13.0412 10.0953 12.6849 10.7123 12.0883 10.8281L10.9915 11.041C10.6528 11.1068 10.372 11.3424 10.2484 11.6645L9.84827 12.7077C9.63058 13.2752 8.96113 13.5188 8.42958 13.224L7.45255 12.6822C7.15085 12.5148 6.78421 12.5148 6.48251 12.6822L5.50548 13.224C4.97393 13.5188 4.30448 13.2752 4.08679 12.7077L3.68666 11.6645C3.5631 11.3424 3.28224 11.1068 2.94357 11.041L1.8468 10.8281C1.25011 10.7123 0.893905 10.0953 1.09193 9.52063L1.45593 8.46435C1.56832 8.13818 1.50466 7.7771 1.28748 7.50904L0.584169 6.64095C0.201536 6.16867 0.325245 5.46708 0.846332 5.15416L1.80413 4.57896C2.09989 4.40135 2.28321 4.08383 2.28915 3.73888L2.30838 2.62181C2.31884 2.01407 2.86458 1.55614 3.46491 1.65137L4.56835 1.82641C4.90908 1.88046 5.25362 1.75506 5.47989 1.49464L6.21266 0.65127Z"
                                  fill="#FF9500"
                                />
                                <path
                                  d="M4.85645 7.17691L6.00408 8.32459C6.08219 8.4027 6.20882 8.4027 6.28693 8.32459L9.07827 5.53325"
                                  stroke="white"
                                  strokeWidth="0.75"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="posting_details">
                        {isNew(job.publishedAt) && (
                          <div className="new-badge">
                            <p>NEW</p>
                          </div>
                        )}
                        <div className="h-wrap is-details">
                          <div className="h-wrap gap-0-5">
                            <div className="bullet_dot"></div>
                            <p>{job.jobType}</p>
                          </div>
                          <div className="h-wrap gap-0-5">
                            <div className="bullet_dot"></div>
                            <p className="published-date">
                              {formatDate(job.publishedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="heading-content align-bottom z-index-2">
                        <a
                          href={job.applyUrl || '#'}
                          className="button w-button"
                        >
                          Apply
                        </a>
                      </div>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="posting_link w-inline-block"
                      ></Link>
                    </div>
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
