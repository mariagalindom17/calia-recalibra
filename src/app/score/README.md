# Calia Lab — Energy questionnaire v1

**Entry route:** `/score` (a public Next.js page). Landing CTA in `brand/landing/index.html` links to it; the static landing itself is not currently deployed.

## Flow and scales
1. Energy perceived on a normal day, 1–10; choose initial or day-90 repeat.
2. Nine fatigue-interference statements, 1–7 each (past week).
3–5. The 21 verbatim symptom checkboxes (past 3 months), evenly mixed into three seven-question pages with neutral headings. Underlying exploratory signal groups are kept in `src/lib/energy-questionnaire.ts`; user does not see clinical category names.
6. An immediate **non-diagnostic** result: self-rated energy (1–10), sum of fatigue responses (9–63), and count/recap of checked experiences. Based on the user's questionnaire, a sum **≥36** highlights important reported interference. This is a screening interpretation for conversation, not a disease diagnosis or proof of etiology.

No energy composite algorithm or medical differential was invented; user-facing output never blames thyroid, insulin, cortisol or nutrient deficiency. Internal exploratory tags are **not** diagnoses, probabilities, clinically validated triage rules, or discoverable causes.

## Privacy and technical notes
All answers live **only in React client state** (no network calls, cookies, localStorage, database, logging, or API submission). Closing or refreshing loses them; print produces a local copy. Reassessment at 90 days is an option but comparisons are not automated without an explicitly approved privacy-protecting storage workflow.

The six glossy dimensional SVG illustrations live under `public/brand/icons-3d/` and are copied to `brand/assets/img/icons/3d/` for brand-system use. Navigation buttons/scales remain flat. All colors use the established Calia palette and CSS token import; the main analysis app is unchanged. The Clerk middleware only makes `/score` public. Consent, accessibility and medical copy should be reviewed before public launch.
