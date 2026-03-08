import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";
import { internal } from "./_generated/api";

async function auditLog(ctx: any, user: any, action: string, entityType: string, entityId?: string, entityName?: string, details?: string) {
  await ctx.scheduler.runAfter(0, internal.auditLog.log, {
    userId: user._id,
    userName: user.name,
    action,
    entityType,
    entityId,
    entityName,
    details,
  });
}

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
    // No token = no data (prevent unauthenticated access)
    if (!args.token) return [];
    const user = await authenticate(ctx, args.token);
    if (user.role === "client" && user.clientId) {
      const clientIdeas = await ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", user.clientId!)).collect();
      return clientIdeas.filter((i) => !i.archived);
    }
    // Admin/editor: filter by clientId if provided, otherwise all
    if (args.clientId) {
      const all = await ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", args.clientId!)).collect();
      return all.filter((i) => !i.archived);
    }
    const all = await ctx.db.query("ideas").collect();
    return all.filter((i) => !i.archived);
  },
});

export const get = query({
  args: { ideaId: v.id("ideas"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const idea = await ctx.db.get(args.ideaId);
    if (!idea) return null;
    const user = await authenticate(ctx, args.token);
    if (user.role === "client" && user.clientId) {
      if (idea.clientId.toString() !== user.clientId.toString()) return null;
    }
    return idea;
  },
});

export const byStatus = query({
  args: { status: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const user = await authenticate(ctx, args.token);
    const ideas = await ctx.db.query("ideas").withIndex("by_status", (q) => q.eq("status", args.status)).collect();
    if (user.role === "client" && user.clientId) {
      return ideas.filter((i) => i.clientId.toString() === user.clientId!.toString());
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
    const title = args.title.trim();
    if (!title) throw new Error("Titel darf nicht leer sein");

    const existing = await ctx.db
      .query("ideas")
      .withIndex("by_status", (q) => q.eq("status", "idee"))
      .collect();

    const id = await ctx.db.insert("ideas", {
      clientId: args.clientId,
      title,
      description: args.description,
      categoryId: args.categoryId,
      status: "idee",
      order: existing.length,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await auditLog(ctx, user, "create", "idea", id, title);
    return id;
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
    if (!STATUSES.includes(args.status as any)) throw new Error("Ungültiger Status");
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
    await auditLog(ctx, user, "status_change", "idea", args.ideaId, idea.title, `${idea.status} → ${args.status}`);

    // In-app notification for client users
    const STATUS_LABELS: Record<string, string> = {
      idee: "Idee", skript: "Skript", freigabe: "Zur Freigabe", korrektur: "Korrektur",
      freigegeben: "Freigegeben", gedreht: "Gedreht", geschnitten: "Geschnitten",
      review: "Review", veröffentlicht: "Veröffentlicht",
    };
    const client = await ctx.db.get(idea.clientId);

    // Notify client users about status changes they care about
    const clientNotifyStatuses = ["freigabe", "korrektur", "veröffentlicht", "geschnitten"];
    if (clientNotifyStatuses.includes(args.status) && client) {
      // Find all client users for this client
      const clientUsers = await ctx.db.query("users").collect();
      const relevantUsers = clientUsers.filter(u => u.role === "client" && u.clientId?.toString() === idea.clientId.toString());
      for (const cu of relevantUsers) {
        await ctx.db.insert("notifications", {
          userId: cu._id,
          type: "status_change",
          title: `Status: ${STATUS_LABELS[args.status] || args.status}`,
          message: `"${idea.title}" wurde auf "${STATUS_LABELS[args.status] || args.status}" gesetzt.`,
          targetType: "ideas",
          targetId: idea._id.toString(),
          read: false,
          createdAt: Date.now(),
        });
      }

      // Email notification
      if (client.email) {
        await ctx.scheduler.runAfter(0, internal.email.sendStatusNotification, {
          clientEmail: client.email,
          clientName: client.name,
          ideaTitle: idea.title,
          newStatus: args.status,
          studioUrl: "https://agentz-studio.vercel.app",
        });
      }
    }
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

export const archive = mutation({
  args: { token: v.string(), ideaId: v.id("ideas"), archived: v.boolean() },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const idea = await ctx.db.get(args.ideaId);
    await ctx.db.patch(args.ideaId, {
      archived: args.archived,
      archivedAt: args.archived ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
    await auditLog(ctx, user, args.archived ? "archive" : "unarchive", "idea", args.ideaId, idea?.title);
  },
});

export const listArchived = query({
  args: { token: v.optional(v.string()), clientId: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const user = await authenticate(ctx, args.token);
    if (user.role === "client" && user.clientId) {
      const all = await ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", user.clientId!)).collect();
      return all.filter((i) => i.archived);
    }
    const all = args.clientId
      ? await ctx.db.query("ideas").withIndex("by_client", (q) => q.eq("clientId", args.clientId!)).collect()
      : await ctx.db.query("ideas").collect();
    return all.filter((i) => i.archived);
  },
});

export const search = query({
  args: { token: v.optional(v.string()), query: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const q = args.query.toLowerCase().trim();
    if (!q) return [];
    const user = await authenticate(ctx, args.token);
    const all = await ctx.db.query("ideas").collect();
    let filtered = all.filter((i) => !i.archived);

    if (user.role === "client" && user.clientId) {
      filtered = filtered.filter((i) => i.clientId.toString() === user.clientId!.toString());
    }

    return filtered.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      (i.description || "").toLowerCase().includes(q)
    );
  },
});

export const withPublishDates = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const user = await authenticate(ctx, args.token);
    const all = await ctx.db.query("ideas").collect();
    let filtered = all.filter((i) => i.scheduledPublishDate);
    if (user.role === "client" && user.clientId) {
      filtered = filtered.filter((i) => i.clientId.toString() === user.clientId!.toString());
    }
    return filtered;
  },
});
