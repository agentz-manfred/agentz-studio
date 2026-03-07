import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value ?? null;
  },
});

// Settings can only be changed by admins
export const set = mutation({
  args: { token: v.string(), key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
      });
    }
  },
});
