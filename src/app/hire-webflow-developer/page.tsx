import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hire a Webflow Developer | Webflow Jobs',
  description:
    'Hire a Webflow developer from a pool of 5,000+ qualified professionals. Post your job listing for free and find designers, developers, SEO, CRO, and Google Ads talent.',
  alternates: {
    canonical: 'https://www.webflow.jobs/hire-webflow-developer',
  },
};

export default function HireWebflowDeveloperPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global z-index-1">
          <div className="padding-section-small padding-top">
            <div className="container-large">
              <div className="heading-content" style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
                <h1 className="hero-h1">Hire a Webflow Developer</h1>
                <p className="max-width-medium" style={{ margin: '1rem auto 2rem', fontSize: '1.125rem', color: '#555' }}>
                  Reach 5,000+ qualified Webflow professionals. Post your job listing for free.
                </p>
                <Link href="/post-a-job" className="button w-button">
                  Post a Job Now
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="section-background_component">
          <div className="bg-overlay"></div>
        </div>
      </section>

      {/* Why Post */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <h2 className="heading-style-h2" style={{ marginBottom: '1.5rem' }}>
                Why Post on Webflow Jobs?
              </h2>
              <div className="grid-3c_layout" style={{ gap: '2rem' }}>
                <div className="card is-lighter_orange" style={{ padding: '2rem' }}>
                  <h3 className="heading-style-h4" style={{ marginBottom: '0.75rem' }}>Niche Audience</h3>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>
                    Every candidate on our platform has Webflow experience. No generic applicants -- only specialists who know the platform inside and out.
                  </p>
                </div>
                <div className="card is-lighter_orange" style={{ padding: '2rem' }}>
                  <h3 className="heading-style-h4" style={{ marginBottom: '0.75rem' }}>Free to Post</h3>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>
                    List your job at no cost. We believe connecting great talent with great companies should not come with a price tag.
                  </p>
                </div>
                <div className="card is-lighter_orange" style={{ padding: '2rem' }}>
                  <h3 className="heading-style-h4" style={{ marginBottom: '0.75rem' }}>Quick Setup</h3>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>
                    Post your listing in under 5 minutes. Your job goes live within hours after a quick review.
                  </p>
                </div>
                <div className="card is-lighter_orange" style={{ padding: '2rem' }}>
                  <h3 className="heading-style-h4" style={{ marginBottom: '0.75rem' }}>Email Distribution</h3>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>
                    Opt in to have your listing emailed to our community of 5,000+ Webflow professionals for maximum visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Kind of Talent */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <h2 className="heading-style-h2" style={{ marginBottom: '1.5rem' }}>
                What Kind of Talent You&apos;ll Find
              </h2>
              <div className="grid-3c_layout" style={{ gap: '1.5rem' }}>
                {[
                  { title: 'Webflow Designers', desc: 'UI/UX and visual designers who build pixel-perfect sites in Webflow.' },
                  { title: 'Webflow Developers', desc: 'Front-end and full-stack developers skilled in custom Webflow builds, CMS, and integrations.' },
                  { title: 'SEO Specialists', desc: 'Technical SEO and content strategists experienced with Webflow site optimization.' },
                  { title: 'CRO Experts', desc: 'Conversion rate optimization professionals who know how to turn Webflow pages into high-performers.' },
                  { title: 'Google Ads Managers', desc: 'PPC and SEM specialists who pair ad campaigns with optimized Webflow landing pages.' },
                ].map((item) => (
                  <div key={item.title} style={{ padding: '1.5rem 0', borderBottom: '1px solid #eee' }}>
                    <h3 className="heading-style-h5" style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ color: '#555', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large" style={{ textAlign: 'center' }}>
              <h2 className="heading-style-h2" style={{ marginBottom: '1rem' }}>
                Ready to Find Your Next Hire?
              </h2>
              <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '36rem', margin: '0 auto 2rem' }}>
                Post your job listing in minutes and start receiving applications from qualified Webflow professionals.
              </p>
              <Link href="/post-a-job" className="button w-button">
                Post a Job for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <h2 className="heading-style-h2" style={{ marginBottom: '2rem' }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem' }}>
                {[
                  {
                    q: 'How much does it cost to post a job?',
                    a: 'Posting a standard job listing is completely free. We also offer optional paid spotlight promotions for increased visibility.',
                  },
                  {
                    q: 'How long does it take for my listing to go live?',
                    a: 'Listings are reviewed and published within 6 hours of submission. You will receive a confirmation email once your post is live.',
                  },
                  {
                    q: 'What types of roles can I post?',
                    a: 'You can post full-time, part-time, freelance, and contract positions for any role that involves Webflow -- including developer, designer, SEO, CRO, and marketing roles.',
                  },
                  {
                    q: 'Can I edit my listing after posting?',
                    a: 'Yes. Contact us and we will update your listing promptly.',
                  },
                  {
                    q: 'How do I receive applications?',
                    a: 'Applications are sent directly to the email address or job posting URL you provide when creating the listing. We do not act as a middleman.',
                  },
                ].map((item) => (
                  <div key={item.q} style={{ borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
                    <h3 className="heading-style-h5" style={{ marginBottom: '0.5rem' }}>{item.q}</h3>
                    <p style={{ color: '#555', lineHeight: 1.6 }}>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
