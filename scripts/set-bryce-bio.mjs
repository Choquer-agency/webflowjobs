import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
const c = new ConvexHttpClient("https://proficient-peacock-925.convex.cloud");
const BRYCE = "jh79ytrdpnr0fhqyddp0y379g583zn6h";
const bio = `Founder of Futur Labs, where I design, build, and run AI agents, custom ERP, and software for teams that want production systems — not prototypes. I came up through Webflow design and development, shipping high-performance, pixel-perfect sites that convert, and I still bring that craft to everything I build.

Today my focus is the layer most studios don't touch: AI integrations, automations, and answer-engine optimization (AEO) — wiring tools together, automating the busywork, and turning Webflow front-ends into real, connected software. Whether it's a marketing site, a chatbot that actually qualifies leads, or a full custom ERP, I take projects from idea to shipped. If you want a partner who can build the whole thing, let's talk.`;
await c.mutation(api.designers.patchDesigner, { id: BRYCE, bio });
console.log("Bryce bio updated (" + bio.length + " chars)");
