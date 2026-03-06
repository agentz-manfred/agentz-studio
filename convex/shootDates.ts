import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    if (args.clientId) {
      return ctx.db
        .query("shootDates")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .collect();
    }
    return ctx.db.query("shootDates").collect();
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    ideaIds: v.array(v.id("ideas")),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("shootDates", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("shootDates"),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    ideaIds: v.optional(v.array(v.id("ideas"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("shootDates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
