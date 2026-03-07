import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  folders: defineTable({
    name: v.string(),
    parentId: v.optional(v.id("folders")),
    clientId: v.optional(v.id("clients")),
    clientVisible: v.optional(v.boolean()),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_parent", ["parentId"])
    .index("by_client", ["clientId"]),


  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    clientId: v.optional(v.id("clients")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  clients: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    // Extended profile
    contractStart: v.optional(v.string()), // ISO date
    contractEnd: v.optional(v.string()), // ISO date
    platforms: v.optional(v.array(v.string())), // ["tiktok","instagram","youtube"]
    mainPlatform: v.optional(v.string()),
    videosPerMonth: v.optional(v.number()),
    context: v.optional(v.string()), // Rich text / WYSIWYG content (HTML)
    createdAt: v.number(),
  }),

  categories: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    color: v.string(), // hex color
    order: v.number(),
    createdAt: v.number(),
  }).index("by_client", ["clientId"]),

  ideas: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    categoryId: v.optional(v.id("categories")),
    order: v.number(),
    scheduledPublishDate: v.optional(v.string()), // ISO date YYYY-MM-DD
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"]),

  scripts: defineTable({
    ideaId: v.id("ideas"),
    content: v.string(),
    version: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_idea", ["ideaId"]),

  shootDates: defineTable({
    clientId: v.id("clients"),
    ideaIds: v.array(v.id("ideas")),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_client", ["clientId"]),

  videos: defineTable({
    ideaId: v.optional(v.id("ideas")),
    folderId: v.optional(v.id("folders")),
    clientId: v.optional(v.id("clients")),
    clientVisible: v.optional(v.boolean()),
    bunnyVideoId: v.optional(v.string()),
    bunnyUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    title: v.string(),
    status: v.string(),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_folder", ["folderId"])
    .index("by_client", ["clientId"]),

  comments: defineTable({
    targetType: v.union(
      v.literal("idea"),
      v.literal("script"),
      v.literal("video")
    ),
    targetId: v.string(),
    userId: v.id("users"),
    content: v.string(),
    timestamp: v.optional(v.number()),
    parentId: v.optional(v.id("comments")),
    resolved: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_target", ["targetType", "targetId"])
    .index("by_parent", ["parentId"]),

  statusUpdates: defineTable({
    ideaId: v.id("ideas"),
    fromStatus: v.string(),
    toStatus: v.string(),
    userId: v.id("users"),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_idea", ["ideaId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),

  shareLinks: defineTable({
    videoId: v.id("videos"),
    token: v.string(),
    createdBy: v.id("users"),
    expiresAt: v.optional(v.number()),
    password: v.optional(v.string()),
    viewCount: v.number(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_video", ["videoId"]),

  inviteLinks: defineTable({
    clientId: v.id("clients"),
    token: v.string(),
    createdBy: v.id("users"),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedBy: v.optional(v.id("users")),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_client", ["clientId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
