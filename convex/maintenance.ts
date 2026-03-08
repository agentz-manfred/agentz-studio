import { internalMutation } from "./_generated/server";

export const cleanupExpiredSessions = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const allSessions = await ctx.db.query("sessions").collect();
    let deleted = 0;
    for (const s of allSessions) {
      if (s.expiresAt < now) {
        await ctx.db.delete(s._id);
        deleted++;
      }
    }
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} expired sessions`);
    }
  },
});
