import type { MetadataRoute } from 'next';

// AI / answer-engine crawlers we explicitly welcome so webflow.jobs content
// is eligible for citation in ChatGPT, Claude, Perplexity, Google AI, etc.
const AI_CRAWLERS = [
  'GPTBot', // OpenAI training
  'OAI-SearchBot', // ChatGPT search
  'ChatGPT-User', // ChatGPT browsing
  'ClaudeBot', // Anthropic
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended', // Gemini / AI Overviews
  'Applebot-Extended',
  'CCBot', // Common Crawl (feeds many LLMs)
  'cohere-ai',
  'Bingbot', // Copilot is fed by the Bing index
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      // Explicitly allow each AI crawler full access.
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: 'https://www.webflow.jobs/sitemap.xml',
    host: 'https://www.webflow.jobs',
  };
}
