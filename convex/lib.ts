import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Authenticate a user by session token.
 * Returns the user document or throws if invalid.
 */
export async function authenticate(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Nicht authentifiziert");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("Nutzer nicht gefunden");

  return user;
}

/**
 * Authenticate and require admin role.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const user = await authenticate(ctx, token);
  if (user.role !== "admin") {
    throw new Error("Nur Admins haben Zugriff");
  }
  return user;
}

/**
 * Authenticate and require admin or editor role.
 */
export async function requireEditor(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const user = await authenticate(ctx, token);
  if (user.role !== "admin" && user.role !== "editor") {
    throw new Error("Keine Berechtigung");
  }
  return user;
}
