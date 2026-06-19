import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
const c = new ConvexHttpClient("https://proficient-peacock-925.convex.cloud");
const BRYCE = "jh79ytrdpnr0fhqyddp0y379g583zn6h";
const projects = await c.query(api.designers.getProjectsByDesignerId, { designerId: BRYCE });
const fl = projects.find((p) => p.projectName === "Futur Labs");
await c.mutation(api.designers.patchDesignerProject, { id: fl._id, projectUrl: "https://futurlabs.dev" });
console.log("Futur Labs URL -> https://futurlabs.dev");
