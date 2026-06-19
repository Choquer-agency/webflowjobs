import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
const c = new ConvexHttpClient("https://proficient-peacock-925.convex.cloud");
const BRYCE = "jh79ytrdpnr0fhqyddp0y379g583zn6h";
const map = {
  "Ask Flik": "/project-images/ask-flik.png",
  "Futur Labs": "/project-images/futur-labs.png",
  "Reliable ERP": "/project-images/reliable-erp.png",
};
const projects = await c.query(api.designers.getProjectsByDesignerId, { designerId: BRYCE });
for (const p of projects) {
  if (map[p.projectName]) {
    await c.mutation(api.designers.patchDesignerProject, { id: p._id, imageUrl: map[p.projectName] });
    console.log("set image for", p.projectName, "->", map[p.projectName]);
  }
}
