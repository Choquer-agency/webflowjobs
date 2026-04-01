"use client";

import { useState } from "react";

interface SponsorClientProps {
  slug: string;
  jobId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  category: string | null;
  location: string | null;
  isSponsored: boolean;
}

const PLANS = [
  {
    id: "4-week" as const,
    name: "4-Week Spotlight",
    price: "$175",
    duration: "4 weeks",
    multiplier: "12x",
    description: "Pin your job to the top of all listings for 4 weeks",
    recommended: true,
  },
  {
    id: "1-week" as const,
    name: "1-Week Spotlight",
    price: "$75",
    duration: "1 week",
    multiplier: "4x",
    description: "Pin your job to the top of all listings for 1 week",
    recommended: false,
  },
];

export default function SponsorClient({
  slug,
  jobId,
  title,
  companyName,
  companyLogoUrl,
  category,
  location,
  isSponsored,
}: SponsorClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSponsor(plan: "4-week" | "1-week") {
    setLoading(plan);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, plan, jobId, companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to connect. Please try again.");
      setLoading(null);
    }
  }

  if (isSponsored) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '160px 20px 60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>Already Sponsored</h1>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.6 }}>
          This job listing is already sponsored and appears at the top of our job board.
        </p>
        <a
          href={`/jobs/${slug}`}
          style={{
            display: 'inline-block',
            marginTop: '24px',
            padding: '12px 28px',
            backgroundColor: 'rgb(255, 149, 0)',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          View Job Listing
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 20px 60px' }}>
      {/* Job info */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        {companyLogoUrl && (
          <img
            src={companyLogoUrl}
            alt={companyName}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }}
          />
        )}
        <h1 style={{ fontSize: '28px', margin: '0 0 8px', fontWeight: 700 }}>
          Sponsor Your Job Listing
        </h1>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          {title} at {companyName}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
          {category && (
            <span style={{ fontSize: '13px', color: '#888', backgroundColor: '#f5f5f5', padding: '4px 12px', borderRadius: '999px' }}>
              {category}
            </span>
          )}
          {location && (
            <span style={{ fontSize: '13px', color: '#888', backgroundColor: '#f5f5f5', padding: '4px 12px', borderRadius: '999px' }}>
              {location}
            </span>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div style={{
        background: '#FFF8F0',
        border: '1px solid #FFE0B2',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '20px', margin: '0 0 12px' }}>Why Sponsor?</h2>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
          Sponsored listings are pinned to the top of every page on Webflow.jobs,
          giving your job posting maximum visibility to qualified Webflow professionals.
        </p>
      </div>

      {/* Pricing cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: plan.recommended ? '2px solid rgb(255, 149, 0)' : '1px solid #eee',
              borderRadius: '12px',
              padding: '32px 24px',
              textAlign: 'center',
              position: 'relative',
              backgroundColor: '#fff',
            }}
          >
            {plan.recommended && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgb(255, 149, 0)',
                color: '#fff',
                padding: '4px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                BEST VALUE
              </span>
            )}
            <div style={{ fontSize: '40px', fontWeight: 700, color: plan.recommended ? 'rgb(255, 149, 0)' : '#333' }}>
              {plan.price}
            </div>
            <div style={{ fontSize: '15px', color: '#888', marginTop: '4px' }}>
              {plan.duration}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: plan.recommended ? 'rgb(255, 149, 0)' : '#555',
              marginTop: '12px',
            }}>
              {plan.multiplier} more views
            </div>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.5, margin: '12px 0 24px' }}>
              {plan.description}
            </p>
            <button
              onClick={() => handleSponsor(plan.id)}
              disabled={loading !== null}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: plan.recommended ? 'rgb(255, 149, 0)' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading && loading !== plan.id ? 0.5 : 1,
              }}
            >
              {loading === plan.id ? "Redirecting..." : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p style={{ color: '#e53e3e', textAlign: 'center', fontSize: '14px' }}>{error}</p>
      )}

      {/* Back link */}
      <p style={{ textAlign: 'center' }}>
        <a href={`/jobs/${slug}`} style={{ color: '#888', textDecoration: 'none', fontSize: '14px' }}>
          &larr; Back to job listing
        </a>
      </p>
    </div>
  );
}
