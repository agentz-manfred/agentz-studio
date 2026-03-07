import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const STATUSES = [
  "idee",
  "skript",
  "freigabe",
  "korrektur",
  "freigegeben",
  "gedreht",
  "geschnitten",
  "review",
  "veröffentlicht",
] as const;

export const list = query({
  args: { clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    if (args.clientId) {
      return ctx.db
        .query("ideas")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
        .collect();
    }
    return ctx.db.query("ideas").collect();
  },
});

export const get = query({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.ideaId);
  },
});

export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("ideas")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ideas")
      .withIndex("by_status", (q) => q.eq("status", "idee"))
      .collect();

    return ctx.db.insert("ideas", {
      clientId: args.clientId,
      title: args.title,
      description: args.description,
      status: "idee",
      order: existing.length,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    ideaId: v.id("ideas"),
    status: v.string(),
    userId: v.id("users"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idee nicht gefunden");

    await ctx.db.insert("statusUpdates", {
      ideaId: args.ideaId,
      fromStatus: idea.status,
      toStatus: args.status,
      userId: args.userId,
      note: args.note,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.ideaId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    ideaId: v.id("ideas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const { ideaId, ...updates } = args;
    await ctx.db.patch(ideaId, { ...updates, updatedAt: Date.now() });
  },
});
