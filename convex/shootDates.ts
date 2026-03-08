import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const list = query({
  args: { token: v.optional(v.string()), clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        return ctx.db.query("shootDates").withIndex("by_client", (q) => q.eq("clientId", user.clientId!)).collect();
      }
      // Admin/Editor: return all or filtered
      if (args.clientId) {
        return ctx.db.query("shootDates").withIndex("by_client", (q) => q.eq("clientId", args.clientId!)).collect();
      }
      return ctx.db.query("shootDates").collect();
    }
    // No token = no data
    return [];
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    clientId: v.id("clients"),
    ideaIds: v.array(v.id("ideas")),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { token: _, ...data } = args;
    return ctx.db.insert("shootDates", { ...data, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("shootDates"),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    ideaIds: v.optional(v.array(v.id("ideas"))),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { id, token: _, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { token: v.string(), id: v.id("shootDates") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.delete(args.id);
  },
});
