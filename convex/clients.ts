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
