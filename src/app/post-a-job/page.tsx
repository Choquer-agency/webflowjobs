import type { Metadata } from 'next';
import { PostAJobForm } from './PostAJobForm';

export const metadata: Metadata = {
  title: 'Post A Job | Webflow Jobs',
  description:
    'Post your Webflow job listing and reach thousands of talented Webflow designers, developers, and professionals.',
  alternates: {
    canonical: 'https://www.webflow.jobs/post-a-job',
  },
};

export default function PostAJobPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global z-index-1">
          <div className="padding-section-small padding-top">
            <div className="container-large">
              <div className="heading-content">
                <h1 className="hero-h1">Hire Webflow Developers Today</h1>
                <p className="max-width-medium">Help define our community and become a part of a network of people that are creating the career they love.</p>
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
                <div className="job_post-form-block w-form">
                  <PostAJobForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
