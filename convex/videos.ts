import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { ideaId: v.optional(v.id("ideas")) },
  handler: async (ctx, args) => {
    if (args.ideaId) {
      return ctx.db
        .query("videos")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId!))
        .collect();
    }
    return ctx.db.query("videos").collect();
  },
});

export const get = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.videoId);
  },
});

export const create = mutation({
  args: {
    ideaId: v.id("ideas"),
    title: v.string(),
    uploadedBy: v.id("users"),
    bunnyVideoId: v.optional(v.string()),
    bunnyUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("videos", {
      ideaId: args.ideaId,
      title: args.title,
      status: "hochgeladen",
      uploadedBy: args.uploadedBy,
      bunnyVideoId: args.bunnyVideoId,
      bunnyUrl: args.bunnyUrl,
      thumbnailUrl: args.thumbnailUrl,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    videoId: v.id("videos"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video nicht gefunden");
    
    const oldStatus = video.status;
    await ctx.db.patch(args.videoId, { status: args.status });

    // Auto-notify the client when video status changes
    const idea = await ctx.db.get(video.ideaId);
    if (idea) {
      // Find client's user account
      const clientUsers = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clientId"), idea.clientId))
        .collect();
      
      const statusLabels: Record<string, string> = {
        hochgeladen: "Hochgeladen",
        review: "Bereit zur Überprüfung",
        korrektur: "Wird überarbeitet",
        freigegeben: "Freigegeben",
        final: "Fertiggestellt",
      };
      
      for (const clientUser of clientUsers) {
        await ctx.db.insert("notifications", {
          userId: clientUser._id,
          type: "video_status",
          title: `Video: ${video.title}`,
          message: `Status geändert: ${statusLabels[args.status] || args.status}`,
          targetType: "video",
          targetId: args.videoId,
          read: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const updateBunnyInfo = mutation({
  args: {
    videoId: v.id("videos"),
    bunnyVideoId: v.string(),
    bunnyUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      bunnyVideoId: args.bunnyVideoId,
      bunnyUrl: args.bunnyUrl,
      thumbnailUrl: args.thumbnailUrl,
    });
  },
});

// Create a video on Bunny Stream and return upload URL
export const createBunnyVideo = action({
  args: { title: v.string() },
  handler: async (_ctx, args) => {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;
    if (!libraryId || !apiKey) throw new Error("Bunny credentials not configured");

    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          AccessKey: apiKey,
        },
        body: JSON.stringify({ title: args.title }),
      }
    );
    if (!res.ok) throw new Error(`Bunny API error: ${res.status}`);
    const data = await res.json();

    const cdnHostname = process.env.BUNNY_CDN_HOSTNAME || process.env.VITE_BUNNY_CDN_HOSTNAME;

    return {
      videoId: data.guid as string,
      uploadUrl: `https://video.bunnycdn.com/library/${libraryId}/videos/${data.guid}`,
      playUrl: `https://${cdnHostname}/${data.guid}/play_720p.mp4`,
      thumbnailUrl: `https://${cdnHostname}/${data.guid}/thumbnail.jpg`,
      embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${data.guid}`,
      tusUploadUrl: `https://video.bunnycdn.com/tusupload`,
      libraryId,
      authKey: apiKey,
    };
  },
});

// List videos for a specific client (via their ideas)
export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    const ideaIds = new Set(ideas.map((i) => i._id));
    const allVideos = await ctx.db.query("videos").collect();
    return allVideos.filter((v) => ideaIds.has(v.ideaId));
  },
});

export const remove = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.videoId);
  },
});
