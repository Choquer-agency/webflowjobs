'use client';

import { useState } from 'react';
import Link from 'next/link';
import CountrySelect from './CountrySelect';

const OCCUPATION_OPTIONS = ['Designer', 'SEO', 'CRO', 'Google Ads', 'Other'];

function ThreePersonIcon() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Center person */}
      <circle cx="60" cy="24" r="12" fill="white" />
      <path d="M40 68 C40 52 80 52 80 68" fill="white" />
      {/* Left person */}
      <circle cx="28" cy="30" r="10" fill="white" opacity="0.7" />
      <path d="M12 66 C12 52 44 52 44 66" fill="white" opacity="0.7" />
      {/* Right person */}
      <circle cx="92" cy="30" r="10" fill="white" opacity="0.7" />
      <path d="M76 66 C76 52 108 52 108 66" fill="white" opacity="0.7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 24H34M34 24L26 16M34 24L26 32"
        stroke="rgb(255, 149, 0)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ActionCards() {
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [country, setCountry] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Subscription logic to be implemented
    console.log('Subscribe:', { email, occupation, country });
  };

  return (
    <section>
      <div className="padding-global">
        <div className="padding-section-medium">
          <div className="container-large" style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div
              className="grid-3c_layout is-bento"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: Post A Job */}
              <div
                style={{
                  backgroundColor: 'rgb(255, 149, 0)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '20rem',
                }}
              >
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Post A Job
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '1.5rem' }}>
                    It&apos;s Fast. It&apos;s Free.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <ThreePersonIcon />
                  </div>
                </div>
                <Link
                  href="/post-a-job"
                  className="button is-nav"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#fff',
                    color: 'rgb(255, 149, 0)',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Post A Job
                </Link>
              </div>

              {/* Card 2: Be Featured */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 149, 0, 0.08)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '20rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Be Featured As A Webflow Designer
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <ArrowIcon />
                  </div>
                </div>
                <Link
                  href="/join-the-community"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgb(255, 149, 0)',
                    color: '#fff',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Join The Community
                </Link>
              </div>

              {/* Card 3: Website Audit */}
              <div
                style={{
                  backgroundColor: 'rgb(255, 149, 0)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '20rem',
                }}
              >
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Get a Website Audit from the Experts Behind Webflow Jobs
                  </h3>
                </div>
                <a
                  href="#"
                  data-cal-link="brycechoquer/seo-audit-webflow-jobs"
                  data-cal-namespace="seo-audit-webflow-jobs"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#fff',
                    color: 'rgb(255, 149, 0)',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Schedule An Audit
                </a>
              </div>

              {/* Card 4: Subscribe (spans 2 columns) */}
              <div
                style={{
                  gridColumn: 'span 2',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Top card */}
                <div
                  className="is-signup"
                  style={{
                    padding: '2rem',
                    backgroundColor: 'rgba(255, 149, 0, 0.06)',
                  }}
                >
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Subscribe To New Jobs
                  </h3>
                  <p style={{ color: '#666' }}>
                    Get the latest Webflow job postings delivered straight to your inbox.
                  </p>
                </div>

                {/* Subscribe form */}
                <div style={{ padding: '2rem' }}>
                  <div className="subscribe_form-block">
                    <form className="subscribe_form" onSubmit={handleSubscribe}>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <input
                          type="email"
                          placeholder="Email address"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form_input is-subscribe"
                          style={{
                            flex: '1 1 200px',
                            padding: '0.75rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                          }}
                        />
                        <select
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="form_input is-select-input is-subscribe"
                          style={{
                            flex: '1 1 150px',
                            padding: '0.75rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            backgroundColor: '#fff',
                          }}
                        >
                          <option value="">Occupation</option>
                          {OCCUPATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <CountrySelect />
                        <button
                          type="submit"
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'rgb(255, 149, 0)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Sign Up
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Card 3 (audit) sits in row 1, subscribe sits in row 2 spanning 2 cols */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
