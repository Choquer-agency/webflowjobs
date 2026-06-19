// One-off DEV edit: tidy up Bryce + Johnny designer profiles for preview.
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://proficient-peacock-925.convex.cloud");
const shot = (u) => `https://image.thum.io/get/width/1200/crop/675/noanimate/${u}`;

const BRYCE = "jh79ytrdpnr0fhqyddp0y379g583zn6h";
const JOHNNY = "jh75gye6tvcc545s88af2yfr3983z4s2";

async function clearProjects(designerId) {
  const projects = await client.query(api.designers.getProjectsByDesignerId, { designerId });
  for (const p of projects) {
    await client.mutation(api.designers.deleteDesignerProject, { id: p._id });
  }
  return projects.length;
}

async function addProjects(designerId, list) {
  let i = 0;
  for (const p of list) {
    await client.mutation(api.designers.addDesignerProject, {
      designerId,
      projectName: p.name,
      projectUrl: p.url ?? "",
      imageUrl: p.image,
      description: p.description,
      role: p.role,
      sortOrder: i++,
    });
  }
}

// ---- BRYCE ----
await client.mutation(api.designers.patchDesigner, {
  id: BRYCE,
  currency: "USD",
  specialties: [
    "AI Integrations",
    "Automations",
    "AEO Specialist",
    "Software Developer",
    "Figma to Webflow",
    "Custom Code",
    "CMS Development",
    "Responsive Design",
    "AI Chatbots & Agents",
  ],
});
// Project-based only, $1,500+ (clears hourly)
await client.mutation(api.designers.setDesignerPricing, { id: BRYCE, projectRateMin: 1500 });

const bryceCleared = await clearProjects(BRYCE);
await addProjects(BRYCE, [
  {
    name: "Annatype",
    url: "https://www.annatype.io/",
    image: shot("https://www.annatype.io/"),
    role: "AI Product — Design & Build",
    description:
      "AI-powered voice dictation for macOS & Windows. Press a shortcut, speak naturally, and watch polished text appear anywhere you type.",
  },
  {
    name: "Ask Flik",
    url: "https://www.askflik.com",
    image: undefined,
    role: "SaaS — Design & Build",
    description:
      "A conversational-video platform that replaces the static contact form with a branching, on-site video conversation. It qualifies leads automatically, feels personable, and drives up to 9× the engagement of a traditional form — built for coaches, creators, agencies, and recruiters, and embeds anywhere with one line of script.",
  },
  {
    name: "Futur Labs",
    url: "https://futurlabs.agency",
    image: shot("https://futurlabs-fowd1lo4k-ollie-3652d4db.vercel.app/"),
    role: "Founder — AI Agency",
    description:
      "My agency. We design, build, and run AI agents, custom ERP, and software for teams that want production systems — not prototypes. Real engineers, real shipped products.",
  },
  {
    name: "Reliable ERP",
    url: "",
    image: undefined,
    role: "Custom ERP — Full-stack Build",
    description:
      "A custom ERP for a forklift-training company — session scheduling, certification tracking, CRM, daily roster, inspections, invoicing, and card orders, all in one system.",
  },
]);

// ---- JOHNNY ----
const johnnyProjects = await client.query(api.designers.getProjectsByDesignerId, {
  designerId: JOHNNY,
});
// Drop the placeholder, keep his real ones
for (const p of johnnyProjects) {
  if (/e-commerce brand launch/i.test(p.projectName)) {
    await client.mutation(api.designers.deleteDesignerProject, { id: p._id });
  }
}
const johnnyStart = johnnyProjects.filter((p) => !/e-commerce brand launch/i.test(p.projectName)).length;
let ji = johnnyStart;
for (const p of [
  {
    name: "Century Plaza",
    url: "https://www.century-plaza.com/",
    image: shot("https://www.century-plaza.com/"),
    role: "Webflow Design & Development",
    description:
      "Official website for Century Plaza, a downtown Vancouver hotel — a polished, conversion-focused hospitality site with rooms, offers, and direct booking.",
  },
  {
    name: "Brookswood Notary",
    url: "https://brookswoodnotaries.ca",
    image: shot("https://brookswoodnotaries.ca"),
    role: "Webflow Design & Development",
    description:
      "Website for Brookswood Notary in Langley — trusted notary services for real estate, affidavits, and legal documents, built to convert local search into appointments.",
  },
  {
    name: "Penni Cart",
    url: "https://www.pennicart.io",
    image: shot("https://www.pennicart.io"),
    role: "Webflow Ecommerce",
    description:
      "A new way to do Webflow ecommerce — manage products with the CMS you already know and build a store that's uniquely yours in minutes.",
  },
]) {
  await client.mutation(api.designers.addDesignerProject, {
    designerId: JOHNNY,
    projectName: p.name,
    projectUrl: p.url,
    imageUrl: p.image,
    description: p.description,
    role: p.role,
    sortOrder: ji++,
  });
}

console.log(`Bryce: specialties + $1,500+/project set, cleared ${bryceCleared} old projects, added 4.`);
console.log(`Johnny: added 3 projects (kept his existing real ones).`);
