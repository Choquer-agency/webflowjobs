import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://proficient-peacock-925.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function seed() {
  console.log("Seeding designers...\n");

  // 1. Bryce Choquer - Sponsored, owner of Choquer Agency
  const bryceId = await convex.mutation(api.designers.submitDesignerApplication, {
    firstName: "Bryce",
    lastName: "Choquer",
    email: "bryce@choquer.agency",
    bio: "Founder of Choquer Agency, a full-service Webflow design and development studio. I specialize in building high-performance, pixel-perfect websites that convert. With 5+ years of Webflow experience, I've helped dozens of startups and established brands bring their digital presence to the next level. Passionate about clean design, fast load times, and creating websites that actually drive results.",
    profilePhotoUrl: "https://cdn.prod.website-files.com/6593beda0896061f8a8a8997/6593d2e8fbb1ee5dca5e3ed2_Frame%20427320974-p-500.png",
    portfolioUrl: "https://www.choquer.agency/",
    country: "CA",
    yearsExperience: "5+ years",
    specialties: ["Animations/Interactions", "E-commerce", "CMS Development", "Custom Code", "Figma to Webflow", "Responsive Design"],
    hourlyRateMin: 100,
    hourlyRateMax: 175,
    projectRateMin: 3000,
    projectRateMax: 25000,
    currency: "USD",
    linkedinUrl: "https://www.linkedin.com/in/brycechoquer/",
    twitterUrl: "https://x.com/brycechoquer",
    dribbbleUrl: undefined,
    githubUrl: undefined,
  });
  console.log("Created Bryce Choquer:", bryceId);

  // Add Bryce's projects
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: bryceId,
    projectName: "Choquer Agency Website",
    projectUrl: "https://www.choquer.agency/",
    description: "Designed and developed the agency's own website in Webflow, featuring smooth scroll animations, a dynamic project showcase, and a fully responsive layout. Built to demonstrate our capabilities and convert visitors into leads.",
    role: "Lead Designer & Developer",
    sortOrder: 0,
  });
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: bryceId,
    projectName: "Webflow Jobs Platform",
    projectUrl: "https://www.webflow.jobs/",
    description: "Built a job board platform connecting Webflow professionals with companies hiring for design and development roles. Features automated job ingestion, category filtering, and a clean browsing experience optimized for conversions.",
    role: "Founder & Full-Stack Developer",
    sortOrder: 1,
  });

  // Approve + Sponsor Bryce
  await convex.mutation(api.designers.updateDesignerStatus, { id: bryceId, status: "approved" });
  await convex.mutation(api.designers.setSponsored, { id: bryceId, isSponsored: true, sponsoredUntil: "2027-03-31T00:00:00.000Z" });
  console.log("Bryce approved + sponsored\n");

  // 2. Johnny Nguyen - Conquer the Crowns
  const johnnyId = await convex.mutation(api.designers.submitDesignerApplication, {
    firstName: "Johnny",
    lastName: "Nguyen",
    email: "johnny@conquerthecrowns.com",
    bio: "Creative designer and Webflow developer behind Conquer the Crowns. I focus on crafting bold, visually striking websites that stand out from the crowd. My approach combines strong brand identity with technical Webflow development to deliver sites that look incredible and perform even better. Always pushing the boundaries of what's possible in Webflow.",
    profilePhotoUrl: "https://cdn.prod.website-files.com/67f0b37495c81cc40dbeb597/67f0b65b0ac44449b3e5baee_johnny-p-500.jpg",
    portfolioUrl: "https://www.conquerthecrowns.com/",
    country: "CA",
    yearsExperience: "3-5 years",
    specialties: ["Animations/Interactions", "Figma to Webflow", "Responsive Design", "Custom Code", "CMS Development"],
    hourlyRateMin: 75,
    hourlyRateMax: 125,
    projectRateMin: 2000,
    projectRateMax: 15000,
    currency: "USD",
    linkedinUrl: "https://www.linkedin.com/in/johnny-nguyen/",
    twitterUrl: undefined,
    dribbbleUrl: undefined,
    githubUrl: undefined,
  });
  console.log("Created Johnny Nguyen:", johnnyId);

  // Add Johnny's projects
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: johnnyId,
    projectName: "Conquer the Crowns",
    projectUrl: "https://www.conquerthecrowns.com/",
    description: "Built a creative portfolio and brand website showcasing design work and services. Features bold typography, smooth animations, and a cohesive visual identity that captures the brand's energy.",
    role: "Designer & Webflow Developer",
    sortOrder: 0,
  });
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: johnnyId,
    projectName: "E-commerce Brand Launch",
    projectUrl: "https://www.conquerthecrowns.com/",
    description: "Designed and developed a Webflow e-commerce store for a lifestyle brand, complete with product filtering, cart functionality, and a checkout flow optimized for mobile conversions.",
    role: "Webflow Developer",
    sortOrder: 1,
  });

  // Approve Johnny
  await convex.mutation(api.designers.updateDesignerStatus, { id: johnnyId, status: "approved" });
  console.log("Johnny approved\n");

  // 3. Random designer - Sofia Martinez
  const sofiaId = await convex.mutation(api.designers.submitDesignerApplication, {
    firstName: "Sofia",
    lastName: "Martinez",
    email: "sofia@sofiamartinez.design",
    bio: "Independent Webflow designer based in Barcelona, specializing in clean, modern websites for SaaS startups and creative agencies. I believe great design is invisible — it just works. With a background in UX research, I bring a user-first mindset to every project, ensuring that beautiful design is backed by real usability. I love working with founders who care about the details.",
    profilePhotoUrl: undefined,
    portfolioUrl: "https://sofiamartinez.design",
    country: "ES",
    yearsExperience: "3-5 years",
    specialties: ["Responsive Design", "Figma to Webflow", "SEO", "CMS Development", "Localization"],
    hourlyRateMin: 60,
    hourlyRateMax: 100,
    projectRateMin: 1500,
    projectRateMax: 8000,
    currency: "EUR",
    linkedinUrl: "https://www.linkedin.com/in/sofiamartinez/",
    twitterUrl: "https://x.com/sofiadesigns",
    dribbbleUrl: "https://dribbble.com/sofiamartinez",
    githubUrl: undefined,
  });
  console.log("Created Sofia Martinez:", sofiaId);

  // Add Sofia's projects
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: sofiaId,
    projectName: "CloudSync Landing Page",
    projectUrl: "https://sofiamartinez.design",
    description: "Designed and built a conversion-focused landing page for a B2B SaaS startup. Implemented scroll-triggered animations, an interactive pricing table, and multilingual support with Webflow's localization features.",
    role: "Lead Designer",
    sortOrder: 0,
  });
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: sofiaId,
    projectName: "Nomad Studio Website",
    projectUrl: "https://sofiamartinez.design",
    description: "Full website redesign for a creative agency, including a CMS-powered case studies section, team profiles, and a blog. Focused on page speed optimization, achieving a 95+ Lighthouse score.",
    role: "Webflow Developer & UX Designer",
    sortOrder: 1,
  });
  await convex.mutation(api.designers.addDesignerProject, {
    designerId: sofiaId,
    projectName: "Vino Español E-commerce",
    projectUrl: "https://sofiamartinez.design",
    description: "Built a bilingual (Spanish/English) e-commerce site for a boutique wine brand using Webflow's native e-commerce and localization features. Handled everything from product photography layout to checkout optimization.",
    role: "Designer & Developer",
    sortOrder: 2,
  });

  // Approve Sofia
  await convex.mutation(api.designers.updateDesignerStatus, { id: sofiaId, status: "approved" });
  console.log("Sofia approved\n");

  console.log("Done! 3 designers seeded successfully.");
}

seed().catch(console.error);
