import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const dev = new ConvexHttpClient("https://proficient-peacock-925.convex.cloud");
const prod = new ConvexHttpClient("https://determined-ptarmigan-458.convex.cloud");

const opt = (v) => (v === "" || v === undefined || v === null ? undefined : v);
const FEATURED = ["bryce-choquer", "johnny-nguyen"];

const prodAll = await prod.query(api.designers.listAllDesigners, {});
const prodByEmail = new Map(prodAll.map((d) => [d.email.toLowerCase(), d]));

for (const slug of FEATURED) {
  const d = await dev.query(api.designers.getBySlug, { slug });
  const projects = await dev.query(api.designers.getProjectsByDesignerId, { designerId: d._id });

  let prodId = prodByEmail.get(d.email.toLowerCase())?._id;
  if (prodId) {
    console.log(`• ${d.firstName} ${d.lastName} already in prod — refreshing profile`);
    await prod.mutation(api.designers.patchDesigner, {
      id: prodId,
      bio: d.bio,
      specialties: d.specialties,
      currency: d.currency,
    });
  } else {
    prodId = await prod.mutation(api.designers.submitDesignerApplication, {
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      bio: d.bio,
      profilePhotoUrl: opt(d.profilePhotoUrl),
      portfolioUrl: d.portfolioUrl,
      country: d.country,
      yearsExperience: String(d.yearsExperience ?? ""),
      specialties: d.specialties ?? [],
      hourlyRateMin: opt(d.hourlyRateMin),
      hourlyRateMax: opt(d.hourlyRateMax),
      projectRateMin: opt(d.projectRateMin),
      projectRateMax: opt(d.projectRateMax),
      currency: d.currency ?? "USD",
      linkedinUrl: opt(d.linkedinUrl),
      twitterUrl: opt(d.twitterUrl),
      dribbbleUrl: opt(d.dribbbleUrl),
      githubUrl: opt(d.githubUrl),
    });
    console.log(`✓ created ${d.firstName} ${d.lastName} in prod`);
  }

  // pricing (clears hourly for project-only profiles like Bryce)
  await prod.mutation(api.designers.setDesignerPricing, {
    id: prodId,
    hourlyRateMin: opt(d.hourlyRateMin),
    hourlyRateMax: opt(d.hourlyRateMax),
    projectRateMin: opt(d.projectRateMin),
    projectRateMax: opt(d.projectRateMax),
  });
  await prod.mutation(api.designers.updateDesignerStatus, { id: prodId, status: "approved" });

  // sync projects: wipe + re-add to match dev exactly
  const existing = await prod.query(api.designers.getProjectsByDesignerId, { designerId: prodId });
  for (const p of existing) await prod.mutation(api.designers.deleteDesignerProject, { id: p._id });
  for (const p of projects.sort((a, b) => a.sortOrder - b.sortOrder)) {
    await prod.mutation(api.designers.addDesignerProject, {
      designerId: prodId,
      projectName: p.projectName,
      projectUrl: p.projectUrl ?? "",
      imageUrl: opt(p.imageUrl),
      description: p.description,
      role: opt(p.role),
      sortOrder: p.sortOrder,
    });
  }
  console.log(`  ${d.firstName}: ${projects.length} projects synced`);
}

// approve the pending real submissions
const pending = (await prod.query(api.designers.listAllDesigners, {})).filter(
  (d) => d.status === "pending"
);
for (const d of pending) {
  await prod.mutation(api.designers.updateDesignerStatus, { id: d._id, status: "approved" });
  console.log(`✓ approved submission: ${d.firstName} ${d.lastName}`);
}

const approved = (await prod.query(api.designers.listAllDesigners, {})).filter(
  (d) => d.status === "approved"
).length;
console.log(`\nProd now has ${approved} approved designers live.`);
