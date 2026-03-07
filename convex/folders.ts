import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { parentId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    if (args.parentId) {
      return ctx.db
        .query("folders")
        .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
        .collect();
    }
    // Root folders (no parent)
    const all = await ctx.db.query("folders").collect();
    return all.filter((f) => !f.parentId);
  },
});

export const get = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.folderId);
  },
});

export const getBreadcrumbs = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    if (!args.folderId) return [];
    const crumbs: { _id: string; name: string }[] = [];
    let current = await ctx.db.get(args.folderId);
    while (current) {
      crumbs.unshift({ _id: current._id, name: current.name });
      current = current.parentId ? await ctx.db.get(current.parentId) : null;
    }
    return crumbs;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    clientId: v.optional(v.id("clients")),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("folders", {
      name: args.name,
      parentId: args.parentId,
      clientId: args.clientId,
      color: args.color,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: { folderId: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.folderId, { name: args.name });
  },
});

export const move = mutation({
  args: { folderId: v.id("folders"), parentId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    // Prevent moving into self or descendant
    if (args.parentId) {
      let check = await ctx.db.get(args.parentId);
      while (check) {
        if (check._id === args.folderId) throw new Error("Kann Ordner nicht in sich selbst verschieben");
        check = check.parentId ? await ctx.db.get(check.parentId) : null;
      }
    }
    await ctx.db.patch(args.folderId, { parentId: args.parentId });
  },
});

export const remove = mutation({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    // Check for children
    const childFolders = await ctx.db
      .query("folders")
      .withIndex("by_parent", (q) => q.eq("parentId", args.folderId))
      .collect();
    if (childFolders.length > 0) throw new Error("Ordner enthält Unterordner");

    const childVideos = await ctx.db
      .query("videos")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();
    if (childVideos.length > 0) throw new Error("Ordner enthält Videos");

    await ctx.db.delete(args.folderId);
  },
});

// Count items in folder
export const countItems = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_parent", (q) => q.eq("parentId", args.folderId))
      .collect();
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();
    return { folders: folders.length, videos: videos.length };
  },
});
