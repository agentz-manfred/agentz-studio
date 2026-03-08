import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const listByClient = query({
  args: { clientId: v.id("clients"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    await authenticate(ctx, args.token);
    return ctx.db.query("categories").withIndex("by_client", (q) => q.eq("clientId", args.clientId)).collect();
  },
});

export const create = mutation({
  args: { token: v.string(), clientId: v.id("clients"), name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const existing = await ctx.db.query("categories").withIndex("by_client", (q) => q.eq("clientId", args.clientId)).collect();
    return ctx.db.insert("categories", {
      clientId: args.clientId,
      name: args.name,
      color: args.color,
      order: existing.length,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { token: v.string(), id: v.id("categories"), name: v.optional(v.string()), color: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { id, token: _, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
