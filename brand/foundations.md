# Foundations — Calia Lab v1
Source of truth: `assets/tokens.css`. Moodboard approved: Bold & Playful. This guide is a standalone system; do not import into the live app without a separate reviewed change.
## Color
Primitives: lime, cobalt, coral, lilac, pink, cream, charcoal, white, all prefixed `--calia-`. Semantic roles: `--color-bg` cream, `--color-surface` white, `--color-text` charcoal, `--color-action` cobalt, `--color-on-action` white, `--color-highlight` lime, `--color-accent` coral, `--color-secondary` lilac, `--color-play` pink, `--color-border` charcoal, `--color-focus` cobalt.
## Contrast measurements (WCAG formula, normal text ≥4.5:1; large text ≥3:1)
| Text / Background | Contrast | Rule |
| --- | ---: | --- |
| charcoal / cream | 14.82:1 | AA/AAA normal |
| charcoal / lime | 14.49:1 | AA/AAA normal |
| white / cobalt | 5.87:1 | AA normal |
| charcoal / coral | 5.85:1 | AA normal |
| white / coral | 2.85:1 | FAIL even for large text; never use |
| charcoal / white | 16.67:1 | AA/AAA normal |
Note: approximate ratios; verify with automated contrast tooling before production. Avoid typography directly on photographs without an opaque or verified overlay.
## Typography
Display: Sora Bold/ExtraBold headlines only, not paragraph text. Body: Inter Regular 400 and Medium 500, forms, descriptions, articles and buttons. Accent: Sora Semibold for small labels, stickers and kickers only. Avoid additional font families.
| Style | Size / line height | Role |
| --- | --- | --- |
| Display XL | 64 / 72 px | Hero desktop |
| Display L | 48 / 54 px | Hero responsive |
| H1 | 32 / 38 px | Page title |
| H2 | 24 / 30 px | Sections |
| H3 | 20 / 26 px | Cards |
| Body | 16 / 26 px | Reading |
| Small | 14 / 20 px | Supporting |
| Kicker | 12 / 17 px | Uppercase, tracking .2em |
## Spacing
4, 8, 12, 16, 24, 32, 48, 64, 96 px, referenced via `--space-*`. Base padding 24, section 48, hero 64.
## Shape, strokes, tilt
Radius 8 / 16 / 24 px; pill 999 px. Stroke 1 px hairline, 2 px control, 4 px expressive emphasis. Tilt decorative stickers -3° by default, never beyond ±6°. No tilt on body copy, form fields or clinical results.
## Composition
Airy cream backgrounds, bold content blocks, one dominant hero visual, photoreal women with agency and motion (40–50 target), crisp typography. Limit expressive squiggle to one per surface; never over important text or face. Every icon is original SVG.
