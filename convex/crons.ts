import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired sessions daily at 3:00 AM UTC
crons.daily(
  "cleanup-expired-sessions",
  { hourUTC: 3, minuteUTC: 0 },
  internal.maintenance.cleanupExpiredSessions
);

export default crons;
