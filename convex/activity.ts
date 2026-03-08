import { query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate } from "./lib";

export const listByClient = query({
  args: {
    clientId: v.id("clients"),
    token: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Auth check
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId?.toString() !== args.clientId.toString()) {
        return [];
      }
    }

    const limit = args.limit ?? 50;

    // Get all ideas for this client
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    const ideaIds = new Set(ideas.map((i) => i._id.toString()));
    const ideaMap = Object.fromEntries(ideas.map((i) => [i._id.toString(), i]));

    // Status updates for these ideas
    const allStatusUpdates = await ctx.db.query("statusUpdates").collect();
    const statusUpdates = allStatusUpdates
      .filter((su) => ideaIds.has(su.ideaId.toString()))
      .map((su) => ({
        type: "status" as const,
        id: su._id,
        ideaId: su.ideaId,
        ideaTitle: ideaMap[su.ideaId.toString()]?.title || "Unbekannt",
        fromStatus: su.fromStatus,
        toStatus: su.toStatus,
        userId: su.userId,
        note: su.note,
        createdAt: su.createdAt,
      }));

    // Comments on ideas
    const allComments = await ctx.db.query("comments").collect();
    const ideaComments = allComments
      .filter((c) => c.targetType === "idea" && ideaIds.has(c.targetId))
      .map((c) => ({
        type: "comment" as const,
        id: c._id,
        targetType: c.targetType,
        targetId: c.targetId,
        targetTitle: ideaMap[c.targetId]?.title || "Unbekannt",
        content: c.content,
        userId: c.userId,
        createdAt: c.createdAt,
      }));

    // Videos for this client
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    const videoUploads = videos.map((v) => ({
      type: "upload" as const,
      id: v._id,
      title: v.title,
      status: v.status,
      userId: v.uploadedBy,
      createdAt: v.createdAt,
    }));

    // Video comments
    const videoMap = Object.fromEntries(videos.map((v) => [v._id.toString(), v]));
    const videoComments = allComments
      .filter((c) => c.targetType === "video" && videoMap[c.targetId])
      .map((c) => ({
        type: "comment" as const,
        id: c._id,
        targetType: c.targetType,
        targetId: c.targetId,
        targetTitle: videoMap[c.targetId]?.title || "Video",
        content: c.content,
        userId: c.userId,
        createdAt: c.createdAt,
      }));

    // Merge, sort, limit
    const all = [
      ...statusUpdates,
      ...ideaComments,
      ...videoComments,
      ...videoUploads,
    ].sort((a, b) => b.createdAt - a.createdAt);

    // Resolve user names
    const userIds = [...new Set(all.map((a) => a.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = Object.fromEntries(
      users.filter(Boolean).map((u) => [u!._id.toString(), u!.name])
    );

    return all.slice(0, limit).map((item) => ({
      ...item,
      userName: userMap[item.userId.toString()] || "Unbekannt",
    }));
  },
});
