import type { MetadataRoute } from 'next';
import { getJobs, getResources } from '@/lib/data';

const BASE_URL = 'https://www.webflow.jobs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, resources] = await Promise.all([getJobs(), getResources()]);

  const categorySlugs = [
    'webflow-developer',
    'designer',
    'seo',
    'cro',
    'google-ads',
    'remote',
    'freelance',
    'full-time',
    'part-time',
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/post-a-job`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/join-the-community`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/hire-webflow-developer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...categorySlugs.map((slug) => ({
      url: `${BASE_URL}/jobs/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: new Date(job.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${BASE_URL}/resources/${resource.slug}`,
    lastModified: new Date(resource.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...jobRoutes, ...resourceRoutes];
}
