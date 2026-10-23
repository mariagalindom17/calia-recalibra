# Calia Lab — Energy questionnaire v1

**Entry route:** `/score` (a public Next.js page). Landing CTA in `brand/landing/index.html` links to it; the static landing itself is not currently deployed.

## Flow and scales
1. Energy perceived on a normal day, 1–10.
2. Nine fatigue-interference statements, 1–7 each (past week).
3–5. The 21 verbatim symptom checkboxes (past 3 months), evenly mixed into three seven-question pages with neutral headings. Underlying exploratory signal groups are kept in `src/lib/energy-questionnaire.ts`; user does not see clinical category names.
6. An immediate **non-diagnostic** result: a Calia energy score (0–100), the self-reported energy (1–10), sum of fatigue responses (9–63), and the count/recap of checked experiences. Based on the user's questionnaire, a sum **≥36** highlights important reported interference. This is a screening interpretation for conversation, not a disease diagnosis or proof of etiology.

The proposed Calia **energy score is explicitly defined**, but is NOT a clinically validated scale: `round(50*(energy-1)/9 + 50*(63-fatigueTotal)/54)`, meaning 50% perceived energy and 50% reverse-normalized fatigue interference. High is better. Limits are 0–100. It must be reviewed and validated before clinical decision-making. User-facing output never blames thyroid, insulin, cortisol or nutrient deficiency. Internal exploratory tags are **not** diagnoses, probabilities, clinically validated triage rules, or discoverable causes.

## Privacy and technical notes
All answers live **only in React client state** (no network calls, cookies, localStorage, database, logging, or API submission). Closing or refreshing loses them; print produces a local copy. There is no initial/90-day selection or automated comparisons.

The six glossy dimensional SVG illustrations live under `public/brand/icons-3d/` and are copied to `brand/assets/img/icons/3d/` for brand-system use. Navigation buttons/scales remain flat. All colors use the established Calia palette and CSS token import; the main analysis app is unchanged. The Clerk middleware only makes `/score` public. Consent, accessibility and medical copy should be reviewed before public launch.

## Lead gate before questions
The questionnaire now starts with a mandatory **name and email** form and a required affirmative checkbox authorizing use of those details for registering/contacting the lead. Its `/api/calia-interest` POST must return `{ok:true}` before six-step questions are unlocked. The name must contain 2–80 characters, and the email must be valid. A POST error, invalid fields or missing privacy notice blocks entry; success is not simulated.

For real capture, configure `CALIA_LEADS_ENABLED=true`, `CALIA_LEADS_WEBHOOK_URL` (trusted HTTPS server-side capture destination) and `NEXT_PUBLIC_CALIA_PRIVACY_URL` (published, reviewed privacy notice). No public collection is enabled by default; before configuring these variables the form is visibly disabled. The endpoint stores neither questionnaire answers nor health information.

The six questionnaire steps start after the lead gate and are unchanged. Page refresh returns to the gate; repeated submissions are possible unless the receiving CRM deduplicates. Test submissions and spam/rate protections should be reviewed before production.
