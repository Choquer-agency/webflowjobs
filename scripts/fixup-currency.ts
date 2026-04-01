import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function fixup() {
  const designers = await convex.query(api.designers.listApprovedDesigners, {});
  for (const d of designers) {
    if (d.currency !== "USD") {
      await convex.mutation(api.designers.patchDesigner, {
        id: d._id,
        currency: "USD",
      });
      console.log(`Updated ${d.firstName} ${d.lastName}: ${d.currency} -> USD`);
    }
  }
  console.log("Done!");
}

fixup().catch(console.error);
