# Live Better · Sống tốt hơn

Nuxt 4 adaptation of [HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter) by eternity4719, intended for English and Vietnamese readers.

**Status: in development.** The complete Chinese source (34 chapters, 767 entries) is imported. The bilingual interface and filtering implementation are present. Complete English and Vietnamese book translations are not yet available: the public machine translation endpoint returned HTTP 429 during batch translation. The app explicitly shows a translation-pending message; it never labels untranslated Chinese text as English or Vietnamese. Publication is blocked until both locale datasets pass validation.

## Run

Requires Node.js 24 and npm. No database or account service is used.

```sh
npm ci
npm run dev
npm test
npm run generate
```

Development uses port 3000. `/vi` is the default landing route; `/en` is English. The generated static website is in `.output/public`. The application can compile while translations are missing, but this is a development preview, not a complete content release.

## Content and translation

- Original snapshot: [upstream/book](upstream/book), pinned to upstream revision `e2605d3e2242bd6216c9255192b8a8957a08c55a`.
- Import: `npm run content:import` regenerates `public/content/zh-CN.json` and its manifest.
- Translation: `python3 scripts/translate-content.py en vi` caches successful fields under `docs/translation-cache/` and writes complete locale files only after all fields succeed. The public Google endpoint has no guaranteed capacity and currently returns 429; a provisioned provider or human translation is needed to proceed reliably.
- Validation: `npm run content:validate` requires both complete locales, matching source revisions, all chapter/entry IDs, metadata, nonempty translations and unchanged reference URLs.
- Validation checks structure and link integrity, not medical/legal accuracy or semantic equivalence. Machine translations remain clearly marked as unreviewed until editorial work is actually performed.

Preserve Chinese jurisdiction, currency and original evidence ratings. Do not silently localize laws, emergency numbers, treatment instructions or financial claims to another country. Each entry links to its pinned source chapter; the entry ID identifies its chapter and original item number.

Search ignores Vietnamese accents. Filters use OR within each group and AND across groups. Audience tags retain upstream comma-OR / plus-AND semantics. Untagged entries apply to everyone. The reader paginates 15 entries at a time.

## GitHub Pages

Repository: [hoanghadu/how-to-live-better](https://github.com/hoanghadu/how-to-live-better). The checks workflow tests and statically generates the app under `/how-to-live-better/`. The separate manual deployment workflow requires complete translations before uploading any Pages artifact. Enable **Settings → Pages → GitHub Actions**, then run **Publish complete translations to Pages** after content validation passes.

For another repository name, change `NUXT_APP_BASE_URL` in both workflows. Local generation defaults to `/`. A custom domain usually requires `/` instead of a repository prefix.

## Attribution and licenses

Original author: eternity4719. Original project: [HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter). Original website: [Chinese edition](https://eternity4719.github.io/HowToLiveBetter/).

Book content and translated adaptations are provided under [CC BY 4.0](upstream/LICENSE). Original software is under [MIT](upstream/LICENSE-CODE). This adaptation changes the frontend to Nuxt, adds English/Vietnamese UI, and prepares the translation pipeline. Source claims and ratings belong to the original author; this project does not represent an independent verification of them. Original README and book files are retained unchanged for provenance.

## Verification limits

The content release gate currently fails because the two complete translations are missing. Reader filters are tested against the real imported source. Full translated reader rendering cannot be verified until actual locale datasets exist.

The dependency audit reported low/moderate transitive tooling advisories (deepmerge, glob and minimatch), with npm proposing a Nuxt downgrade. The site publishes static files, does not accept arbitrary compilation inputs and has no production Node server; no forced downgrade was applied. Recheck the audit when updating Nuxt.
