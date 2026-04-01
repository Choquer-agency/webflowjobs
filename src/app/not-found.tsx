import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section" style={{ padding: '8rem 0' }}>
      <div className="page-padding">
        <div className="container-large">
          <div className="utility-page_component" style={{ textAlign: 'center', maxWidth: '32rem', margin: '0 auto' }}>
            <h1 className="heading-style-h1">Page Not Found</h1>
            <p style={{ color: '#666', fontSize: '1.125rem', marginTop: '1rem', marginBottom: '2rem' }}>
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="button is-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 2rem',
                backgroundColor: 'rgb(255, 149, 0)',
                color: '#fff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
