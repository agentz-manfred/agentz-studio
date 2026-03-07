import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";

export const STATUSES = [
  "idee",
  "skript",
  "freigabe",
  "korrektur",
  "freigegeben",
  "gedreht",
  "geschnitten",
  "review",
  "veröffentlicht",
] as const;

export const list = query({
  args: { token: v.optional(v.string()), clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    // If token provided, enforce data isolation
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        // Client users ONLY see their own ideas
        return ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", user.clientId!)).collect();
      }
    }
    // Admin/editor: filter by clientId if provided, otherwise all
    if (args.clientId) {
      return ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", args.clientId!)).collect();
    }
    return ctx.db.query("ideas").collect();
  },
});

export const get = query({
  args: { ideaId: v.id("ideas"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) return null;
    // If token provided, enforce access
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        if (idea.clientId.toString() !== user.clientId.toString()) return null;
      }
    }
    return idea;
  },
});

export const byStatus = query({
  args: { status: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const ideas = await ctx.db.query("ideas").withIndex("by_status", (q) => q.eq("status", args.status)).collect();
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        return ideas.filter((i) => i.clientId.toString() === user.clientId!.toString());
      }
    }
    return ideas;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);

    const existing = await ctx.db
      .query("ideas")
      .withIndex("by_status", (q) => q.eq("status", "idee"))
      .collect();

    return ctx.db.insert("ideas", {
      clientId: args.clientId,
      title: args.title,
      description: args.description,
      categoryId: args.categoryId,
      status: "idee",
      order: existing.length,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    ideaId: v.id("ideas"),
    status: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authenticate(ctx, args.token);
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error("Idee nicht gefunden");

    // Client can only approve/reject (freigabe → freigegeben or korrektur)
    if (user.role === "client") {
      if (user.clientId?.toString() !== idea.clientId.toString()) throw new Error("Kein Zugriff");
      const allowed = ["freigegeben", "korrektur"];
      if (!allowed.includes(args.status)) throw new Error("Nicht erlaubt");
    }

    await ctx.db.insert("statusUpdates", {
      ideaId: args.ideaId,
      fromStatus: idea.status,
      toStatus: args.status,
      userId: user._id,
      note: args.note,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.ideaId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    ideaId: v.id("ideas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    scheduledPublishDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx, args.token);
    const { ideaId, token: _, ...updates } = args;
    await ctx.db.patch(ideaId, { ...updates, updatedAt: Date.now() });
  },
});

export const withPublishDates = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("ideas").collect();
    let filtered = all.filter((i) => i.scheduledPublishDate);
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        filtered = filtered.filter((i) => i.clientId.toString() === user.clientId!.toString());
      }
    }
    return filtered;
  },
});
