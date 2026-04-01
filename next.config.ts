import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploads-ssl.webflow.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "d3e54v103j8qbb.cloudfront.net",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/detail_job-postings/:slug",
        destination: "/jobs/:slug",
        permanent: true,
      },
      {
        source: "/detail_resources/:slug",
        destination: "/resources/:slug",
        permanent: true,
      },
      {
        source: "/detail_comapnies/:slug",
        destination: "/companies/:slug",
        permanent: true,
      },
      {
        source: "/resources-blog",
        destination: "/resources",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
