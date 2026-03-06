import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    targetType: v.union(v.literal("idea"), v.literal("script"), v.literal("video")),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    targetType: v.union(v.literal("idea"), v.literal("script"), v.literal("video")),
    targetId: v.string(),
    userId: v.id("users"),
    content: v.string(),
    timestamp: v.optional(v.number()),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("comments", {
      ...args,
      resolved: false,
      createdAt: Date.now(),
    });
  },
});

export const resolve = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, { resolved: true });
  },
});
