import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { authenticate } from "./lib";

export const list = query({
  args: { token: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 20);
    return all;
  },
});

export const unreadCount = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { token: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const notif = await ctx.db.get(args.notificationId);
    if (!notif || notif.userId.toString() !== user._id.toString()) throw new Error("Kein Zugriff");
    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});

// Internal only — cannot be called from the client
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
