import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const list = query({
  args: { parentId: v.optional(v.id("folders")), clientId: v.optional(v.id("clients")), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let clientFilter = args.clientId;
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) clientFilter = user.clientId;
    }

    if (args.parentId) {
      const folders = await ctx.db.query("folders").withIndex("by_parent", (q) => q.eq("parentId", args.parentId)).collect();
      if (clientFilter) return folders.filter(f => f.clientId === clientFilter);
      return folders;
    }
    const all = await ctx.db.query("folders").collect();
    const roots = all.filter((f) => !f.parentId);
    if (clientFilter) return roots.filter(f => f.clientId === clientFilter);
    return roots;
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
    token: v.string(),
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    clientId: v.optional(v.id("clients")),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    return ctx.db.insert("folders", {
      name: args.name,
      parentId: args.parentId,
      clientId: args.clientId,
      color: args.color,
      createdBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: { token: v.string(), folderId: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    await ctx.db.patch(args.folderId, { name: args.name });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    clientVisible: v.optional(v.boolean()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { folderId, token: _, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    if (Object.keys(filtered).length > 0) await ctx.db.patch(folderId, filtered);
  },
});

export const move = mutation({
  args: { token: v.string(), folderId: v.id("folders"), parentId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
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
  args: { token: v.string(), folderId: v.id("folders") },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const childFolders = await ctx.db.query("folders").withIndex("by_parent", (q) => q.eq("parentId", args.folderId)).collect();
    if (childFolders.length > 0) throw new Error("Ordner enthält Unterordner");
    const childVideos = await ctx.db.query("videos").withIndex("by_folder", (q) => q.eq("folderId", args.folderId)).collect();
    if (childVideos.length > 0) throw new Error("Ordner enthält Videos");
    await ctx.db.delete(args.folderId);
  },
});

export const countItems = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const folders = await ctx.db.query("folders").withIndex("by_parent", (q) => q.eq("parentId", args.folderId)).collect();
    const videos = await ctx.db.query("videos").withIndex("by_folder", (q) => q.eq("folderId", args.folderId)).collect();
    return { folders: folders.length, videos: videos.length };
  },
});
