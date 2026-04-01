'use client';

import { useCallback } from 'react';

const OCCUPATION_OPTIONS = ['All', 'Designer', 'SEO', 'CRO', 'Google Ads', 'Other'];
const TYPE_OPTIONS = ['All', 'Full-time', 'Part-time', 'Freelance', 'Contract'];

interface JobFilterProps {
  onFilterChange: (filters: { category: string; type: string }) => void;
  currentFilters: { category: string; type: string };
}

export default function JobFilter({ onFilterChange, currentFilters }: JobFilterProps) {
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ ...currentFilters, category: e.target.value });
    },
    [onFilterChange, currentFilters]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({ ...currentFilters, type: e.target.value });
    },
    [onFilterChange, currentFilters]
  );

  return (
    <form
      className="posting_filter-form"
      style={{ display: 'flex', gap: '1.5rem' }}
      onSubmit={(e) => e.preventDefault()}
    >
      <select
        className="filter_select"
        value={currentFilters.category}
        onChange={handleCategoryChange}
      >
        {OCCUPATION_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? 'All Occupations' : opt}
          </option>
        ))}
      </select>
      <select
        className="filter_select"
        value={currentFilters.type}
        onChange={handleTypeChange}
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? 'All Types' : opt}
          </option>
        ))}
      </select>
    </form>
  );
}
