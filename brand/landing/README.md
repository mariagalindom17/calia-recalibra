# Calia Lab — landing page v1
Source: `brand/landing/index.html`; layout CSS `brand/landing/landing.css`; shared design vocabulary `brand/assets/tokens.css` + `brand/assets/styles.css`. Existing living design guide remains at `brand/index.html`.

## Copy direction
Recommended headline: **Te cuidas. Tus estudios salen “normales”. ¿Por qué sigues agotada?**
Alternative headlines: **Estás cansada de sentirte cansada. Empecemos por entender qué pasa.** / **Entiende tu energía. Cambia una cosa a la vez.**
Order: promise → mechanism → es para ti si / no es para ti → founder → five FAQs → final CTA.
Single CTA wording: **Descubre tu score de energía** in hero and form.

## Product integrity
The mechanism is a proposed product journey: symptoms & context → possible factors → one action → observe trends. No scoring algorithm exists yet in this repository; no launch date or price has been confirmed. Copy explicitly says so.
Creator: María Galindo, practitioner in functional medicine, nutrition and health coaching. Do **not** claim that she is a medical doctor. Verify founder bio before public launch.

## Data capture
The original `CAMPOS_DEL_FORMULARIO` and destination were unspecified. This implementation uses **optional given name, required email and explicit marketing consent**, and a honeypot. No sensitive/health details are collected.
Form sends JSON to `/api/calia-interest`. The Next.js route exists in `src/app/api/calia-interest/route.ts`, with a narrow public-route exception in `src/middleware.ts`; the protected lab-analysis routes remain unchanged.
Production enablement requires:
1. A legally reviewed privacy notice presented and linked on the form before data collection.
2. A trusted HTTPS destination in `CALIA_LEADS_WEBHOOK_URL`.
3. `CALIA_LEADS_ENABLED=true` **only after** privacy, spam protection and capture checks have passed.
Without both env vars, server responds 503, and frontend does not claim a registration was saved. This feature is *not* currently live.
The standalone HTML remains a **source artifact**, not automatically published at a Next route. Review locally (file:// form shows demo message) or integrate into a public route after approval.

## Constraints
Reuses existing Sora/Inter, brand tokens and buttons/cards/kickers/FAQ/field/form/footer. No copied Superpower content, no made-up clinical score, dates, prices, testimonials or statistics.
