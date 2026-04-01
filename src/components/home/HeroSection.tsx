import HeroGridAnimation from './HeroGridAnimation';

export default function HeroSection() {
  return (
    <HeroGridAnimation>
      <section className="section_hero min-100vh">
        <div className="padding-global">
          <div className="padding-section-large">
            <div className="container-large-4" style={{ maxWidth: '75rem', margin: '0 auto' }}>
              <div
                className="max-width-xmedium"
                style={{ maxWidth: '55rem', margin: '0 auto', textAlign: 'center' }}
              >
                <h1 className="hero-h1 pointer-off">
                  Webflow Jobs helps you find opportunities where you can succeed
                </h1>
                <div
                  className="hero-logo-strip"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    marginTop: '2.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Placeholder slots for company/trust logos loaded from CDN */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="hero-logo"
                      style={{
                        width: '7rem',
                        height: '2rem',
                        borderRadius: '0.25rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.06)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="bg-overlay"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8rem',
            background: 'linear-gradient(to top, white, transparent)',
            pointerEvents: 'none',
          }}
        />
      </section>
    </HeroGridAnimation>
  );
}
