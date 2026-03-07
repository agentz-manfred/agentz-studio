import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple hash function for passwords (in production, use bcrypt via action)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36) + password.length.toString(36);
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Register is admin-only: only existing admins can create new users
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
    // The session token of the admin performing the registration
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if any users exist. If none, allow first admin creation (bootstrap).
    const anyUser = await ctx.db.query("users").first();

    if (anyUser) {
      // Users exist — require admin authentication
      if (!args.adminToken) throw new Error("Nur Admins können Nutzer anlegen");
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.adminToken!))
        .first();
      if (!session || session.expiresAt < Date.now()) throw new Error("Ungültige Session");
      const admin = await ctx.db.get(session.userId);
      if (!admin || admin.role !== "admin") throw new Error("Nur Admins können Nutzer anlegen");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) throw new Error("Email bereits registriert");

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: simpleHash(args.password),
      name: args.name,
      role: anyUser ? args.role : "admin", // First user is always admin
      clientId: args.clientId,
      createdAt: Date.now(),
    });

    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return { userId, token };
  },
});

// Seed admin: creates initial admin if no users exist
export const seedAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const anyUser = await ctx.db.query("users").first();
    if (anyUser) return { status: "exists", message: "Admin existiert bereits" };

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: simpleHash(args.password),
      name: args.name,
      role: "admin",
      createdAt: Date.now(),
    });

    return { status: "created", userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.passwordHash !== simpleHash(args.password)) {
      throw new Error("Ungültige Anmeldedaten");
    }

    const token = generateToken();
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return { userId: user._id, token, role: user.role, name: user.name };
  },
});

export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    };
  },
});

// List all users (admin only, used for client user management)
export const listUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      clientId: u.clientId,
      createdAt: u.createdAt,
    }));
  },
});

export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Ungültige Session");

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("Nutzer nicht gefunden");

    if (user.passwordHash !== simpleHash(args.currentPassword)) {
      throw new Error("Aktuelles Passwort ist falsch");
    }

    if (args.newPassword.length < 6) {
      throw new Error("Neues Passwort muss mindestens 6 Zeichen haben");
    }

    await ctx.db.patch(user._id, {
      passwordHash: simpleHash(args.newPassword),
    });

    return { success: true };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});
