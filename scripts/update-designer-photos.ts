import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function updatePhotos() {
  const designers = await convex.query(api.designers.listApprovedDesigners, {});

  for (const d of designers) {
    if (d.firstName === "Bryce" && d.lastName === "Choquer") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        profilePhotoUrl: "/designers/bryce-choquer.jpg",
      });
      console.log("Updated Bryce's photo");
    }
    if (d.firstName === "Johnny" && d.lastName === "Nguyen") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        profilePhotoUrl: "/designers/johnny-nguyen.jpg",
      });
      console.log("Updated Johnny's photo");
    }
  }
  console.log("Done!");
}

updatePhotos().catch(console.error);
