import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const listByIdea = query({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    return ctx.db.query("scripts").withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId)).collect();
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    ideaId: v.id("ideas"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const existing = await ctx.db.query("scripts").withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId)).collect();
    return ctx.db.insert("scripts", {
      ideaId: args.ideaId,
      content: args.content,
      version: existing.length + 1,
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: { token: v.string(), id: v.id("scripts"), content: v.string() },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.id, { content: args.content });
  },
});
