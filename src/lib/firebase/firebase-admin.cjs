/**
 * CommonJS loader for firebase-admin subpaths used by Firestore writes.
 * Intentionally does NOT load firebase-admin/auth — that pulls jwks-rsa → jose
 * and crashes under CJS on Vercel (ERR_REQUIRE_ESM).
 * Auth is loaded lazily via firebase-admin-auth.cjs from getAdminAuth() only.
 */
"use strict";

module.exports = {
  app: require("firebase-admin/app"),
  firestore: require("firebase-admin/firestore")
};
