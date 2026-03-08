import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const validateInvite = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("inviteLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!invite || !invite.active || invite.expiresAt < Date.now() || invite.usedAt) return null;
    const client = await ctx.db.get(invite.clientId);
    if (!client) return null;
    return {
      inviteId: invite._id,
      clientId: invite.clientId,
      email: client.email,
      clientName: client.name,
    };
  },
});

export const redeemInternal = internalMutation({
  args: {
    inviteId: v.id("inviteLinks"),
    clientId: v.id("clients"),
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .first();
    if (existingUser) throw new Error("Zugang existiert bereits");

    const emailTaken = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (emailTaken) throw new Error("E-Mail-Adresse bereits vergeben");

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
      role: "client" as const,
      clientId: args.clientId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.inviteId, {
      usedAt: Date.now(),
      usedBy: userId,
      active: false,
    });

    await ctx.db.insert("sessions", {
      userId,
      token: args.sessionToken,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "invite_redeemed",
        title: "Neuer Kundenzugang",
        message: `${args.name} hat sich über den Einladungslink registriert.`,
        targetType: "client",
        targetId: args.clientId,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { userId, token: args.sessionToken, name: args.name };
  },
});
