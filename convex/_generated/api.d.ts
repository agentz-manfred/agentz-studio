/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as ai from "../ai.js";
import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as authInternal from "../authInternal.js";
import type * as categories from "../categories.js";
import type * as clients from "../clients.js";
import type * as comments from "../comments.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as invites from "../invites.js";
import type * as invitesActions from "../invitesActions.js";
import type * as invitesInternal from "../invitesInternal.js";
import type * as lib from "../lib.js";
import type * as maintenance from "../maintenance.js";
import type * as notifications from "../notifications.js";
import type * as scripts from "../scripts.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as shareLinks from "../shareLinks.js";
import type * as shootDates from "../shootDates.js";
import type * as videos from "../videos.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  ai: typeof ai;
  auditLog: typeof auditLog;
  auth: typeof auth;
  authActions: typeof authActions;
  authInternal: typeof authInternal;
  categories: typeof categories;
  clients: typeof clients;
  comments: typeof comments;
  crons: typeof crons;
  email: typeof email;
  folders: typeof folders;
  http: typeof http;
  ideas: typeof ideas;
  invites: typeof invites;
  invitesActions: typeof invitesActions;
  invitesInternal: typeof invitesInternal;
  lib: typeof lib;
  maintenance: typeof maintenance;
  notifications: typeof notifications;
  scripts: typeof scripts;
  seed: typeof seed;
  settings: typeof settings;
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
