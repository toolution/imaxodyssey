# One Page SEO Scoring Rubric

## Contents

1. Score calculation
2. Status symbols
3. Meta information: 25
4. Content quality: 19
5. Keyword optimization: 40
6. Links: 7
7. Images and media: 8
8. Social and structured data: 10
9. Technical and crawl: 17
10. Topic focus and density lists

## Score calculation

The category maxima intentionally total 126 raw points:

`25 + 19 + 40 + 7 + 8 + 10 + 17 = 126`

Normalize the public score to 100:

`overall = round(raw_points / 126 * 100)`

Show category scores in raw points, such as `Meta 元信息(21/25)`, and the normalized integer as `总分：83/100`.

Grades:

- A: 90-100, 优秀
- B: 80-89, 良好
- C: 70-79, 一般
- D: 60-69, 较弱
- F: 0-59, 需重点优化

Award full points only with evidence. Use proportional scoring for measurable completeness, such as alt coverage or heading keyword-token coverage. For a qualitative binary item, `[✓]` earns full points, `[⚠]` normally earns half points, and `[✕]` earns zero. State any exception next to the item.

## Status symbols

- `[✓]`: Pass; full or explicitly shown near-full score.
- `[⚠]`: Borderline, partial, or unverified; explain the exact gap.
- `[✕]`: Failed requirement; give a direct fix.
- `[ℹ]`: Informational and unscored.

## Meta information: 25

### Title, 6

- Full: unique, keyword-relevant Title with weighted length 15-60.
- Warning: weighted length 10-14 or 61-70, or the copy is vague despite valid length.
- Fail: missing, duplicated on the audited set when evidence exists, or severely malformed.

### Meta Description, 5

- Full: unique, useful description with weighted length 70-160.
- Warning: weighted length 50-69 or 161-180, or weak value communication.
- Fail: missing, duplicated on the audited set when evidence exists, or unusable.

### Canonical, 3

- Full: one absolute self-referencing canonical matching the final indexable URL.
- Warning: canonical exists but has a normalization mismatch or unverifiable target.
- Fail: absent, multiple conflicting canonicals, or points elsewhere incorrectly.

### Robots directive, 3

- Full: no restrictive directive for a page intended to rank.
- Fail: `noindex`, blocking `X-Robots-Tag`, or another conflicting restriction.

### Viewport, 3

- Full: a valid mobile viewport declaration.
- Fail: absent or unusable.

### Charset, 2

- Full: charset is declared correctly.
- Fail: absent or conflicting.

### HTML lang, 2

- Full: a valid `lang` matching the page language.
- Warning: present but mismatched or overly generic for the actual content.
- Fail: absent.

### Favicon, 1

- Full: a usable icon declaration exists.
- Fail: no icon declaration found.

## Content quality: 19

### H1, 5

- Full: exactly one visible, descriptive H1 of reasonable length.
- Warning: one H1 exists but is vague, empty-looking, or excessively long.
- Fail: missing or multiple competing H1 elements.

Keyword presence in H1 is scored separately.

### Heading hierarchy, 3

- Full: descriptive headings follow a coherent H1 to H2 to H3 hierarchy without structural skips that harm comprehension.
- Warning: isolated skips, styling-only headings, or weak labels.
- Fail: no meaningful section structure on a page that requires it.

### Content length, 5

- Full: 1200-1800 content units.
- 4 points: 900-1199 or 1801-2500.
- 2 points: 500-899 or very long content whose additional length is mostly repetitive.
- 0 points: under 500 with insufficient intent coverage.

Do not penalize genuinely useful long-form content solely for exceeding 1800; judge repetition and intent coverage.

### Rendering, 3

- Full: primary content is present in the initial HTML through SSR or prerendering.
- Warning: essential sections depend partly on client rendering.
- Fail: the initial HTML contains little or none of the indexable main content.

### Text-to-HTML ratio, 3

- Full: visible text is at least 10% of HTML bytes.
- Warning: 5% to under 10%.
- Fail: under 5%.

Report the ratio as directional evidence, not a Google ranking factor.

### Informational conversion observation

Report interaction/CTA availability as `[ℹ]` only. Content or article pages may not need a CTA. For tools or games, verify that the primary experience is actually usable on the page.

## Keyword optimization: 40

### Exact keyword in Title, 8

- Full: the normalized exact phrase appears in Title, preferably near the beginning.
- Half: all meaningful tokens appear but not as a coherent phrase.
- Fail: absent.

### Exact keyword in Description, 4

Use the same full/half/fail logic.

### Exact keyword in H1, 8

Use the same full/half/fail logic.

### Keyword terms in H2/H3, 3

Score proportionally by coverage of distinct meaningful keyword tokens across H2/H3. Full points require natural coverage, not repetition in every heading.

### Keyword in URL, 2

- Full: the normalized exact phrase appears in the hostname or path, including an exact-match-domain form with separators removed.
- Half: all meaningful tokens appear separately and naturally.
- Fail: absent.

### Exact keyword in first 100 content units, 3

- Full: exact phrase appears naturally.
- Half: all meaningful tokens appear without the phrase.
- Fail: absent.

### Keyword density, 2

For a single-word keyword:

- Full: 3%-5% frequency density.
- Warning: 1%-2.99% or 5.01%-7%.
- Fail: below 1% or above 7%, subject to a manual stuffing check.

For a multi-word keyword, use occupancy density:

- Full: exact phrase is present and occupancy density is 0.5%-5% without unnatural repetition.
- Warning: 0.1%-0.49% or 5.01%-7%.
- Fail: absent or clearly stuffed above 7%.

Do not force multi-word exact phrases to 3%-5%. Use the density-list score as the stronger topical-focus signal.

### Density-list position-weighted coverage, 10

Prefer the value from the page analyzer that produced the source report, preserving its evidence and calculation. Otherwise use this fallback:

1. Generate top-10 n-grams for n=1 through n=5 from normalized visible content. Do not remove stop words, because the displayed list must reflect the page's actual repeated phrasing.
2. Use raw bucket maxima of 8, 8, 8, 3, and 3 for n=1 through n=5. These total 30 and are scaled to 10.
3. For the 1-gram bucket, find the best rank for each distinct meaningful keyword token. Missing tokens receive zero. Found tokens receive `rank_factor = 1 - 0.008 * (rank - 1)`. Multiply the average factor by 8.
4. For n=2 through n=5, award the bucket maximum when an n-gram containing the complete keyword token sequence ranks in the top three. Otherwise score the two best related n-grams by `relevance * rank_factor`, where relevance is 1.0 for the complete token sequence, 0.5 for at least half of meaningful keyword tokens in order, and 0.25 for one explicitly listed close topic term. Divide by two and cap at the bucket maximum.
5. Calculate `density_list_score = sum(bucket_scores) / 30 * 10` and round to two decimals.
6. Show the matching ranks and bucket evidence. List any manually chosen close topic terms so the score is reproducible.

The fallback intentionally rewards broad 1-to-5-word topical coverage while making an exact phrase near the top of a longer n-gram bucket sufficient. Do not hide the fallback method.

## Links: 7

### Internal links, 3

- Full: at least three useful, crawlable internal links with logical destinations.
- Warning: one or two, or important destinations are buried.
- Fail: none on a page that should connect to the site.

### Anchor quality, 3

Score proportionally by links with a descriptive accessible name. Penalize empty, generic, duplicated, or misleading anchors when they dominate.

### New-window external-link safety, 1

- Full: every `target="_blank"` external link includes `noopener` or an equivalent safe relationship.
- Fail: any unsafe new-window link exists.

Report external-link and `nofollow` counts as `[ℹ]` only.

## Images and media: 8

### Alt attributes, 5

Score proportionally across meaningful images. Decorative images with `alt=""` pass. Missing or misleading alt text fails that image.

### Width and height, 2

Score proportionally across images with intrinsic `width` and `height` or an equivalent stable aspect-ratio reservation.

### Lazy loading, 1

Full points when eligible below-the-fold images use lazy loading and the likely LCP image is not incorrectly delayed.

## Social and structured data: 10

### Open Graph, 4

Score required `og:title`, `og:description`, and `og:image` proportionally. Verify the image URL is usable when possible.

### Twitter/X card, 2

Full points for a valid `twitter:card`, preferably `summary_large_image` for content with a suitable image, plus usable supporting tags or OG fallbacks.

### JSON-LD, 4

- Full: at least one rendered, valid, relevant JSON-LD block whose claims match visible content.
- Warning: present but incomplete, invalid, duplicated, or weakly relevant.
- Fail: absent where structured data is applicable.

Verify rendered JSON-LD. Never fail this item from stripped static extraction alone.

## Technical and crawl: 17

### HTTPS, 3

Full for a valid HTTPS page without mixed-content evidence relevant to the page.

### Status and redirects, 3

- Full: final page returns 200 directly.
- Warning: one justified canonical redirect before 200.
- Fail: redirect chain, loop, soft 404, or non-200 final response.

### Response speed, 3

- Full: measured HTML response completes in at most 500ms.
- Warning: 501-1000ms.
- Fail: over 1000ms.

State that a single request is a point-in-time measurement and identify the measurement method when known.

### HTML size, 2

- Full: at most 100KB compressed response bytes when measurable.
- Warning: over 100KB through 250KB.
- Fail: over 250KB without a clear need.

### URL quality, 2

Full for a concise, stable, readable, lowercase URL without unnecessary parameters. Use a warning for avoidable complexity and fail for clearly malformed or session-dependent URLs.

### robots.txt, 2

Full when accessible and not blocking the audited page or essential assets.

### Sitemap, 2

Full when a valid sitemap is declared in robots.txt or otherwise discovered and the audited canonical URL is represented where appropriate.

Report hreflang count and validity as `[ℹ]` under this rubric. If multilingual SEO is a primary task, run a separate international SEO audit.

## Topic focus and density lists

Topic focus is a separate diagnostic percentage and does not add points. Calculate four 25% signals:

1. Exact keyword in Title.
2. Exact keyword in H1.
3. Exact keyword in the body, including the first 100 content units.
4. Density-list coverage score of at least 8/10.

Award 25 for a full signal, 12.5 for partial token coverage, and zero for absence. Round the displayed percentage to an integer.

Display the full-page 2-gram Top 10 with count, frequency density, and occupancy density. Also retain the 1-to-5-gram ranked evidence used by the density-list subscore, even if only the 2-gram list is shown in the main report.

