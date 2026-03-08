import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const list = query({
  args: { ideaId: v.optional(v.id("ideas")), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.ideaId) {
      const vids = await ctx.db.query("videos").withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId!)).collect();
      return vids.filter((v) => !v.archived);
    }
    const all = await ctx.db.query("videos").collect();
    return all.filter((v) => !v.archived);
  },
});

export const get = query({
  args: { videoId: v.id("videos"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) return null;
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId && video.ideaId) {
        const idea = await ctx.db.get(video.ideaId);
        if (idea && idea.clientId.toString() !== user.clientId.toString()) return null;
      }
    }
    return video;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    ideaId: v.optional(v.id("ideas")),
    title: v.string(),
    bunnyVideoId: v.optional(v.string()),
    bunnyUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const title = args.title.trim();
    if (!title) throw new Error("Titel darf nicht leer sein");
    return ctx.db.insert("videos", {
      ideaId: args.ideaId,
      title,
      status: "hochgeladen",
      uploadedBy: user._id,
      bunnyVideoId: args.bunnyVideoId,
      bunnyUrl: args.bunnyUrl,
      thumbnailUrl: args.thumbnailUrl,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { token: v.string(), videoId: v.id("videos"), status: v.string() },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const validStatuses = ["hochgeladen", "review", "korrektur", "freigegeben", "final"];
    if (!validStatuses.includes(args.status)) throw new Error("Ungültiger Status");
    const video = await ctx.db.get(args.videoId);
    if (!video) throw new Error("Video nicht gefunden");

    // Client can only approve/reject
    if (user.role === "client") {
      const allowed = ["freigegeben", "korrektur"];
      if (!allowed.includes(args.status)) throw new Error("Nicht erlaubt");
    }

    await ctx.db.patch(args.videoId, { status: args.status });

    // Auto-notify client on status change
    const idea = video.ideaId ? await ctx.db.get(video.ideaId) : null;
    if (idea) {
      const clientUsers = await ctx.db.query("users").filter((q) => q.eq(q.field("clientId"), idea.clientId)).collect();
      const statusLabels: Record<string, string> = {
        hochgeladen: "Hochgeladen", review: "Bereit zur Überprüfung",
        korrektur: "Wird überarbeitet", freigegeben: "Freigegeben", final: "Fertiggestellt",
      };
      for (const cu of clientUsers) {
        await ctx.db.insert("notifications", {
          userId: cu._id, type: "video_status", title: `Video: ${video.title}`,
          message: `Status geändert: ${statusLabels[args.status] || args.status}`,
          targetType: "video", targetId: args.videoId, read: false, createdAt: Date.now(),
        });
      }
    }
  },
});

export const updateBunnyInfo = mutation({
  args: { token: v.string(), videoId: v.id("videos"), bunnyVideoId: v.string(), bunnyUrl: v.string(), thumbnailUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.videoId, { bunnyVideoId: args.bunnyVideoId, bunnyUrl: args.bunnyUrl, thumbnailUrl: args.thumbnailUrl });
  },
});

export const createBunnyVideo = action({
  args: { title: v.string() },
  handler: async (_ctx, args) => {
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const apiKey = process.env.BUNNY_API_KEY;
    if (!libraryId || !apiKey) throw new Error("Bunny credentials not configured");
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", AccessKey: apiKey },
      body: JSON.stringify({ title: args.title }),
    });
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

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const ideas = await ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", args.clientId)).collect();
    const ideaIds = new Set(ideas.map((i) => i._id));
    const allVideos = await ctx.db.query("videos").collect();
    return allVideos.filter((v) => v.ideaId && ideaIds.has(v.ideaId));
  },
});

export const listByFolder = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    if (args.folderId) {
      const vids = await ctx.db.query("videos").withIndex("by_folder", (q) => q.eq("folderId", args.folderId)).collect();
      return vids.filter((v) => !v.archived);
    }
    const all = await ctx.db.query("videos").collect();
    return all.filter((v) => !v.folderId && !v.archived);
  },
});

export const moveToFolder = mutation({
  args: { token: v.string(), videoId: v.id("videos"), folderId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.videoId, { folderId: args.folderId });
  },
});

export const rename = mutation({
  args: { token: v.string(), videoId: v.id("videos"), title: v.string() },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const title = args.title.trim();
    if (!title) throw new Error("Titel darf nicht leer sein");
    await ctx.db.patch(args.videoId, { title });
  },
});

export const linkIdea = mutation({
  args: { token: v.string(), videoId: v.id("videos"), ideaId: v.optional(v.id("ideas")) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.videoId, { ideaId: args.ideaId });
  },
});

export const update = mutation({
  args: { token: v.string(), videoId: v.id("videos"), title: v.optional(v.string()), clientId: v.optional(v.id("clients")), clientVisible: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { videoId, token: _, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    if (Object.keys(filtered).length > 0) await ctx.db.patch(videoId, filtered);
  },
});

export const archive = mutation({
  args: { token: v.string(), videoId: v.id("videos"), archived: v.boolean() },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.videoId, {
      archived: args.archived,
      archivedAt: args.archived ? Date.now() : undefined,
    });
  },
});

export const listArchived = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("videos").collect();
    return all.filter((v) => v.archived);
  },
});

export const remove = mutation({
  args: { token: v.string(), videoId: v.id("videos") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.delete(args.videoId);
  },
});
