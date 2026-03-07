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
    const commentId = await ctx.db.insert("comments", {
      ...args,
      resolved: false,
      createdAt: Date.now(),
    });

    // Auto-notify: if comment is on a video, notify the other party
    if (args.targetType === "video") {
      const commenter = await ctx.db.get(args.userId);
      const video = await ctx.db.get(args.targetId as any) as any;
      if (video && commenter) {
        const idea = video?.ideaId ? await ctx.db.get(video.ideaId) as any : null;
        if (idea) {
          if (commenter.role === "admin") {
            // Admin commented → notify client
            const clientUsers = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("clientId"), idea.clientId))
              .collect();
            for (const cu of clientUsers) {
              await ctx.db.insert("notifications", {
                userId: cu._id,
                type: "comment",
                title: `Neues Feedback zu "${video.title}"`,
                message: args.content.slice(0, 100),
                targetType: "video",
                targetId: args.targetId,
                read: false,
                createdAt: Date.now(),
              });
            }
          } else {
            // Client commented → notify all admins
            const admins = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("role"), "admin"))
              .collect();
            for (const admin of admins) {
              await ctx.db.insert("notifications", {
                userId: admin._id,
                type: "comment",
                title: `${commenter.name} hat "${video.title}" kommentiert`,
                message: args.content.slice(0, 100),
                targetType: "video",
                targetId: args.targetId,
                read: false,
                createdAt: Date.now(),
              });
            }
          }
        }
      }
    }

    return commentId;
  },
});

export const resolve = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.commentId, { resolved: true });
  },
});
