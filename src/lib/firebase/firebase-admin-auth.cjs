/**
 * Lazy CommonJS loader for firebase-admin/auth only.
 * Loaded from getAdminAuth() — never from Firestore menu/admin write paths.
 */
"use strict";

module.exports = require("firebase-admin/auth");
