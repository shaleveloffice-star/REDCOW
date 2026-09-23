# SO WHAT domain and brand migration

Prepared 2026-09-23. Canonical origin: **https://www.sowhat.co.il**. Public brand: **SO WHAT**; full name: **SO WHAT BURGER**. Code/local environment updated; no push, deployment, DNS change or production database write was performed.

## Changes and preservation

- Completed the existing partial rebrand, normalized the incoming `SO WHAT?` spelling to `SO WHAT`, and retained genuine question punctuation. No redesign or unrelated SEO rewrite.
- `src/data/site-domain.ts` is the single canonical origin and exact owned-host allowlist. Stale environment values cannot bring back old-domain/preview/localhost canonicals.
- `src/lib/brand-migration.ts`, public Firestore read adapters and the SEO repository project legacy CMS display text/owned URLs into the new brand without bulk database writes. IDs, slugs, historical aliases, private records, external accounts and API identifiers are preserved. Name-derived menu/story slugs are frozen before renaming their display text.
- Metadata, titles, descriptions, image alt text, Open Graph/Twitter, JSON-LD and the web manifest use the new brand/domain. Added WebSite schema and SO WHAT BURGER alternateName. Existing Restaurant, Organization, Menu, Breadcrumb and FAQ rendering retains existing factual content. SEO text including המבורגר רעננה, המבורגר ברעננה, המבורגר כשר רעננה, מסעדה כשרה ברעננה, מסעדה ברעננה is preserved by regression tests.
- Sitemap and robots derive from the shared SEO origin; no separate hardcoded XML/text file needs editing. The sitemap continues excluding disabled/non-indexable content. Admin routes remain blocked in robots.
- Public cache keys have a migration suffix to prevent previous cached branding from surviving deployment; invalidation tags and admin APIs are unchanged.
- Updated package identity, `.env.example`, README and launch guidance. Ignored `.env.local` uses the new application URL and sender display name; credentials and verified sender addresses are unchanged.
- Changed implementation files: `next.config.ts`, `package.json`, `package-lock.json`, `src/app/layout.tsx`, `src/app/manifest.ts`, `src/data/business.ts`, `src/data/site-domain.ts`, `src/lib/brand-migration.ts`, `src/lib/cache/cached-data.ts`, `src/lib/email/resend-client.ts`, `src/lib/firebase/firestore-store.ts`, `src/lib/seo.ts`, `src/lib/seo/json-ld.ts`, `src/repositories/seo-content.repository.ts`. Tests, smoke/audit scripts and this report accompany them. Some supplied working-tree edits resolve back to the existing committed text when removing the temporary brand question mark.

## URLs and redirects

| Before | After |
|---|---|
| https://www.nbburger.co.il/ | https://www.sowhat.co.il/ |
| https://nbburger.co.il/menu | https://www.sowhat.co.il/menu |
| https://www.nbburger.co.il/kosher | https://www.sowhat.co.il/kosher |
| https://www.nbburger.co.il/locations | https://www.sowhat.co.il/locations |
| https://www.nbburger.co.il/menu/nb-burger-klasi?utm_source=instagram | https://www.sowhat.co.il/menu/nb-burger-klasi?utm_source=instagram |

`next.config.ts` returns permanent **308** redirects for both old-domain variants and the new apex `sowhat.co.il`, retaining paths and query strings. Existing `/branches`, `/menu/category/:slug` and marketing short links are combined with the domain move; trailing slash normalization also goes directly to the new destination. New-domain canonical URLs do not redirect back. Existing dynamic historical product/story aliases can still perform their own pre-existing canonical-slug redirect after the domain hop; the move does not delete those aliases or change canonical slugs. Existing external redirects at the hosting layer must be checked separately. Query preservation and host conditions follow [Next.js redirect behavior](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects).

## Artwork still required

No replacement SO WHAT logo/icon artwork was found. Existing files were deliberately retained; their filenames remain valid. The visible NB artwork means the visual rebrand is **not yet complete**.

- Source logo/icon: `brand-sources/nb-burger-logo-source.png`, `brand-sources/nb-burger-icon-source.png`.
- Site logo/wordmarks: `public/images/brand/nb-burger-logo.png`, `nb-burger-wordmark-{dark,light,alpha}.{png,webp}`; loading marks `nb-loading-mark.png`, `nb-burger-loading.png`.
- Club artwork: `public/images/brand/nb-club*.png` (NB CLUB appears on the card).
- Favicons/app icons: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`, `public/favicon.ico`, `public/icon.png`, `public/apple-touch-icon.png`, `public/icons/icon-{16,32,48,192,512}.png` where present.
- Review/replace `public/videos/hero-nb-experience.{mp4,webm}` and CMS hero media showing NB signage; mobile menu preview confirms the old sign is visible.
- Default OG burger photograph `public/images/hero/nb-burger-hero.webp` has no printed old logo and can remain; its public URL now uses the new origin. Upload a new branded share image if desired.

Use approved artwork with the existing dimensions/paths or update the central asset registry; bump the existing brand asset cache version after replacing actual artwork. Do not rename image URLs solely for cosmetic filename changes.

## Validation

- `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` passed (43 tests). The project's lint command is TypeScript unused-code checking, not ESLint.
- `node scripts/smoke-brand-migration.mjs http://127.0.0.1:3149`: 49 indexable pages, 49 unique titles/canonicals, 185 JSON-LD blocks, 24 migration redirects, 49 internal link destinations, 14 referenced local images; zero failures. Results: `REBRAND-HTTP-AUDIT.json`.
- `node scripts/smoke-local.mjs http://127.0.0.1:3149`: all 49 public pages plus existing admin protection, case redirect and missing-story checks passed.
- Headless Chrome: home, menu, kosher, locations, burger category/product, privacy, terms and accessibility at desktop/mobile widths (18 page visits); no uncaught JavaScript errors or horizontal overflow. Results: `REBRAND-BROWSER-AUDIT.json`. Inspected mobile screenshots and contact/footer content. The external Maps iframe did not render in this local browser; its existing URL was preserved and needs a live-browser check. No standalone `/contact` route exists; existing contact links/locations were checked without inventing a new route.
- Final old-reference inventory: `REBRAND-REFERENCES-AFTER.md`, generated by `node scripts/audit-brand-references.mjs`, explains each remaining text match. Before-change inventory: `REBRAND-INVENTORY-BEFORE.txt`.
- `git diff --check` passed. No test sent emails, changed production records, pushed or deployed.

## Manual cutover: Vercel / DNS

1. In the **existing Vercel project**, Settings → Domains, add `www.sowhat.co.il` and `sowhat.co.il`. Keep `nbburger.co.il` and `www.nbburger.co.il` connected to that same project so its host redirects receive requests. Set the new www domain as primary; remove any conflicting old-apex → old-www redirect to avoid an additional hosting-level hop. Use a direct permanent redirect to the new www host if choosing Vercel's domain redirect instead of the code rule. See [Vercel domain setup](https://vercel.com/docs/domains/set-up-custom-domain) and [domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting).
2. At the DNS provider, enter the exact A/CNAME/TXT records Vercel displays for these domains; no guessed IP/target. Confirm certificate issuance and HTTP/HTTPS availability for all four hostname variants.
3. Vercel Settings → Environment Variables: set `NEXT_PUBLIC_APP_URL=https://www.sowhat.co.il`, sender display `RESEND_FROM_NAME=SO WHAT`; keep existing Firebase, Blob, OpenAI, Resend and analytics credentials/IDs. Keep preview deployments protected from indexing. Deploy only with explicit authorization.
4. After deployment, repeat the audit against live URLs with real DNS: old menu/kosher/product paths and query strings should reach matching new pages; verify no infrastructure-level loops/chains, 404s or accidental noindex. Local tests do not verify DNS, certificates or hosting configuration.

## Google and connected accounts

- Search Console: verify both old/new domain properties with the appropriate DNS TXT records, submit the Change of Address from the old property after redirects work, submit `https://www.sowhat.co.il/sitemap.xml`, inspect important URLs and monitor indexing/404s. Keep old redirects at least a year, ideally longer; [Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
- Google Business Profile: update the existing listing's name to SO WHAT and website to the new URL, preserving the listing/reviews/address. Do not create a duplicate listing just for the rebrand.
- GA4 `G-2TM782BRGC` and `public/google7ce41620fdd3f55a.html` verification remain unchanged. GA records the current browser page URL. No independent GTM container, Meta Pixel or TikTok Pixel integration was found. Update the GA4 web-stream website URL in Analytics and review existing reports/referrals after cutover.
- Existing `official.nbburger@gmail.com`, Instagram `nbburgeril`, TikTok `@nb.burg`, Facebook listing and verified email sender are preserved. Supply approved replacement accounts before switching. Changing sender domain requires verification in Resend/DNS first. Internal `admin@nbburger.co.il`, Blob resource names, schema identifiers and persistent storage keys remain for compatibility.

## SEO risks / limitations

No new 404, duplicate title/canonical, old-origin canonical/schema/sitemap, accidental public noindex or loop was found in the local audit. Existing slugs, SEO phrases and external integrations remain intact. Domain moves can still cause temporary ranking fluctuations; no ranking guarantee is possible. Main outstanding risks are missing approved artwork, incomplete hosting/DNS redirects, and any production-only CMS override not present locally. Local Firebase/Blob are not configured for live data, so production content must be checked after authorized deployment; the read projection is tested with legacy CMS fixtures and never bulk-overwrites the database.
