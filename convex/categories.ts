import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("categories")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    return ctx.db.insert("categories", {
      ...args,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
