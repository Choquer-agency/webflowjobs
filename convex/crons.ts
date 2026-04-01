import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Expire sponsorships daily at midnight UTC
crons.interval(
  "expire sponsorships",
  { hours: 24 },
  internal.sponsorship.expireExpiredSponsorships,
  {}
);

export default crons;
