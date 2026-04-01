'use client';

import { useState, useMemo, useCallback } from 'react';
import JobFilter from './JobFilter';
import JobCard, { type Job } from './JobCard';

interface JobListingsSectionProps {
  jobs: Job[];
}

export default function JobListingsSection({ jobs }: JobListingsSectionProps) {
  const [filters, setFilters] = useState({ category: 'All', type: 'All' });

  const handleFilterChange = useCallback((newFilters: { category: string; type: string }) => {
    setFilters(newFilters);
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const categoryMatch =
        filters.category === 'All' ||
        job.category.toLowerCase() === filters.category.toLowerCase();
      const typeMatch =
        filters.type === 'All' ||
        job.jobType.toLowerCase() === filters.type.toLowerCase();
      return categoryMatch && typeMatch;
    });
  }, [jobs, filters]);

  return (
    <section>
      <div className="padding-global">
        <div className="padding-section-medium">
          <div className="container-large" style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div
              className="h-wrap space-between"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h2 style={{ margin: 0 }}>Latest Webflow Job Postings</h2>
              <JobFilter onFilterChange={handleFilterChange} currentFilters={filters} />
            </div>
            <div
              className="posting_list"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => <JobCard key={job.slug} job={job} />)
              ) : (
                <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                  No jobs match the selected filters.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
