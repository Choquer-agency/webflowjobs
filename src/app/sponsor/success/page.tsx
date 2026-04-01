export default function SponsorSuccessPage() {
  return (
    <div style={{
      maxWidth: '560px',
      margin: '100px auto',
      padding: '0 20px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 149, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        fontSize: '28px',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(255, 149, 0)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>
        Your Job Is Now Sponsored!
      </h1>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6, margin: '0 0 32px' }}>
        Your listing will appear at the top of all job pages on Webflow.jobs for the duration of your sponsorship.
        You should see the change within a few seconds.
      </p>

      <a
        href="/"
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          backgroundColor: 'rgb(255, 149, 0)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '16px',
        }}
      >
        View Job Board
      </a>
    </div>
  );
}
