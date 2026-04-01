'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { Job } from '@/lib/types';
import ApplyPopup from '@/components/ApplyPopup';

/* ─────────── SVG Components ─────────── */

function VerifiedBadge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 14 14" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
      <path d="M6.21266 0.65127C6.61132 0.192439 7.32374 0.192439 7.7224 0.65127L8.45517 1.49464C8.68144 1.75506 9.02598 1.88046 9.36671 1.82641L10.4702 1.65137C11.0705 1.55614 11.6162 2.01407 11.6267 2.62181L11.6459 3.73888C11.6518 4.08383 11.8352 4.40135 12.1309 4.57896L13.0887 5.15416C13.6098 5.46708 13.7335 6.16867 13.3509 6.64095L12.6476 7.50904C12.4304 7.7771 12.3667 8.13818 12.4791 8.46435L12.8431 9.52063C13.0412 10.0953 12.6849 10.7123 12.0883 10.8281L10.9915 11.041C10.6528 11.1068 10.372 11.3424 10.2484 11.6645L9.84827 12.7077C9.63058 13.2752 8.96113 13.5188 8.42958 13.224L7.45255 12.6822C7.15085 12.5148 6.78421 12.5148 6.48251 12.6822L5.50548 13.224C4.97393 13.5188 4.30448 13.2752 4.08679 12.7077L3.68666 11.6645C3.5631 11.3424 3.28224 11.1068 2.94357 11.041L1.8468 10.8281C1.25011 10.7123 0.893905 10.0953 1.09193 9.52063L1.45593 8.46435C1.56832 8.13818 1.50466 7.7771 1.28748 7.50904L0.584169 6.64095C0.201536 6.16867 0.325245 5.46708 0.846332 5.15416L1.80413 4.57896C2.09989 4.40135 2.28321 4.08383 2.28915 3.73888L2.30838 2.62181C2.31884 2.01407 2.86458 1.55614 3.46491 1.65137L4.56835 1.82641C4.90908 1.88046 5.25362 1.75506 5.47989 1.49464L6.21266 0.65127Z" fill="#FF9500"></path>
      <path d="M4.85645 7.17691L6.00408 8.32459C6.08219 8.4027 6.20882 8.4027 6.28693 8.32459L9.07827 5.53325" stroke="white" strokeWidth="0.75" strokeLinecap="round"></path>
    </svg>
  );
}

function SelectArrow() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.44085 -1.55575e-07L2.44085 6.69866L0.790581 4.93595L2.23922e-07 5.78602L2.99996 9L6 5.78602L5.20942 4.93595L3.55907 6.69866L3.55907 -1.06696e-07L2.44085 -1.55575e-07Z" fill="#8E97F7"></path>
    </svg>
  );
}

/* ─────────── Helpers ─────────── */

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function isNew(dateStr: string): boolean {
  const published = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

/* ─────────── Component ─────────── */

interface JobFilterClientProps {
  jobs: {
    slug: string;
    title: string;
    companyName: string;
    companyLogoUrl: string | null;
    jobType: string | null;
    category: string | null;
    publishedAt: string | null;
    applyUrl: string | null;
    isVerified: boolean;
  }[];
}

export default function JobFilterClient({ jobs }: JobFilterClientProps) {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const categoryMatch = !categoryFilter || job.category === categoryFilter;
      const typeMatch = !typeFilter || job.jobType === typeFilter;
      return categoryMatch && typeMatch;
    });
  }, [jobs, categoryFilter, typeFilter]);

  return (
    <>
      <div className="h-wrap space-between wrap_landscape mw-75">
        <h2>Job Postings</h2>
        <div className="h-wrap">
          <div className="posting_filter-form-block w-form">
            <form id="email-form" name="email-form" data-name="Email Form" method="get" className="posting_filter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="h-wrap gap-0">
                <p className="text-color-gray">Occupation:</p>
                <div className="select-wrapper is-posting">
                  <select
                    id="Occupation-Filter"
                    name="Occupation-Filter"
                    data-name="Occupation Filter"
                    className="filter_select w-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Designer">Designer</option>
                    <option value="SEO">SEO</option>
                    <option value="CRO">CRO</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="select-arrow w-embed"><SelectArrow /></div>
                </div>
              </div>
              <div className="h-wrap gap-0 hide">
                <p className="text-color-gray">Type:</p>
                <div className="select-wrapper is-posting">
                  <select
                    id="Occupation-Filter-2"
                    name="Occupation-Filter-2"
                    data-name="Occupation Filter 2"
                    className="filter_select w-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  <div className="select-arrow w-embed"><SelectArrow /></div>
                </div>
              </div>
            </form>
            <div className="w-form-done">
              <div>Thank you! Your submission has been received!</div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </div>
      <div data-wf--spacer--size="large" className="spacer-component"></div>
      <div className="w-dyn-list">
        <div role="list" className="posting_list w-dyn-items">
          {filteredJobs.map((job) => (
            <div key={job.slug} w-el="parent" role="listitem" className="posting_item w-dyn-item">
              {job.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.companyLogoUrl} loading="lazy" alt="" className="company_logo" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg" loading="lazy" alt="" className="company_logo" />
              )}
              <p className="hide">{job.category}</p>
              <div className="heading-content gap-0-25 align-middle is-title">
                <h3 className="text-style-2lines">{job.title}</h3>
                <div className="h-wrap gap-0-5">
                  <p className="paragraph">{job.companyName}</p>
                  {job.isVerified && (
                    <div className="icon-embed-xsmall w-embed"><VerifiedBadge /></div>
                  )}
                </div>
              </div>
              <div className="posting_details">
                {job.publishedAt && isNew(job.publishedAt) && (
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
                    <p className="published-date">{job.publishedAt ? formatDate(job.publishedAt) : ''}</p>
                  </div>
                </div>
              </div>
              <div className="heading-content align-bottom z-index-2">
                <ApplyPopup jobTitle={job.title} companyName={job.companyName} applyUrl={job.applyUrl || '#'}>
                  <span className="button w-button">Apply</span>
                </ApplyPopup>
              </div>
              <Link href={`/jobs/${job.slug}`} className="posting_link w-inline-block"></Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
