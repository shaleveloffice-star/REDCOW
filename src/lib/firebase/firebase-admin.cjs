/**
 * CommonJS loader for firebase-admin subpaths.
 * Next/Webpack ESM interop otherwise hits ERR_REQUIRE_ESM on Vercel.
 * Keep this file as .cjs so Node uses require() against the CJS export condition.
 */
"use strict";

module.exports = {
  app: require("firebase-admin/app"),
  auth: require("firebase-admin/auth"),
  firestore: require("firebase-admin/firestore")
};
