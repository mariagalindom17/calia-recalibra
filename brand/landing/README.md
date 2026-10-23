# Calia Lab — landing page v1
Source: `brand/landing/index.html`; layout CSS `brand/landing/landing.css`; shared design vocabulary `brand/assets/tokens.css` + `brand/assets/styles.css`. Existing living design guide remains at `brand/index.html`.

## Copy direction
Recommended headline: **Te cuidas. Tus estudios salen “normales”. ¿Por qué sigues agotada?**
Alternative headlines: **Estás cansada de sentirte cansada. Empecemos por entender qué pasa.** / **Entiende tu energía. Cambia una cosa a la vez.**
Order: promise → mechanism → es para ti si / no es para ti → why Calia exists → five FAQs → final CTA.
Single CTA wording: **Descubre tu score de energía** in hero and closing card. Both navigate to the public Next.js route `/score`.

## Product integrity
The mechanism is a proposed product journey: symptoms & context → possible factors → one action → observe trends. A transparent but unvalidated 0–100 Calia energy index is now defined in `src/lib/energy-score.ts`; no clinical validity is claimed. No launch date or price has been confirmed.
The landing represents **Calia Lab as an independent brand**, not a founder-led personal profile. No unverified expert team or medical credential claims.

## Data capture
The original `CAMPOS_DEL_FORMULARIO` and destination were unspecified. **The landing no longer displays that interim waitlist form; both CTAs now open the private-by-design questionnaire at `/score`.** The previously implemented interest API scaffold is not used by this landing.  This implementation uses **optional given name, required email and explicit marketing consent**, and a honeypot. No sensitive/health details are collected.
Form sends JSON to `/api/calia-interest`. The Next.js route exists in `src/app/api/calia-interest/route.ts`, with a narrow public-route exception in `src/middleware.ts`; the protected lab-analysis routes remain unchanged.
Production enablement requires:
1. A legally reviewed privacy notice presented and linked on the form before data collection.
2. A trusted HTTPS destination in `CALIA_LEADS_WEBHOOK_URL`.
3. `CALIA_LEADS_ENABLED=true` **only after** privacy, spam protection and capture checks have passed.
Without both env vars, server responds 503, and frontend does not claim a registration was saved. This feature is *not* currently live.
The standalone HTML remains a **source artifact**, not automatically published at a Next route. Review locally (file:// form shows demo message) or integrate into a public route after approval.

## Constraints
Reuses existing Sora/Inter, brand tokens and buttons/cards/kickers/FAQ/field/form/footer. No copied Superpower content, no made-up clinical score, dates, prices, testimonials or statistics.

## 3D and questionnaire integration
The user chose glossy icons for content and flat symbols for controls. The four mechanism cards, founder-alternative story tile, and final CTA use the authored glossy SVG icons in `brand/assets/img/icons/3d/`. Corresponding Next.js static assets live in `public/brand/icons-3d/`. The FAQ title is **Lo que siempre nos preguntan.**
Questionnaire: `src/app/score/page.tsx`; neutral user-facing symptoms, exploratory internal categories and non-diagnostic results. No data are persisted. The static landing HTML must still be served by a deployment before its CTA can become accessible to visitors.

## Icon placement audit (Oct 2026)
Five `Es para ti si` quote cards now each include their own matching glossy 3D icon: moon (sleep), flask (lab results), dumbbell (exercise), brain (mental overload), chart (seeing progress). The three tiny icon labels inside the demo phone deliberately use the existing **flat** stickers (sleep, energy, movement), and the four mechanism icons correspond to questionnaire/connecting clues/choosing an action/tracking progress. Original palette only; `landing.css` fixes icon size, vertical alignment, wrapping, small mobile grids and prevents stretched imagery.
Validate asset paths and presence of all five quote icons locally via `python brand/tools/check_landing_assets.py`.

## Founder-alternative tile layout fix
The three glossy icons in the pink `Por qué existe Calia` panel now each occupy an equal grid column, with visible spacing, no absolute positioning, and no `overflow:hidden` crop. Their intrinsic aspect ratios are preserved with `object-fit:contain`.

## Mandatory registration before questionnaire
The `/score` route starts with name + email and an explicit processing-consent checkbox. The questions unlock only when the existing server-side leads endpoint confirms receipt. Until the privacy notice and webhook are configured, the gate is disabled and clearly states that capture is not yet active; no fabricated registrations or saving of health symptoms.
