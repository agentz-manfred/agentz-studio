import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireEditor } from "./lib";
import { internal } from "./_generated/api";

async function auditLog(ctx: any, user: any, action: string, entityType: string, entityId?: string, entityName?: string, details?: string) {
  await ctx.scheduler.runAfter(0, internal.auditLog.log, {
    userId: user._id, userName: user.name, action, entityType, entityId, entityName, details,
  });
}

export const list = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      // Client users only see their own client
      if (user.role === "client" && user.clientId) {
        const client = await ctx.db.get(user.clientId);
        return client ? [client] : [];
      }
    }
    return ctx.db.query("clients").collect();
  },
});

export const get = query({
  args: { id: v.id("clients"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) return null;
    if (args.token) {
      const user = await authenticate(ctx, args.token);
      if (user.role === "client" && user.clientId) {
        if (client._id.toString() !== user.clientId.toString()) return null;
      }
    }
    return client;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    name: v.string(),
    company: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const name = args.name.trim();
    const email = args.email.trim();
    if (!name) throw new Error("Name darf nicht leer sein");
    if (!email) throw new Error("E-Mail darf nicht leer sein");
    const id = await ctx.db.insert("clients", {
      name,
      company: args.company?.trim(),
      email,
      phone: args.phone?.trim(),
      createdAt: Date.now(),
    });
    await auditLog(ctx, user, "create", "client", id, name);
    return id;
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id("clients"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    contractStart: v.optional(v.string()),
    contractEnd: v.optional(v.string()),
    platforms: v.optional(v.array(v.string())),
    mainPlatform: v.optional(v.string()),
    videosPerMonth: v.optional(v.number()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireEditor(ctx, args.token);
    const { id, token: _, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Client not found");
    await ctx.db.patch(id, updates);
    await auditLog(ctx, user, "update", "client", id, existing.name);
    return id;
  },
});
