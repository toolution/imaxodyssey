---
name: one-page-seo
description: Audit, score, and optimize one web page for one primary keyword using a fixed Chinese On Page SEO report, a 126-point raw rubric normalized to 100, n-gram density evidence, heading analysis, and exact replacement copy. Use for "one page SEO", "单页 SEO", "页面 SEO 体检", a URL plus target keyword, requests to improve Title/Description/H1/body focus, or requests to fix every SEO warning or failure on a specific page. This is the single-page execution layer over seo-audit; use seo-audit alone for site-wide or open-ended SEO diagnosis.
---

# One Page SEO

Audit one indexable page against one explicit primary keyword, then provide evidence-backed fixes in Chinese.

## Required inputs

Obtain both:

- One page URL, rendered page, or local page source.
- One primary keyword or keyphrase.

Infer an input only when the user has made it unambiguous. If the URL or keyword is genuinely missing, ask for it instead of inventing a target.

## Authority and scope

- Apply the evidence and technical cautions from `seo-audit`. This skill overrides its scoring and output format only for a single-page audit.
- Limit conclusions to On Page SEO. Do not claim that a high score guarantees rankings.
- Do not score authority, backlinks, domain age, Search Console performance, or user behavior unless separately requested.
- Read [references/scoring-rubric.md](references/scoring-rubric.md) before scoring.
- Read [references/report-template.md](references/report-template.md) before writing the report.

## Evidence rules

Use the best evidence available and distinguish these surfaces:

1. Fetch the raw HTTP response to measure status, redirects, response time, response bytes, headers, and server-delivered HTML.
2. Inspect the rendered DOM for visible text, headings, links, images, interactive elements, social tags, and JSON-LD.
3. Fetch same-origin `/robots.txt` and the declared sitemap when reachable.
4. Use live search evidence for the optional SERP Sitelinks observation. If search is unavailable, mark it unverified and keep it unscored.

Never report that schema is absent from `curl`, a text extraction tool, or stripped HTML alone. JSON-LD may be injected by JavaScript; verify it in a rendered browser or a rich-results tool.

If a required scored item cannot be verified, label it `[⚠] 未验证`, state the missing evidence, and show the overall score as `待验证` rather than awarding assumed points.

## Extraction rules

- Remove `script`, `style`, template, hidden, and non-rendered text before content analysis.
- Use the page's visible textual content consistently for word count and density. State when boilerplate navigation/footer text is included.
- Count Latin-script words by token. Count each CJK character as one content unit. For Title and Description length, count a CJK character as two units and other characters as one.
- Match keywords case-insensitively after normalizing whitespace and punctuation. For URL matching, also compare the phrase with spaces and separators removed.
- Count internal/external links by resolved origin. Evaluate anchor quality by accessible name, not visible text alone.
- Treat `alt=""` as valid only for decorative images. Treat below-the-fold images as lazy-load candidates; do not penalize an intentionally eager LCP image.
- Build the heading outline from the rendered `h1` through `h6` elements in DOM order.
- For density, show both frequency density and occupancy density: `count / content units` and `count * n / content units`.

## Workflow

1. Record the page, keyword, current Title, current Description, response facts, word count, link count, and image count.
2. Extract every item required by the scoring rubric and retain the evidence used for each verdict.
3. Calculate category raw scores out of 126 and normalize the overall score to 100 as specified in the rubric.
4. Calculate topic focus separately. Do not add topic focus or informational observations to the raw score.
5. Produce the report in the exact section order from the report template.
6. Fix every `[✕]` and `[⚠]` item with a concrete recommendation. Give exact replacement copy for Title, Meta Description, H1, and any body passage that needs revision.
7. Preserve good copy. Do not rewrite passing content merely to create activity; label nonessential ideas as optional tests.
8. Keep the primary keyword natural. Prefer entities, attributes, questions, and search-intent vocabulary over mechanical repetition.

## Recommendation rules

- Put the exact primary keyword near the start of Title when natural.
- Include the exact keyword once in Meta Description, H1, and the first 100 content units when it reads naturally.
- Use the keyword or its meaningful terms in selected H2/H3 headings, not every heading.
- Rewrite only the passages responsible for weak intent coverage, thin content, poor structure, or stuffing.
- For each rewritten passage, identify its location, show the recommended replacement, and explain the SEO purpose in one sentence.
- If the page already has no failures or warnings, say that no mandatory rewrite is required. Offer only evidence-based optional tests and do not promise a gain.

## Implementation mode

When the user asks to apply the fixes to a local project, edit the relevant source and translations according to that project's instructions, then run its required build or verification command. When the user asks only for an audit or report, do not modify files.

