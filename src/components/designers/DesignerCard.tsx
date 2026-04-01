import Link from 'next/link';
import type { Designer } from '@/lib/types';
import SponsoredBadge from './SponsoredBadge';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: 'C$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  AUD: 'A$',
};

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function formatRate(min: number | null, max: number | null, currency: string): string | null {
  if (min === null && max === null) return null;
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  if (min !== null && max !== null) {
    if (min === max) return `${sym}${fmt(min)}`;
    return `${sym}${fmt(min)} - ${sym}${fmt(max)}`;
  }
  if (min !== null) return `${sym}${fmt(min)}+`;
  return `Up to ${sym}${fmt(max!)}`;
}

export default function DesignerCard({ designer }: { designer: Designer }) {
  const hourlyRate = formatRate(designer.hourlyRateMin, designer.hourlyRateMax, designer.currency);
  const projectRate = formatRate(designer.projectRateMin, designer.projectRateMax, designer.currency);
  const fullName = `${designer.firstName} ${designer.lastName}`;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '0.75rem',
        border: designer.isSponsored ? '2px solid rgb(255, 149, 0)' : '1px solid #eee',
        backgroundColor: '#fff',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'box-shadow 0.2s ease',
      }}
      className="designer-card"
    >
      {/* Header: Photo + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {designer.profilePhotoUrl ? (
          <img
            src={designer.profilePhotoUrl}
            alt={fullName}
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 149, 0, 0.12)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'rgba(255, 149, 0, 0.88)',
            }}
          >
            {designer.firstName.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{fullName}</h3>
            {designer.isSponsored && <SponsoredBadge />}
          </div>
          <p style={{ color: '#666', fontSize: '0.875rem', margin: '0.125rem 0 0' }}>
            {designer.country} &bull; {designer.yearsExperience}
          </p>
        </div>
      </div>

      {/* Specialties */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {designer.specialties.slice(0, 4).map((s) => (
          <span
            key={s}
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 149, 0, 0.1)',
              color: 'rgb(180, 100, 0)',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {s}
          </span>
        ))}
        {designer.specialties.length > 4 && (
          <span style={{ fontSize: '0.75rem', color: '#999', alignSelf: 'center' }}>
            +{designer.specialties.length - 4} more
          </span>
        )}
      </div>

      {/* Rates */}
      <div style={{ fontSize: '0.875rem', color: '#555' }}>
        {hourlyRate && <div>{hourlyRate}/hr</div>}
        {projectRate && <div>{projectRate}/project</div>}
        {!hourlyRate && !projectRate && <div style={{ color: '#999' }}>Rates on request</div>}
      </div>

      {/* View Profile link */}
      <Link
        href={`/designers/${designer.slug}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgb(255, 149, 0)',
          color: '#fff',
          borderRadius: '0.375rem',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          alignSelf: 'flex-start',
          marginTop: 'auto',
        }}
      >
        View Profile
      </Link>
    </div>
  );
}
