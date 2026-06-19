// One-off: copy the 8 prod designer submissions into DEV Convex and approve
// them, so the local /designers page renders populated. DEV ONLY.
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "node:fs";

const DEV_URL = "https://proficient-peacock-925.convex.cloud";
const client = new ConvexHttpClient(DEV_URL);

const read = (p) =>
  fs.readFileSync(p, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));

const designers = read("/tmp/cvx_export/designers/documents.jsonl");
const projects = read("/tmp/cvx_export/designerProjects/documents.jsonl");

const projByDesigner = {};
for (const p of projects) (projByDesigner[p.designerId] ||= []).push(p);

const opt = (v) => (v === "" || v === undefined || v === null ? undefined : v);

let imported = 0,
  skipped = 0,
  proj = 0;

for (const d of designers) {
  try {
    const newId = await client.mutation(api.designers.submitDesignerApplication, {
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

    await client.mutation(api.designers.updateDesignerStatus, {
      id: newId,
      status: "approved",
    });

    for (const p of projByDesigner[d._id] ?? []) {
      await client.mutation(api.designers.addDesignerProject, {
        designerId: newId,
        projectName: p.projectName,
        projectUrl: p.projectUrl,
        imageUrl: opt(p.imageUrl),
        description: p.description,
        role: opt(p.role),
        sortOrder: p.sortOrder ?? 0,
      });
      proj++;
    }

    imported++;
    console.log(`✓ ${d.firstName} ${d.lastName} (approved)`);
  } catch (e) {
    skipped++;
    console.log(`– skipped ${d.firstName} ${d.lastName}: ${e.message?.split("\n")[0]}`);
  }
}

console.log(`\nDone. Imported ${imported}, skipped ${skipped}, projects ${proj}.`);
