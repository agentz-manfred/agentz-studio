"use node";
/**
 * Secure auth actions using bcrypt + crypto.
 * Replaces insecure simpleHash and Math.random() from auth.ts mutations.
 */
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_ROUNDS = 10;

function generateSecureToken(length = 64): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

// Legacy simpleHash for migration — verifies old passwords so we can re-hash them
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36) + password.length.toString(36);
}

export const register = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const anyUser = await ctx.runQuery(internal.authInternal.getAnyUser);

    if (anyUser) {
      if (!args.adminToken) throw new Error("Nur Admins können Nutzer anlegen");
      const sessionData = await ctx.runQuery(internal.authInternal.getSessionByToken, { token: args.adminToken });
      if (!sessionData || sessionData.user.role !== "admin") throw new Error("Nur Admins können Nutzer anlegen");
    }

    if (args.password.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");
    if (!args.email.includes("@")) throw new Error("Ungültige E-Mail-Adresse");
    if (!args.name.trim()) throw new Error("Name darf nicht leer sein");

    const existing = await ctx.runQuery(internal.authInternal.getUserByEmail, { email: args.email });
    if (existing) throw new Error("Email bereits registriert");

    const passwordHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS);

    const userId = await ctx.runMutation(internal.authInternal.createUser, {
      email: args.email,
      passwordHash,
      name: args.name,
      role: anyUser ? args.role : "admin",
      clientId: args.clientId,
    });

    const token = generateSecureToken();
    await ctx.runMutation(internal.authInternal.createSession, { userId, token });

    return { userId, token };
  },
});

export const seedAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const anyUser = await ctx.runQuery(internal.authInternal.getAnyUser);
    if (anyUser) return { status: "exists" as const, message: "Admin existiert bereits" };

    const passwordHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS);
    const userId = await ctx.runMutation(internal.authInternal.createUser, {
      email: args.email,
      passwordHash,
      name: args.name,
      role: "admin",
    });

    return { status: "created" as const, userId };
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Rate limiting
    const recentFailed = await ctx.runQuery(internal.authInternal.getRecentLoginAttempts, { email: args.email });
    if (recentFailed >= 5) {
      throw new Error("Zu viele Anmeldeversuche. Bitte warte eine Minute.");
    }

    const user = await ctx.runQuery(internal.authInternal.getUserByEmail, { email: args.email });

    if (!user) {
      await ctx.runMutation(internal.authInternal.logLoginAttempt, { email: args.email, success: false });
      throw new Error("Ungültige Anmeldedaten");
    }

    // Try bcrypt first, then legacy simpleHash for migration
    let passwordValid = false;
    let needsRehash = false;

    if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
      passwordValid = await bcrypt.compare(args.password, user.passwordHash);
    } else {
      passwordValid = user.passwordHash === simpleHash(args.password);
      if (passwordValid) needsRehash = true;
    }

    if (!passwordValid) {
      await ctx.runMutation(internal.authInternal.logLoginAttempt, { email: args.email, success: false });
      throw new Error("Ungültige Anmeldedaten");
    }

    // Auto-migrate legacy hash to bcrypt
    if (needsRehash) {
      const newHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS);
      await ctx.runMutation(internal.authInternal.updatePasswordHash, { userId: user._id, passwordHash: newHash });
    }

    await ctx.runMutation(internal.authInternal.logLoginAttempt, { email: args.email, success: true });

    const token = generateSecureToken();
    await ctx.runMutation(internal.authInternal.createSession, { userId: user._id, token });

    return { userId: user._id, token, role: user.role, name: user.name };
  },
});

export const changePassword = action({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionData = await ctx.runQuery(internal.authInternal.getSessionByToken, { token: args.token });
    if (!sessionData) throw new Error("Ungültige Session");
    const user = sessionData.user;

    let currentValid = false;
    if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
      currentValid = await bcrypt.compare(args.currentPassword, user.passwordHash);
    } else {
      currentValid = user.passwordHash === simpleHash(args.currentPassword);
    }

    if (!currentValid) throw new Error("Aktuelles Passwort ist falsch");
    if (args.newPassword.length < 6) throw new Error("Neues Passwort muss mindestens 6 Zeichen haben");

    const newHash = await bcrypt.hash(args.newPassword, BCRYPT_ROUNDS);
    await ctx.runMutation(internal.authInternal.updatePasswordHash, { userId: user._id, passwordHash: newHash });

    return { success: true };
  },
});

export const resetPassword = action({
  args: {
    token: v.string(),
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionData = await ctx.runQuery(internal.authInternal.getSessionByToken, { token: args.token });
    if (!sessionData || sessionData.user.role !== "admin") throw new Error("Nur Admins");
    if (args.newPassword.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");

    const newHash = await bcrypt.hash(args.newPassword, BCRYPT_ROUNDS);
    await ctx.runMutation(internal.authInternal.updatePasswordHash, { userId: args.userId, passwordHash: newHash });
  },
});
