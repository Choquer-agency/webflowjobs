import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getApprovedDesigners, getDesignerBySlug, getDesignerProjects } from '@/lib/data';
import SponsoredBadge from '@/components/designers/SponsoredBadge';
import ContactDesignerForm from '@/components/designers/ContactDesignerForm';

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const designers = await getApprovedDesigners();
  return designers.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) return { title: 'Designer Not Found | Webflow Jobs' };

  const fullName = `${designer.firstName} ${designer.lastName}`;
  return {
    title: `${fullName} - Webflow Designer | Webflow Jobs`,
    description: designer.bio.slice(0, 160),
    alternates: {
      canonical: `https://www.webflow.jobs/designers/${slug}`,
    },
  };
}

export default async function DesignerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const designer = await getDesignerBySlug(slug);
  if (!designer) notFound();

  const projects = await getDesignerProjects(designer.id);
  const fullName = `${designer.firstName} ${designer.lastName}`;
  const hourlyRate = formatRate(designer.hourlyRateMin, designer.hourlyRateMax, designer.currency);
  const projectRate = formatRate(designer.projectRateMin, designer.projectRateMax, designer.currency);

  const socials = [
    { label: 'LinkedIn', url: designer.linkedinUrl },
    { label: 'Twitter / X', url: designer.twitterUrl },
    { label: 'Dribbble', url: designer.dribbbleUrl },
    { label: 'GitHub', url: designer.githubUrl },
  ].filter((s) => s.url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName,
    url: `https://www.webflow.jobs/designers/${slug}`,
    image: designer.profilePhotoUrl || undefined,
    description: designer.bio,
    jobTitle: 'Webflow Designer',
    knowsAbout: designer.specialties,
    sameAs: socials.map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Profile Header */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Photo */}
                {designer.profilePhotoUrl ? (
                  <img
                    src={designer.profilePhotoUrl}
                    alt={fullName}
                    style={{
                      width: '7rem',
                      height: '7rem',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '7rem',
                      height: '7rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 149, 0, 0.12)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 600,
                      color: 'rgba(255, 149, 0, 0.88)',
                    }}
                  >
                    {designer.firstName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <h1 className="heading-style-h2" style={{ margin: 0 }}>{fullName}</h1>
                    {designer.isSponsored && <SponsoredBadge size="large" />}
                  </div>
                  <p style={{ color: '#666', fontSize: '1rem', marginBottom: '0.75rem' }}>
                    {designer.country} &bull; {designer.yearsExperience} Webflow experience
                  </p>

                  {/* Social links */}
                  {socials.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {socials.map((s) => (
                        <a
                          key={s.label}
                          href={s.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'rgb(255, 149, 0)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}
                        >
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}

                  <ContactDesignerForm
                    designerName={fullName}
                    designerEmail={designer.email}
                    designerSlug={designer.slug}
                  >
                    <span
                      className="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.625rem 1.25rem',
                        backgroundColor: 'rgb(255, 149, 0)',
                        color: '#fff',
                        borderRadius: '0.375rem',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      Contact Designer
                    </span>
                  </ContactDesignerForm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio + Details */}
      <section className="section">
        <div className="padding-global">
          <div className="container-large">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr', gap: '3rem', alignItems: 'start' }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {/* About */}
                <div>
                  <h2 className="heading-style-h4" style={{ marginBottom: '1rem' }}>About</h2>
                  <p style={{ color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{designer.bio}</p>
                </div>

                {/* Specialties */}
                <div>
                  <h2 className="heading-style-h4" style={{ marginBottom: '1rem' }}>Specialties</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {designer.specialties.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(255, 149, 0, 0.1)',
                          color: 'rgb(180, 100, 0)',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showcase Projects */}
                {projects.length > 0 && (
                  <div>
                    <h2 className="heading-style-h4" style={{ marginBottom: '1rem' }}>Showcase Projects</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: projects.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="card is-lighter_orange"
                          style={{
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {project.imageUrl && (
                            <img
                              src={project.imageUrl}
                              alt={project.projectName}
                              style={{
                                width: '100%',
                                height: '12rem',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>
                              {project.projectName}
                            </h3>
                            {project.role && (
                              <p style={{ color: 'rgb(255, 149, 0)', fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>
                                {project.role}
                              </p>
                            )}
                            <p style={{ color: '#555', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
                              {project.description}
                            </p>
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignSelf: 'flex-start',
                                marginTop: 'auto',
                                padding: '0.375rem 0.75rem',
                                border: '1px solid rgb(255, 149, 0)',
                                borderRadius: '0.375rem',
                                color: 'rgb(255, 149, 0)',
                                textDecoration: 'none',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                              }}
                            >
                              View Project
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="card is-lighter_orange is-sticky" style={{ padding: '1.5rem', borderRadius: '0.75rem' }}>
                <h3 className="heading-style-h4" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                  Pricing
                </h3>

                {hourlyRate && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Hourly Rate</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{hourlyRate}/hr</p>
                  </div>
                )}

                {projectRate && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Project Rate</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{projectRate}</p>
                  </div>
                )}

                {!hourlyRate && !projectRate && (
                  <p style={{ color: '#888', fontSize: '0.9375rem' }}>Rates available on request</p>
                )}

                <div style={{ borderTop: '1px solid #e5e5e5', margin: '1.25rem 0', paddingTop: '1.25rem' }}>
                  <ContactDesignerForm
                    designerName={fullName}
                    designerEmail={designer.email}
                    designerSlug={designer.slug}
                  >
                    <span
                      className="button w-button"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        width: '100%',
                      }}
                    >
                      Contact Designer
                    </span>
                  </ContactDesignerForm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer before footer */}
      <div style={{ paddingBottom: '4rem' }} />
    </>
  );
}
