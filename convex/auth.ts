import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authenticate, requireAdmin } from "./lib";

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
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const anyUser = await ctx.db.query("users").first();

    if (anyUser) {
      if (!args.adminToken) throw new Error("Nur Admins können Nutzer anlegen");
      await requireAdmin(ctx, args.adminToken);
    }

    if (args.password.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");
    if (!args.email.includes("@")) throw new Error("Ungültige E-Mail-Adresse");
    if (!args.name.trim()) throw new Error("Name darf nicht leer sein");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("Email bereits registriert");

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: simpleHash(args.password),
      name: args.name,
      role: anyUser ? args.role : "admin",
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
    // Rate limiting: max 5 failed attempts per email in last 60 seconds
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentAttempts = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    const recentFailed = recentAttempts.filter(
      (a) => a.attemptAt > oneMinuteAgo && !a.success
    );
    if (recentFailed.length >= 5) {
      throw new Error("Zu viele Anmeldeversuche. Bitte warte eine Minute.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.passwordHash !== simpleHash(args.password)) {
      // Log failed attempt
      await ctx.db.insert("loginAttempts", {
        email: args.email,
        attemptAt: Date.now(),
        success: false,
      });
      throw new Error("Ungültige Anmeldedaten");
    }

    // Log successful attempt
    await ctx.db.insert("loginAttempts", {
      email: args.email,
      attemptAt: Date.now(),
      success: true,
    });

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

// List all users — ADMIN ONLY
export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
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
    const user = await authenticate(ctx, args.token);

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

// Update user — ADMIN ONLY
export const updateUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"), v.literal("client"))),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);

    const { token: _, userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Nutzer nicht gefunden");

    if (updates.email && updates.email !== user.email) {
      const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", updates.email!)).first();
      if (existing) throw new Error("Email bereits vergeben");
    }

    const filtered = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(userId, filtered);
    }
  },
});

// Delete user — ADMIN ONLY
export const deleteUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    // Can't delete yourself
    if (admin._id === args.userId) throw new Error("Du kannst dich nicht selbst löschen");

    const sessions = await ctx.db.query("sessions").filter((q) => q.eq(q.field("userId"), args.userId)).collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    await ctx.db.delete(args.userId);
  },
});

// Reset password — ADMIN ONLY
export const resetPassword = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    if (args.newPassword.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");
    await ctx.db.patch(args.userId, { passwordHash: simpleHash(args.newPassword) });
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

// Clean up expired sessions — call periodically
export const cleanupSessions = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const now = Date.now();
    const allSessions = await ctx.db.query("sessions").collect();
    let deleted = 0;
    for (const s of allSessions) {
      if (s.expiresAt < now) {
        await ctx.db.delete(s._id);
        deleted++;
      }
    }
    // Clean up old login attempts (older than 1 hour)
    const oneHourAgo = now - 60 * 60 * 1000;
    const oldAttempts = await ctx.db.query("loginAttempts").collect();
    let attemptsDeleted = 0;
    for (const a of oldAttempts) {
      if (a.attemptAt < oneHourAgo) {
        await ctx.db.delete(a._id);
        attemptsDeleted++;
      }
    }

    return { deleted, remaining: allSessions.length - deleted, attemptsDeleted };
  },
});
