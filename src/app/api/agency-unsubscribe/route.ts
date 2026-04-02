import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { createHmac } from "crypto";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

function verifyToken(email: string, token: string): boolean {
  const secret = process.env.CHOQUER_HMAC_SECRET || "default-agency-secret";
  const expected = createHmac("sha256", secret).update(email).digest("hex");
  return token === expected;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");

  if (!email || !token) {
    return new Response(
      htmlPage("Invalid Link", "This unsubscribe link is invalid or expired."),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!verifyToken(email, token)) {
    return new Response(
      htmlPage("Invalid Link", "This unsubscribe link is invalid or expired."),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const convex = getConvexClient();
    await convex.mutation(api.agencyOutreach.addAgencyUnsubscribe, { email });

    return new Response(
      htmlPage(
        "Unsubscribed",
        `You've been unsubscribed from Choquer Agency emails at <strong>${email}</strong>. You will still receive Webflow.jobs notifications unless you unsubscribe from those separately.`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("Agency unsubscribe error:", err);
    return new Response(
      htmlPage("Error", "Something went wrong. Please try again later."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Choquer Agency</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f9f9f9;
      color: #333;
    }
    .card {
      background: #fff;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 420px;
    }
    h1 { margin: 0 0 16px; font-size: 24px; }
    p { color: #666; line-height: 1.6; margin: 0; }
    a { color: #1a1a1a; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p style="margin-top: 24px;"><a href="https://choquer.agency">Choquer Agency</a></p>
  </div>
</body>
</html>`;
}
