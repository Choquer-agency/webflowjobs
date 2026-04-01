import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function fixup() {
  const designers = await convex.query(api.designers.listApprovedDesigners, {});

  for (const d of designers) {
    const cleanSlug = `${d.firstName}-${d.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Fix slug
    if (d.slug !== cleanSlug) {
      await convex.mutation(api.designers.patchDesigner, { id: d._id, slug: cleanSlug });
      console.log(`Fixed slug: ${d.slug} -> ${cleanSlug}`);
    }

    // Fix Bryce's rates
    if (d.firstName === "Bryce" && d.lastName === "Choquer") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        hourlyRateMin: 300,
        hourlyRateMax: 300,
        projectRateMin: 3000,
        projectRateMax: 25000,
      });
      console.log("Fixed Bryce's rates: $300/hr flat, $3,000-$25,000 project");
    }

    // Fix project descriptions (shorten to 1 sentence) and add images
    const projects = await convex.query(api.designers.getProjectsByDesignerId, { designerId: d._id });

    for (const p of projects) {
      let newDesc: string | undefined;
      let imageUrl: string | undefined;

      // Bryce's projects
      if (d.firstName === "Bryce") {
        if (p.projectName === "Choquer Agency Website") {
          newDesc = "Full agency website built in Webflow featuring scroll animations, dynamic project showcase, and conversion-optimized design.";
          imageUrl = "https://cdn.prod.website-files.com/6593beda0896061f8a8a8997/659f6c48f0c5fb6b35e120df_og-image.jpg";
        } else if (p.projectName === "Webflow Jobs Platform") {
          newDesc = "Job board connecting Webflow professionals with companies, featuring automated job ingestion and smart category filtering.";
          imageUrl = "https://cdn.prod.website-files.com/680f28a95df3e17a47898e28/681b2a7d9b08b700ee26a6fe_opengraph.png";
        }
      }
      // Johnny's projects
      else if (d.firstName === "Johnny") {
        if (p.projectName === "Conquer the Crowns") {
          newDesc = "Creative portfolio and brand website with bold typography, smooth animations, and a cohesive visual identity.";
          imageUrl = "https://cdn.prod.website-files.com/67f0b37495c81cc40dbeb597/67f0cd2e72e35b5fc68dbdfe_Open%20Graph%20Image-p-1600.png";
        } else if (p.projectName === "E-commerce Brand Launch") {
          newDesc = "Webflow e-commerce store for a lifestyle brand with product filtering, cart functionality, and mobile-optimized checkout.";
          imageUrl = "https://cdn.prod.website-files.com/67f0b37495c81cc40dbeb597/67f0cd2e72e35b5fc68dbdfe_Open%20Graph%20Image-p-1600.png";
        }
      }
      // Sofia's projects
      else if (d.firstName === "Sofia") {
        if (p.projectName === "CloudSync Landing Page") {
          newDesc = "Conversion-focused SaaS landing page with scroll animations, interactive pricing, and multilingual support.";
        } else if (p.projectName === "Nomad Studio Website") {
          newDesc = "Full website redesign for a creative agency with CMS-powered case studies and a 95+ Lighthouse score.";
        } else if (p.projectName.includes("Vino")) {
          newDesc = "Bilingual e-commerce site for a boutique wine brand using Webflow's native e-commerce and localization.";
        }
      }

      if (newDesc || imageUrl) {
        await convex.mutation(api.designers.patchDesignerProject, {
          id: p._id as any,
          ...(newDesc ? { description: newDesc } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        });
        console.log(`  Updated project: ${p.projectName}`);
      }
    }
  }

  console.log("\nAll fixups done!");
}

fixup().catch(console.error);
