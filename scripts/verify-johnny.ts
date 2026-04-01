import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function run() {
  const designers = await convex.query(api.designers.listApprovedDesigners, {});
  const johnny = designers.find((d) => d.firstName === "Johnny");
  if (johnny) {
    await convex.mutation(api.designers.setSponsored, {
      id: johnny._id,
      isSponsored: true,
      sponsoredUntil: "2027-03-31T00:00:00.000Z",
    });
    console.log("Johnny is now sponsored/verified!");
  }
}

run().catch(console.error);
