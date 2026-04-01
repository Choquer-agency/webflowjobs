export interface Job {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  companyLogoUrl: string | null;
  aboutCompany: string | null;
  jobDescription: string | null;
  category: string | null;
  jobType: string | null;
  location: string | null;
  applyUrl: string | null;
  isVerified: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isSponsored?: boolean;
  sponsoredUntil?: string | null;
  companyDomain?: string | null;
}

export interface Designer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  slug: string;
  bio: string;
  profilePhotoUrl: string | null;
  portfolioUrl: string;
  country: string;
  yearsExperience: string;
  specialties: string[];
  hourlyRateMin: number | null;
  hourlyRateMax: number | null;
  projectRateMin: number | null;
  projectRateMax: number | null;
  currency: string;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  dribbbleUrl: string | null;
  githubUrl: string | null;
  isSponsored: boolean;
  status: string;
  submittedAt: string;
}

export interface DesignerProject {
  id: string;
  designerId: string;
  projectName: string;
  projectUrl: string;
  imageUrl: string | null;
  description: string;
  role: string | null;
  sortOrder: number;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  resourceType: string;
  content: string | null;
  thumbnailUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
