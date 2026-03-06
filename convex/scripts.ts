import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByIdea = query({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("scripts")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
  },
});

export const create = mutation({
  args: {
    ideaId: v.id("ideas"),
    content: v.string(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scripts")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    return ctx.db.insert("scripts", {
      ideaId: args.ideaId,
      content: args.content,
      version: existing.length + 1,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("scripts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { content: args.content });
  },
});
