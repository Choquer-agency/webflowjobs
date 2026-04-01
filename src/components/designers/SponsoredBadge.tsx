export default function SponsoredBadge({ size = 'default' }: { size?: 'default' | 'large' }) {
  const fontSize = size === 'large' ? '0.8125rem' : '0.6875rem';
  const padding = size === 'large' ? '0.25rem 0.75rem' : '0.2rem 0.5rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: 'rgb(255, 149, 0)',
        color: '#fff',
        borderRadius: '999px',
        padding,
        fontSize,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified
    </span>
  );
}
