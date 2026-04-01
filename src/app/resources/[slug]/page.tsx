import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getResources, getResourceBySlug } from '@/lib/data';

export async function generateStaticParams() {
  const resources = getResources();
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) {
    return { title: 'Resource Not Found | Webflow Jobs' };
  }

  const title = resource.metaTitle ?? `${resource.title} | Webflow Jobs`;
  const description =
    resource.metaDescription ??
    `Read "${resource.title}" on the Webflow Jobs blog.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.webflow.jobs/resources/${resource.slug}`,
      ...(resource.thumbnailUrl ? { images: [resource.thumbnailUrl] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.webflow.jobs/resources/${resource.slug}`,
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const pageUrl = `https://www.webflow.jobs/resources/${resource.slug}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(resource.title);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: resource.title,
    description: resource.metaDescription ?? '',
    ...(resource.thumbnailUrl ? { image: resource.thumbnailUrl } : {}),
    datePublished: resource.publishedAt ?? resource.createdAt,
    dateModified: resource.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'Webflow Jobs',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Webflow Jobs',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.webflow.jobs/images/favicon.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero - orange box with title */}
      <section className="section_resource-hero" style={{ paddingTop: '7rem' }}>
        <div className="padding-global-3">
          <div className="container-large-5">
            <div className="resource-hero_wrap-resize0bryce">
              {resource.thumbnailUrl && (
                <img
                  loading="lazy"
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  className="resource-hero_bg"
                />
              )}
              <div className="center-heading-content-2 max-width-xlarge">
                <h1>{resource.title}</h1>
                <p className="text-size-medium-3">{resource.resourceType || 'Blog'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="section">
        <div className="padding-global-3">
          <div className="container-large-4">
            <div className="padding-section-medium-2">
              <div className="resource-body_wrap">
                {/* Left sidebar - social share */}
                <div className="resource-body_sidebar">
                  <div className="resource-body_sidebar_social">
                    <div className="text-style-eyebrow">Share it on Social Media</div>
                    <div className="resources_article_social-share">
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resources_article_social-share_link w-inline-block"
                      >
                        <div className="icon-medium-2 w-embed">
                          <svg aria-hidden="true" role="img" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Twitter icon</title>
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                          </svg>
                        </div>
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resources_article_social-share_link w-inline-block"
                      >
                        <div className="icon-medium-2 w-embed">
                          <svg aria-hidden="true" role="img" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <title>Facebook icon</title>
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                          </svg>
                        </div>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resources_article_social-share_link w-inline-block"
                      >
                        <div className="icon-medium-2 w-embed">
                          <svg aria-hidden="true" role="img" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <title>LinkedIn icon</title>
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                          </svg>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="heading-content">
                  {resource.publishedAt && (
                    <div className="text-color-gray">{formatDate(resource.publishedAt)}</div>
                  )}
                  {resource.content ? (
                    <div
                      className="text-rich-text w-richtext"
                      dangerouslySetInnerHTML={{ __html: resource.content }}
                    />
                  ) : (
                    <p>Content coming soon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
