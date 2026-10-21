# Calia Lab / Bold & Playful (review branch)
**Tagline:** Más energía para todo lo que viene.
Open `index.html` in a browser to view the living guide. Production CSS is `assets/tokens.css` + `assets/styles.css`. All files are isolated inside `brand/`, no edits to `src/`.
## Status
Core foundations, logo concepts in SVG, original sticker icons, components, motion and Spanish voice are implemented. This is a first review draft, not production sign-off.
## Outstanding
- Approve original wordmark geometry and confirm trademark clearance; SVG font text requires Sora availability and should be converted to outlines after approval.
- Export logo/sticker PNG @2x and provide licensed photo WebP assets. Placeholder photography is intentionally not copied from the moodboard.
- Package coding-agent Skill ZIP and run automated/visual browser accessibility tests.
- Validate colors/contrast with accessible tooling and finalize typography loading for offline deployments.
## Integration
The current app uses earth/terracotta tokens and different fonts. Do not import these styles globally into `src/app/globals.css` until a separate reviewed integration PR.
