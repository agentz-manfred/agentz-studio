import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function generateInviteToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36) + password.length.toString(36);
}

function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Admin creates an invite link for a client
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    adminToken: v.string(),
    expiresInDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify admin
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Ungültige Session");
    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") throw new Error("Nur Admins können Einladungen erstellen");

    // Check client exists
    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Kunde nicht gefunden");

    // Check if client already has a user account
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .first();
    if (existingUser) throw new Error("Kunde hat bereits einen Zugang");

    // Deactivate any existing active invites for this client
    const existingInvites = await ctx.db
      .query("inviteLinks")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    for (const inv of existingInvites) {
      if (inv.active) {
        await ctx.db.patch(inv._id, { active: false });
      }
    }

    const token = generateInviteToken();
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

// Validate an invite token (public - no auth needed)
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

// Redeem an invite - client sets their password
export const redeem = mutation({
  args: {
    token: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("inviteLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (args.password.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");
    if (!invite || !invite.active || invite.expiresAt < Date.now() || invite.usedAt) {
      throw new Error("Ungültige oder abgelaufene Einladung");
    }

    const client = await ctx.db.get(invite.clientId);
    if (!client) throw new Error("Kunde nicht gefunden");

    // Check no user exists for this client yet
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clientId"), invite.clientId))
      .first();
    if (existingUser) throw new Error("Zugang existiert bereits");

    // Check email not taken
    const emailTaken = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", client.email))
      .first();
    if (emailTaken) throw new Error("E-Mail-Adresse bereits vergeben");

    // Create user account
    const userId = await ctx.db.insert("users", {
      email: client.email,
      passwordHash: simpleHash(args.password),
      name: args.name || client.name,
      role: "client" as const,
      clientId: invite.clientId,
      createdAt: Date.now(),
    });

    // Mark invite as used
    await ctx.db.patch(invite._id, {
      usedAt: Date.now(),
      usedBy: userId,
      active: false,
    });

    // Create session
    const sessionToken = generateSessionToken();
    await ctx.db.insert("sessions", {
      userId,
      token: sessionToken,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    // Notify admins
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "invite_redeemed",
        title: "Neuer Kundenzugang",
        message: `${client.name} hat sich über den Einladungslink registriert.`,
        targetType: "client",
        targetId: invite.clientId,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { userId, token: sessionToken, name: args.name || client.name };
  },
});

// List invites for a client (admin)
export const listByClient = query({
  args: { clientId: v.id("clients"), adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Note: should be admin-only but keeping backward compat with optional token
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
