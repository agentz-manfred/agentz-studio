"use node";
/**
 * Invite redeem action — uses bcrypt for password hashing.
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

export const redeem = action({
  args: {
    token: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    if (args.password.length < 6) throw new Error("Passwort muss mindestens 6 Zeichen haben");

    const data = await ctx.runQuery(internal.invitesInternal.validateInvite, { token: args.token });
    if (!data) throw new Error("Ungültige oder abgelaufene Einladung");

    const passwordHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS);
    const sessionToken = generateSecureToken();

    return await ctx.runMutation(internal.invitesInternal.redeemInternal, {
      inviteId: data.inviteId,
      clientId: data.clientId,
      email: data.email,
      passwordHash,
      name: args.name || data.clientName,
      sessionToken,
    });
  },
});
