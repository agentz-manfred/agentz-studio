import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate } from "./lib";

// Internal — called from other mutations, not from frontend
export const log = internalMutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    entityName: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
    entityType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    if (user.role !== "admin") return [];

    let logs = await ctx.db.query("auditLogs").order("desc").collect();

    if (args.entityType) {
      logs = logs.filter((l) => l.entityType === args.entityType);
    }
    if (args.userId) {
      logs = logs.filter((l) => l.userId === args.userId);
    }

    return logs.slice(0, args.limit || 100);
  },
});
