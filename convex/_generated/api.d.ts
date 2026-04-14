/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agencyOutreach from "../agencyOutreach.js";
import type * as applicants from "../applicants.js";
import type * as crons from "../crons.js";
import type * as designers from "../designers.js";
import type * as jobs from "../jobs.js";
import type * as outreach from "../outreach.js";
import type * as reporting from "../reporting.js";
import type * as sponsorship from "../sponsorship.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agencyOutreach: typeof agencyOutreach;
  applicants: typeof applicants;
  crons: typeof crons;
  designers: typeof designers;
  jobs: typeof jobs;
  outreach: typeof outreach;
  reporting: typeof reporting;
  sponsorship: typeof sponsorship;
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
