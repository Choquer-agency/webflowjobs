import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dest = url.searchParams.get("dest");
  const linkType = url.searchParams.get("t");
  const companyName = url.searchParams.get("cn");
  const companyDomain = url.searchParams.get("cd");
  const jobSlug = url.searchParams.get("js");

  // Always redirect even if logging fails
  const redirectUrl = dest || "https://choquer.agency";

  if (linkType && companyName && companyDomain && jobSlug) {
    try {
      const convex = getConvexClient();
      await convex.mutation(api.reporting.logClick, {
        linkType,
        companyName,
        companyDomain,
        jobSlug,
      });
    } catch (err) {
      console.error("Click tracking error:", err);
    }
  }

  return Response.redirect(redirectUrl, 302);
}
