/**
 * Internal queries and mutations for auth — used by authActions.ts
 */
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getAnyUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

export const getRecentLoginAttempts = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const attempts = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    return attempts.filter((a) => a.attemptAt > oneMinuteAgo && !a.success).length;
  },
});

export const getSessionByToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { session, user };
  },
});

export const createUser = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
      role: args.role,
      clientId: args.clientId,
      createdAt: Date.now(),
    });
  },
});

export const createSession = internalMutation({
  args: {
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      userId: args.userId,
      token: args.token,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
  },
});

export const logLoginAttempt = internalMutation({
  args: { email: v.string(), success: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.insert("loginAttempts", {
      email: args.email,
      attemptAt: Date.now(),
      success: args.success,
    });
  },
});

export const updatePasswordHash = internalMutation({
  args: { userId: v.id("users"), passwordHash: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { passwordHash: args.passwordHash });
  },
});
