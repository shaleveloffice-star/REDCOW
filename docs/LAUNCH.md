# NB BURGER — configuration and deployment

The current application runs on Next.js 16 with Node.js 22 or newer and is hosted on Vercel. Its canonical production origin is `https://www.nbburger.co.il`. This guide describes the current password-based admin flow; older documents describing Firebase Auth modes or an admin email allowlist do not describe the active login implementation.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public origin used by canonical URLs, sitemap and JSON-LD. Use `https://www.nbburger.co.il` for production and the actual preview origin for previews. |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` | Existing Firebase Web App configuration for public content reads. All required by the current configuration check. |
| `ADMIN_PASSWORD` | Server-only shared admin password. Required in production; code enforces at least six characters. Use a long random password. `ADMIN_DEV_PASSWORD` is a development fallback only. |
| `ADMIN_SESSION_SECRET` | Server-only JWT secret, at least 32 characters. |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Server-only Admin SDK credentials for writes, private reads and shared rate limiting. Client and Admin must point to the same project. Escaped `\n` in the key is supported. |
| `BLOB_READ_WRITE_TOKEN` | Existing Vercel Blob upload token. The code also supports the existing Vercel OIDC/store binding; retain those settings when already configured. |
| `BLOB_STORE_ID` | Optional explicit Blob store identifier. |
| `OPENAI_API_KEY` | Server-only key for the existing story generation/suggestion tools. Retain existing optional model overrides. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` | Existing email provider and sender configuration. Sender name defaults to NB BURGER. |
| `GOOGLE_CLOUD_TRANSLATION_API_KEY` | Optional existing translation integration. Automatic translation remains disabled in code. |

Do not replace existing deployment credentials while applying maintenance fixes. `.env*` and service-account files stay outside Git. The login flow does not use `ADMIN_AUTH_MODE`, `ADMIN_ALLOWED_EMAILS`, or Firebase Authentication.

## Firestore

The application uses public client reads for content and Admin SDK writes. The checked-in `firestore.rules` and example cover the current public collections, including SEO, stories, gallery and the announcement popup. Private collections remain denied to browser clients. A local edit to the rules does not change deployed rules.

Transactional maintenance writes also use `_mutationLocks` as private guard documents and `rateLimits` as private shared counters. Both are accessed only through Admin SDK. Rate-limit documents include `expiresAt`; optionally enable Firestore TTL for that field to remove expired counters. Expiry is checked in application code and does not depend on TTL timing.

Publish rules to the intended Firebase project only as part of an authorized deployment, for example:

```sh
firebase deploy --only firestore:rules --project YOUR_EXISTING_PROJECT_ID
```

No database migration or reseeding is required for the maintenance changes. `previousSlugs`, campaign leases and delivery checkpoints are additive fields. Existing document IDs and collection names remain supported. Do not automatically retry legacy email campaigns stuck in `sending` without a lease: first inspect provider delivery history.

## Build and deploy

1. Run `npm run lint`, `npm test`, and `npm run build` locally.
2. Retain the existing Vercel project, Git connection, production branch and external integrations. Use Node.js 22 or newer.
3. Confirm the existing production domain redirects to `www.nbburger.co.il`, matching canonical URLs. Do not change DNS merely to apply code fixes.
4. Deploy code and publish the reviewed Firestore rules to the matching project when authorized.
5. Verify admin login, public CMS reads and an approved save/refresh scenario in the deployed environment. Use a test recipient only when a live delivery test is explicitly authorized.

`npm run build` and the automated tests do not deploy anything. In-memory Firestore tests verify application transaction behavior; they are not a substitute for checking production credentials or deployed rules.

## Local data and recovery

JSON collection and document stores distinguish a missing file from corrupt JSON. Missing files read defaults without writing. Corrupt files raise an error and are preserved. Writes use a temporary file followed by an atomic replacement; concurrent writes in the same process are serialized. Local JSON is intended for one development server, not a multi-instance production database.

Paired menu-category and SEO writes are a single Firestore transaction. Local development uses serialization and compensation if the second file write fails; a process or machine crash across two local files is not a database transaction.

Email requests claim a campaign before delivery, checkpoint recipients and reuse provider idempotency keys during recovery. An expired lease can be reclaimed by retrying the same request. Uncertain deliveries older than 23 hours are marked for manual review rather than automatically replayed beyond the provider's idempotency window. No scheduler or automatic mailing job has been added.
