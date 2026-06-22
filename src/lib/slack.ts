/**
 * Post a message to the Webflow.jobs Slack channel via incoming webhook.
 * No-ops silently if SLACK_WEBHOOK_URL isn't configured, and never throws —
 * notifications must never break the request that triggered them.
 */
export async function notifySlack(
  text: string,
  blocks?: unknown[],
): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blocks ? { text, blocks } : { text }),
    });
  } catch (err) {
    console.error("Slack notification failed:", err);
  }
}

/** Build a simple section block from markdown text. */
export function section(markdown: string) {
  return { type: "section", text: { type: "mrkdwn", text: markdown } };
}

export function context(markdown: string) {
  return {
    type: "context",
    elements: [{ type: "mrkdwn", text: markdown }],
  };
}
