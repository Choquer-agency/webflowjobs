'use client';

import { useState, useMemo } from 'react';
import type { Designer } from '@/lib/types';
import DesignerCard from './DesignerCard';

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5+ years',
];

export default function DesignerFilterClient({ designers }: { designers: Designer[] }) {
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [country, setCountry] = useState('');

  // Derive unique values for filters
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    designers.forEach((d) => d.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [designers]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    designers.forEach((d) => set.add(d.country));
    return Array.from(set).sort();
  }, [designers]);

  const filtered = useMemo(() => {
    return designers.filter((d) => {
      if (specialty && !d.specialties.includes(specialty)) return false;
      if (experience && d.yearsExperience !== experience) return false;
      if (country && d.country !== country) return false;
      return true;
    });
  }, [designers, specialty, experience, country]);

  const hasFilters = specialty || experience || country;

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <div className="select-wrapper pl-0" style={{ minWidth: '10rem' }}>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="form_input is-select-input is-apply w-select"
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Specialties</option>
            {allSpecialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="icon w-icon-dropdown-toggle"></div>
        </div>

        <div className="select-wrapper pl-0" style={{ minWidth: '10rem' }}>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="form_input is-select-input is-apply w-select"
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Experience</option>
            {EXPERIENCE_OPTIONS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <div className="icon w-icon-dropdown-toggle"></div>
        </div>

        <div className="select-wrapper pl-0" style={{ minWidth: '10rem' }}>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="form_input is-select-input is-apply w-select"
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Countries</option>
            {allCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="icon w-icon-dropdown-toggle"></div>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSpecialty(''); setExperience(''); setCountry(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgb(255, 149, 0)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1.5rem' }}>
        {filtered.length} designer{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {filtered.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>No designers found</p>
          <p style={{ fontSize: '0.875rem' }}>
            {hasFilters ? 'Try adjusting your filters.' : 'Check back soon as new designers join the directory.'}
          </p>
        </div>
      )}
    </>
  );
}
