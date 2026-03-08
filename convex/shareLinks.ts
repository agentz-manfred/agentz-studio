import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const create = mutation({
  args: {
    token: v.string(),
    videoId: v.id("videos"),
    expiresInDays: v.optional(v.number()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const shareToken = generateToken();
    const expiresAt = args.expiresInDays
      ? Date.now() + args.expiresInDays * 86400000
      : undefined;

    return ctx.db.insert("shareLinks", {
      videoId: args.videoId,
      token: shareToken,
      createdBy: user._id,
      expiresAt,
      password: args.password,
      viewCount: 0,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("shareLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!link || !link.active) return null;
    if (link.expiresAt && link.expiresAt < Date.now()) return null;

    const video = await ctx.db.get(link.videoId);
    if (!video) return null;

    const idea = video.ideaId ? await ctx.db.get(video.ideaId) : null;
    const client = idea && "clientId" in idea ? await ctx.db.get(idea.clientId) : null;

    return {
      ...link,
      video,
      idea: idea ? { title: idea.title, status: idea.status } : null,
      client: client ? { name: client.name, company: client.company } : null,
    };
  },
});

export const listByVideo = query({
  args: { videoId: v.id("videos"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("shareLinks")
      .withIndex("by_video", (q) => q.eq("videoId", args.videoId))
      .collect();
  },
});

export const incrementViews = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("shareLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (link) {
      await ctx.db.patch(link._id, { viewCount: link.viewCount + 1 });
    }
  },
});

export const deactivate = mutation({
  args: { token: v.string(), linkId: v.id("shareLinks") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.linkId, { active: false });
  },
});
