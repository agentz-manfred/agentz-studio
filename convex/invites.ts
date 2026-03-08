import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Admin creates an invite link for a client
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    adminToken: v.string(),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Ungültige Session");
    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") throw new Error("Nur Admins können Einladungen erstellen");

    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Kunde nicht gefunden");

    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .first();
    if (existingUser) throw new Error("Kunde hat bereits einen Zugang");

    // Deactivate existing active invites
    const existingInvites = await ctx.db
      .query("inviteLinks")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    for (const inv of existingInvites) {
      if (inv.active) await ctx.db.patch(inv._id, { active: false });
    }

    // Invite tokens are short-lived and single-use, acceptable in mutation context
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresInDays = args.expiresInDays ?? 7;

    const inviteId = await ctx.db.insert("inviteLinks", {
      clientId: args.clientId,
      token,
      createdBy: session.userId,
      expiresAt: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
      active: true,
      createdAt: Date.now(),
    });

    return { inviteId, token };
  },
});

// Validate an invite token (public)
export const validate = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("inviteLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) return { valid: false, error: "Einladung nicht gefunden" };
    if (!invite.active) return { valid: false, error: "Einladung ist nicht mehr gültig" };
    if (invite.expiresAt < Date.now()) return { valid: false, error: "Einladung ist abgelaufen" };
    if (invite.usedAt) return { valid: false, error: "Einladung wurde bereits verwendet" };

    const client = await ctx.db.get(invite.clientId);
    if (!client) return { valid: false, error: "Kunde nicht gefunden" };

    return {
      valid: true,
      clientName: client.name,
      company: client.company,
      email: client.email,
    };
  },
});

// List invites for a client (admin only)
export const listByClient = query({
  args: { clientId: v.id("clients"), adminToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();
    if (!session || session.expiresAt < Date.now()) return [];
    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") return [];

    return await ctx.db
      .query("inviteLinks")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

// Revoke an invite
export const revoke = mutation({
  args: {
    inviteId: v.id("inviteLinks"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Ungültige Session");
    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") throw new Error("Nur Admins");

    await ctx.db.patch(args.inviteId, { active: false });
  },
});
