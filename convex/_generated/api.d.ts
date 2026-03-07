/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as comments from "../comments.js";
import type * as ideas from "../ideas.js";
import type * as invites from "../invites.js";
import type * as notifications from "../notifications.js";
import type * as scripts from "../scripts.js";
import type * as seed from "../seed.js";
import type * as shareLinks from "../shareLinks.js";
import type * as shootDates from "../shootDates.js";
import type * as videos from "../videos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  clients: typeof clients;
  comments: typeof comments;
  ideas: typeof ideas;
  invites: typeof invites;
  notifications: typeof notifications;
  scripts: typeof scripts;
  seed: typeof seed;
  shareLinks: typeof shareLinks;
  shootDates: typeof shootDates;
  videos: typeof videos;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
