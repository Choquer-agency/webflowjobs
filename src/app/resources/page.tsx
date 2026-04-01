import Link from 'next/link';
import type { Metadata } from 'next';
import { getResources } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Helpful Resources & Blogs | Webflow.Jobs',
  description:
    'Explore helpful resources and blogs on Webflow Jobs. Get expert tips, industry insights, and career advice for Webflow designers and developers!',
  openGraph: {
    title: 'Helpful Resources & Blogs | Webflow.Jobs',
    description:
      'Explore helpful resources and blogs on Webflow Jobs. Get expert tips, industry insights, and career advice for Webflow designers and developers!',
  },
  twitter: {
    title: 'Helpful Resources & Blogs | Webflow.Jobs',
    description:
      'Explore helpful resources and blogs on Webflow Jobs. Get expert tips, industry insights, and career advice for Webflow designers and developers!',
  },
  alternates: {
    canonical: 'https://www.webflow.jobs/resources',
  },
};

export default function ResourcesPage() {
  const resources = getResources();

  return (
    <section className="section" style={{ paddingTop: '5rem' }}>
      <div className="padding-global">
        <div className="padding-section-large">
          <div className="container-large">
            <div className="heading-content">
              <h1>Blog &amp; Resources</h1>
              <div className="spacer-component" style={{ paddingTop: '.5rem' }}></div>
              {resources.length === 0 ? (
                <div>
                  <div>No items found.</div>
                </div>
              ) : (
                <div role="list" className="grid-3c_layout">
                  {resources.map((resource) => (
                    <div key={resource.slug} role="listitem" className="resource_item">
                      <Link href={`/resources/${resource.slug}`} className="resource_link w-inline-block"></Link>
                      {resource.thumbnailUrl ? (
                        <img
                          src={resource.thumbnailUrl}
                          loading="lazy"
                          alt={resource.title}
                          className="resource_image"
                        />
                      ) : (
                        <img
                          src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                          loading="lazy"
                          alt=""
                          className="resource_image"
                        />
                      )}
                      <div className="resource_content">
                        <p className="resource-title">{resource.resourceType || 'BLOG'}</p>
                        <h3 className="heading-style-h4">{resource.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
