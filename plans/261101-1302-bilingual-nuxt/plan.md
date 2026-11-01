# English and Vietnamese HowToLiveBetter

Status: partial implementation; content translation and publication blocked by provider HTTP 429.

## Outcome
Create a Nuxt website and GitHub repository based on eternity4719/HowToLiveBetter, with complete English and Vietnamese translations of the website's book content.

## Constraints and non-goals
Preserve source evidence ratings, monetary units, jurisdiction, references, entry identities and licensing. Attribute the author and mark translated adaptations. No unrequested reinterpretation of Chinese medical/legal/financial guidance. No backend, accounts or paid features.

## Phases
1. Inspect upstream source/license and record a pinned revision.
2. Import all 34 chapters and 767 entries, retaining metadata and source links.
3. Translate content into English and Vietnamese; validate completeness, numeric values and links. Google machine translation attempted; batch service returns HTTP 429. A provisioned provider or human translation is required.
4. Implement responsive Nuxt reader with language switching, chapter navigation, search and source-equivalent filters.
5. Validate content, behavior, static generation and desktop/mobile rendering; review.
6. Create GitHub repository, configure Pages and verify deployment. Repository created: https://github.com/hoanghadu/how-to-live-better. No Pages release yet.

## Acceptance
- Both languages contain the complete imported book, not excerpts or placeholder text.
- Language switches preserve the selected chapter; filtering/search work on translated text.
- Source links, attribution and translation status remain visible.
- Static build works under a GitHub Pages repository subpath.
- Repository and live URL are reported only after verified creation/deployment.

## Verified progress
- Imported all 34 chapters and 767 entries with pinned provenance and licenses.
- Implemented EN/VI interface, full reader and filters, pagination, source links and explicit missing-translation state.
- Six source-data/filter tests pass. Nuxt production compilation passes.
- Desktop 1280px and mobile 390px pending-state UI inspected; language switch works, no horizontal overflow or JavaScript errors recorded.
- Complete translated reader UI remains unverified because locale files are absent.
- Content validation fails explicitly on missing English translation; deployment workflow preserves this gate.
- Independent simplification/review completed; reused Markdown renderer and clearer catalog iteration.
