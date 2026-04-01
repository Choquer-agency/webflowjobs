import Link from 'next/link';

export interface Job {
  slug: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  jobType: string;
  location?: string;
  category: string;
  publishedAt: string;
  applyUrl?: string;
  isVerified?: boolean;
  isSponsored?: boolean;
}

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

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className={`posting_item${job.isSponsored ? ' is-sponsored' : ''}`} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.5rem' }}>
        {/* Company logo */}
        {job.companyLogoUrl ? (
          <img
            className="company_logo"
            src={job.companyLogoUrl}
            alt={`${job.companyName} logo`}
            style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            className="company_logo"
            style={{
              width: '5rem',
              height: '5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 149, 0, 0.12)',
              flexShrink: 0,
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
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title section */}
          <div className="heading-content gap-0-25 align-middle is-title">
            <p className="text-style-eyebrow" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: '0.25rem' }}>
              {job.category}
            </p>
            <h4 className="heading-style-h4" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
              {job.title}
            </h4>
            <p className="company_name" style={{ color: '#666', margin: '0.25rem 0 0' }}>
              {job.companyName}
            </p>
          </div>

          {/* Details section */}
          <div className="posting_details" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {job.isSponsored && (
              <span
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 149, 0), rgb(255, 120, 0))',
                  color: '#fff',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Sponsored
              </span>
            )}
            {!job.isSponsored && isNew(job.publishedAt) && (
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
            <span style={{ fontSize: '0.875rem', color: '#555' }}>{job.jobType}</span>
            {job.location && (
              <>
                <span style={{ color: '#ccc' }}>&bull;</span>
                <span style={{ fontSize: '0.875rem', color: '#555' }}>{job.location}</span>
              </>
            )}
            <span style={{ color: '#ccc' }}>&bull;</span>
            <span style={{ fontSize: '0.875rem', color: '#555' }}>{formatDate(job.publishedAt)}</span>
          </div>
        </div>

        {/* Apply button */}
        <a
          href={job.applyUrl || `/jobs/${job.slug}`}
          className="button"
          style={{
            zIndex: 2,
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.625rem 1.25rem',
            backgroundColor: 'rgb(255, 149, 0)',
            color: '#fff',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            flexShrink: 0,
            alignSelf: 'center',
          }}
        >
          Apply
        </a>
      </div>

      {/* Full card clickable link */}
      <Link
        href={`/jobs/${job.slug}`}
        className="posting_link"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <span className="sr-only">View {job.title}</span>
      </Link>
    </div>
  );
}
