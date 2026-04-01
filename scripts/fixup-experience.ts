import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function fixup() {
  const designers = await convex.query(api.designers.listApprovedDesigners, {});

  for (const d of designers) {
    if (d.firstName === "Bryce" && d.lastName === "Choquer") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        yearsExperience: "8 years",
        specialties: [
          "Animations/Interactions",
          "E-commerce",
          "CMS Development",
          "Custom Code",
          "Figma to Webflow",
          "Responsive Design",
          "AI Development",
          "AI Automation",
          "AI Chatbots & Agents",
        ],
      });
      console.log("Updated Bryce: 8 years + AI specialties");
    }

    if (d.firstName === "Johnny" && d.lastName === "Nguyen") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        yearsExperience: "6 years",
      });
      console.log("Updated Johnny: 6 years");
    }

    if (d.firstName === "Sofia" && d.lastName === "Martinez") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        yearsExperience: "3 years",
      });
      console.log("Updated Sofia: 3 years");
    }
  }

  console.log("Done!");
}

fixup().catch(console.error);
