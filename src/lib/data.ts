import type { Job, Resource, Designer, DesignerProject } from "./types";
import resourcesData from "@/data/resources.json";
import jobsData from "@/data/jobs.json";

// ---------------------------------------------------------------------------
// Convex client (optional — falls back to local JSON if not configured)
// ---------------------------------------------------------------------------

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
let _convex: any = null;

async function getConvex() {
  if (!CONVEX_URL) return null;
  if (!_convex) {
    const { ConvexHttpClient } = await import("convex/browser");
    _convex = new ConvexHttpClient(CONVEX_URL);
  }
  return _convex;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortJobsDesc(list: Job[]): Job[] {
  return [...list].sort((a, b) => {
    // Sponsored jobs always come first
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}

function isWithin60Days(dateStr: string | null): boolean {
  if (!dateStr) return true;
  const published = new Date(dateStr);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  return published >= sixtyDaysAgo;
}

// ---------------------------------------------------------------------------
// Jobs (local JSON fallback)
// ---------------------------------------------------------------------------

const localJobs = (jobsData as Job[]);

/** Returns all published jobs (no date filter) sorted newest first. */
export async function getAllJobs(): Promise<Job[]> {
  const convex = await getConvex();
  if (convex) {
    try {
      const { api } = await import("@convex/_generated/api");
      const docs = await convex.query(api.jobs.listAllJobs, {});
      return sortJobsDesc(docs.map((doc: any) => convexDocToJob(doc)));
    } catch { /* fall through to JSON */ }
  }
  return sortJobsDesc(localJobs);
}

/** Returns only jobs published within the last 60 days, sorted newest first. */
export async function getJobs(): Promise<Job[]> {
  const convex = await getConvex();
  if (convex) {
    try {
      const { api } = await import("@convex/_generated/api");
      const docs = await convex.query(api.jobs.listRecentJobs, {});
      return sortJobsDesc(docs.map((doc: any) => convexDocToJob(doc)));
    } catch { /* fall through to JSON */ }
  }
  return sortJobsDesc(localJobs.filter((j) => isWithin60Days(j.publishedAt)));
}

/** Returns jobs older than 60 days, sorted newest first. */
export async function getArchivedJobs(): Promise<Job[]> {
  const all = await getAllJobs();
  return sortJobsDesc(all.filter((j) => !isWithin60Days(j.publishedAt)));
}

/** Find a single job by its URL slug. */
export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const convex = await getConvex();
  if (convex) {
    try {
      const { api } = await import("@convex/_generated/api");
      const doc = await convex.query(api.jobs.getBySlug, { slug });
      return doc ? convexDocToJob(doc) : undefined;
    } catch { /* fall through */ }
  }
  return localJobs.find((j) => j.slug === slug);
}

/** Return all jobs matching a given category (case-insensitive). */
export async function getJobsByCategory(category: string): Promise<Job[]> {
  const jobs = await getJobs();
  const lower = category.toLowerCase();
  return jobs.filter(
    (j) => j.category !== null && j.category.toLowerCase() === lower
  );
}

/** Return all jobs matching a given job type (case-insensitive). */
export async function getJobsByType(type: string): Promise<Job[]> {
  const jobs = await getJobs();
  const lower = type.toLowerCase();
  return jobs.filter(
    (j) => j.jobType !== null && j.jobType.toLowerCase() === lower
  );
}

/** Return all remote jobs (location contains "remote", case-insensitive). */
export async function getRemoteJobs(): Promise<Job[]> {
  const jobs = await getJobs();
  return jobs.filter(
    (j) => j.location !== null && j.location.toLowerCase().includes("remote")
  );
}

/** Return all jobs from a given company name. */
export async function getJobsByCompany(companyName: string): Promise<Job[]> {
  const jobs = await getAllJobs();
  return jobs.filter(
    (j) => j.companyName.toLowerCase() === companyName.toLowerCase()
  );
}

/** Return all unique companies with their job counts. */
export async function getCompanies(): Promise<Array<{ name: string; slug: string; logoUrl: string | null; jobCount: number }>> {
  const jobs = await getAllJobs();
  const map = new Map<string, { name: string; logoUrl: string | null; count: number }>();
  for (const j of jobs) {
    const existing = map.get(j.companyName);
    if (existing) {
      existing.count++;
    } else {
      map.set(j.companyName, { name: j.companyName, logoUrl: j.companyLogoUrl, count: 1 });
    }
  }
  return Array.from(map.values()).map((c) => ({
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    logoUrl: c.logoUrl,
    jobCount: c.count,
  }));
}

// ---------------------------------------------------------------------------
// Designers (Convex-only, returns empty if not configured)
// ---------------------------------------------------------------------------

/** Returns all approved designers, sponsored first. */
export async function getApprovedDesigners(): Promise<Designer[]> {
  const convex = await getConvex();
  if (!convex) return [];
  try {
    const { api } = await import("@convex/_generated/api");
    const docs = await convex.query(api.designers.listApprovedDesigners, {});
    return docs.map((doc: any) => convexDocToDesigner(doc));
  } catch {
    return [];
  }
}

/** Find a single approved designer by slug. */
export async function getDesignerBySlug(slug: string): Promise<Designer | undefined> {
  const convex = await getConvex();
  if (!convex) return undefined;
  try {
    const { api } = await import("@convex/_generated/api");
    const doc = await convex.query(api.designers.getBySlug, { slug });
    return doc ? convexDocToDesigner(doc) : undefined;
  } catch {
    return undefined;
  }
}

/** Return all showcase projects for a designer. */
export async function getDesignerProjects(designerId: string): Promise<DesignerProject[]> {
  const convex = await getConvex();
  if (!convex) return [];
  try {
    const { api } = await import("@convex/_generated/api");
    const docs = await convex.query(api.designers.getProjectsByDesignerId, {
      designerId: designerId as any,
    });
    return docs.map((doc: any) => ({
      id: doc._id,
      designerId: doc.designerId,
      projectName: doc.projectName,
      projectUrl: doc.projectUrl,
      imageUrl: doc.imageUrl ?? null,
      description: doc.description,
      role: doc.role ?? null,
      sortOrder: doc.sortOrder,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Resources (static JSON)
// ---------------------------------------------------------------------------

const resources = resourcesData as Resource[];

/** Returns all published resources sorted by publishedAt descending. */
export function getResources(): Resource[] {
  return [...resources].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}

/** Find a single resource by its URL slug. */
export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

// ---------------------------------------------------------------------------
// Convex doc → type converters
// ---------------------------------------------------------------------------

function convexDocToJob(doc: any): Job {
  const createdAt = new Date(doc._creationTime).toISOString();
  return {
    id: doc._id,
    title: doc.title,
    slug: doc.slug,
    companyName: doc.companyName,
    companyLogoUrl: doc.companyLogoUrl ?? null,
    aboutCompany: doc.aboutCompany ?? null,
    jobDescription: doc.jobDescription ?? null,
    category: doc.category ?? null,
    jobType: doc.jobType ?? null,
    location: doc.location ?? null,
    applyUrl: doc.applyUrl ?? null,
    isVerified: doc.isVerified ?? false,
    publishedAt: doc.publishedAt ?? null,
    createdAt,
    updatedAt: createdAt,
    isSponsored: doc.isSponsored ?? false,
    sponsoredUntil: doc.sponsoredUntil ?? null,
    companyDomain: doc.companyDomain ?? null,
  };
}

function convexDocToDesigner(doc: any): Designer {
  return {
    id: doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    slug: doc.slug,
    bio: doc.bio,
    profilePhotoUrl: doc.profilePhotoUrl ?? null,
    portfolioUrl: doc.portfolioUrl,
    country: doc.country,
    yearsExperience: doc.yearsExperience,
    specialties: doc.specialties,
    hourlyRateMin: doc.hourlyRateMin ?? null,
    hourlyRateMax: doc.hourlyRateMax ?? null,
    projectRateMin: doc.projectRateMin ?? null,
    projectRateMax: doc.projectRateMax ?? null,
    currency: doc.currency,
    linkedinUrl: doc.linkedinUrl ?? null,
    twitterUrl: doc.twitterUrl ?? null,
    dribbbleUrl: doc.dribbbleUrl ?? null,
    githubUrl: doc.githubUrl ?? null,
    isSponsored: doc.isSponsored ?? false,
    status: doc.status,
    submittedAt: doc.submittedAt,
  };
}
