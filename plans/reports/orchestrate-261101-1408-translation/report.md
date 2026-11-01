# Translation run report

Source: `eternity4719/HowToLiveBetter` revision `e2605d3e2242bd6216c9255192b8a8957a08c55a`; imported source hash `e9721f6d3d826c2ece5d00d178d1bc711340c283a9b95bc9c649e0d02a1d54a9`.

Both read-only translation jobs completed: English 154/154 batches and Vietnamese 154/154 batches, each covering 4,538 text segments across all 34 chapters and 767 entries. The authenticated Antigravity CLI supplied 107 English and 111 Vietnamese batches. Codex CLI supplied 47 English and 43 Vietnamese batches. Antigravity Flash medium/high and Codex were used for batches that failed initial validation. Prior supervised attempts failed on individual batches; resumable checkpoints allowed the final runs to finish without discarding accepted output.

The controller checked segment IDs and counts, URL markers, Markdown link destinations, nonempty output, minimum length, Chinese text remaining in prose, and source hash before assembling `public/content/en.json` and `public/content/vi.json`. Three accepted segments received source-checked corrections: one English mistranslation of “did not undergo standard treatment” and two Markdown link destinations restored to the original paths. Their batch provenance records the edits.

Validation: `npm run content:validate`, `npm test`, and `NUXT_APP_BASE_URL=/how-to-live-better/ npm run generate` passed. Desktop and 390px browser checks confirmed translated entries, search, language switch with chapter retention, mobile filters, and no horizontal overflow or JavaScript errors. A WCAG A/AA contrast audit found one shared color issue; after the CSS adjustment, the English mobile and Vietnamese desktop audits reported zero violations. The static build reports large locale chunks because it includes the full book.

Structural and link checks pass. Semantic accuracy, especially medical, legal and financial guidance, has not received qualified editorial review; both locale datasets remain marked `reviewed: false`.
