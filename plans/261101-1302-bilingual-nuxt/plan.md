# English and Vietnamese HowToLiveBetter

Status: complete; GitHub Pages deployment verified.

## Outcome
Create a Nuxt website and GitHub repository based on eternity4719/HowToLiveBetter, with complete English and Vietnamese translations of the website's book content.

## Constraints and non-goals
Preserve source evidence ratings, monetary units, jurisdiction, references, entry identities and licensing. Attribute the author and mark translated adaptations. No unrequested reinterpretation of Chinese medical/legal/financial guidance. No backend, accounts or paid features.

## Phases
1. Inspect upstream source/license and record a pinned revision.
2. Import all 34 chapters and 767 entries, retaining metadata and source links.
3. Translate content into English and Vietnamese; validate completeness and links. The public Google endpoint returned HTTP 429, so resumable batches ran through authenticated Antigravity CLI, with Codex CLI as a fallback.
4. Implement responsive Nuxt reader with language switching, chapter navigation, search and source-equivalent filters.
5. Validate content, behavior, static generation and desktop/mobile rendering; review.
6. Create GitHub repository, configure Pages and verify deployment. Repository: https://github.com/hoanghadu/how-to-live-better. Live site: https://hoanghadu.github.io/how-to-live-better/.

## Acceptance
- Both languages contain the complete imported book, not excerpts or placeholder text.
- Language switches preserve the selected chapter; filtering/search work on translated text.
- Source links, attribution and translation status remain visible.
- Static build works under a GitHub Pages repository subpath.
- Repository and live URL are reported only after verified creation/deployment.

## Verified progress
- Imported all 34 chapters and 767 entries with pinned provenance and licenses.
- Implemented EN/VI interface, full reader and filters, pagination, source links and explicit missing-translation state.
- Both locale files contain 154/154 accepted batches, 4,538 translated segments, all 34 chapters and 767 entries. CLI provenance is in the translation run report; both datasets are marked unreviewed.
- `npm run content:validate`, six source-data/filter tests and static Nuxt generation pass.
- Desktop 1280px and mobile 390px translated reader inspected; language switch preserves chapter 10, search works, mobile filters open, no horizontal overflow or JavaScript errors recorded.
- WCAG A/AA browser audit reported zero violations after contrast correction.
- GitHub checks and Pages deployment succeeded for commit `bcf6f65`; both public language routes returned HTTP 200 and rendered translated entries without browser errors.
- Independent simplification/review completed; reused Markdown renderer and clearer catalog iteration.
