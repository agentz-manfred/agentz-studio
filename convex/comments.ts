import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const list = query({
  args: {
    targetType: v.union(v.literal("idea"), v.literal("script"), v.literal("video")),
    targetId: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // TODO: validate that client user has access to this target
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
    token: v.string(),
    targetType: v.union(v.literal("idea"), v.literal("script"), v.literal("video")),
    targetId: v.string(),
    content: v.string(),
    timestamp: v.optional(v.number()),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const content = args.content.trim();
    if (!content) throw new Error("Kommentar darf nicht leer sein");

    const commentId = await ctx.db.insert("comments", {
      targetType: args.targetType,
      targetId: args.targetId,
      userId: user._id,
      content,
      timestamp: args.timestamp,
      parentId: args.parentId,
      resolved: false,
      createdAt: Date.now(),
    });

    // Auto-notify: if comment is on a video, notify the other party
    if (args.targetType === "video") {
      const video = await ctx.db.get(args.targetId as any) as any;
      if (video) {
        const idea = video?.ideaId ? await ctx.db.get(video.ideaId) as any : null;
        if (idea) {
          if (user.role === "admin") {
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
            const admins = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("role"), "admin"))
              .collect();
            for (const admin of admins) {
              await ctx.db.insert("notifications", {
                userId: admin._id,
                type: "comment",
                title: `${user.name} hat "${video.title}" kommentiert`,
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
  args: { token: v.string(), commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.commentId, { resolved: true });
  },
});
