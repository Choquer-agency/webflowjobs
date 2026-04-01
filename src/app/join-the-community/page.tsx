import type { Metadata } from 'next';
import DesignerApplicationForm from '@/components/designers/DesignerApplicationForm';

export const metadata: Metadata = {
  title: 'Be Featured As A Webflow Designer | Webflow Jobs',
  description:
    'Apply to be featured in the Webflow Jobs designer directory. Showcase your portfolio, projects, and skills to companies looking to hire Webflow professionals.',
  alternates: {
    canonical: 'https://www.webflow.jobs/join-the-community',
  },
};

export default function JoinTheCommunityPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global z-index-1">
          <div className="padding-section-small padding-top">
            <div className="container-large">
              <div className="heading-content">
                <h1 className="hero-h1">Be Featured As A Webflow Designer</h1>
                <p className="max-width-medium">
                  Join our directory of talented Webflow designers and developers. Showcase your
                  work, set your rates, and get discovered by companies looking to hire.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-background_component">
          <div className="bg-overlay"></div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <div className="grid-2c_layout is-post_a_job">
                <DesignerApplicationForm />

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="card is-lighter_orange is-sticky" style={{ padding: '2rem', borderRadius: '0.75rem' }}>
                    <h3 className="heading-style-h4" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                      Why Get Featured?
                    </h3>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#555', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                      <li>Get discovered by companies actively hiring Webflow talent.</li>
                      <li>Showcase your best projects and portfolio to the right audience.</li>
                      <li>Set your rates and let clients come to you.</li>
                      <li>Build credibility in the Webflow community.</li>
                      <li>Optional sponsored tier for priority placement and a verified badge.</li>
                    </ul>
                  </div>

                  <div className="card is-lighter_orange" style={{ padding: '2rem', borderRadius: '0.75rem' }}>
                    <h3 className="heading-style-h4" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                      How It Works
                    </h3>
                    <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#555', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                      <li><strong>Apply</strong> &mdash; Fill out the form with your details and showcase projects.</li>
                      <li><strong>Review</strong> &mdash; Our team reviews your application.</li>
                      <li><strong>Go Live</strong> &mdash; Once approved, your profile appears in the designer directory.</li>
                      <li><strong>Get Hired</strong> &mdash; Companies browse the directory and reach out to you directly.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
