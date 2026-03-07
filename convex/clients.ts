import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return ctx.db.query("clients").collect();
  },
});

export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("clients", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    contractStart: v.optional(v.string()),
    contractEnd: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    mainPlatform: v.optional(v.string()),
    videosPerMonth: v.optional(v.number()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Client not found");
    await ctx.db.patch(id, updates);
    return id;
  },
});
