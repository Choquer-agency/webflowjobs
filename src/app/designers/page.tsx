import type { Metadata } from 'next';
import Link from 'next/link';
import { getApprovedDesigners } from '@/lib/data';
import DesignerFilterClient from '@/components/designers/DesignerFilterClient';

export const metadata: Metadata = {
  title: 'Webflow Designer Directory | Webflow Jobs',
  description:
    'Browse and hire talented Webflow designers and developers. Find verified professionals with portfolio showcases, pricing, and specialties.',
  alternates: {
    canonical: 'https://www.webflow.jobs/designers',
  },
};

export default async function DesignersPage() {
  const designers = await getApprovedDesigners();

  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global z-index-1">
          <div className="padding-section-small padding-top">
            <div className="container-large">
              <div className="heading-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 className="hero-h1">Webflow Designer Directory</h1>
                  <p className="max-width-medium">
                    Browse talented Webflow designers and developers. Find the right professional for your next project.
                  </p>
                </div>
                <Link
                  href="/join-the-community"
                  className="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgb(255, 149, 0)',
                    color: '#fff',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  Get Featured
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="section-background_component">
          <div className="bg-overlay"></div>
        </div>
      </section>

      {/* Directory */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <DesignerFilterClient designers={designers} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
