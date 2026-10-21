# Motion — v1
Tokens defined in `assets/tokens.css`: fast 120ms, normal 200ms, slow 320ms; easing `--ease-brand`.
- Buttons: 200ms translateY -2px on hover, no layout shifts.
- Panels: optional 320ms opacity/transform entrance, only on purposeful page transitions.
- Stickers: subtle 120ms emphasis on hover, never constant loops.
- Feedback: 120ms focus and active response; preserve visible focus ring.
- Never animate sensitive biomarkers, urgency indicators or medical results in ways that imply improvement.
- `prefers-reduced-motion: reduce` zeroes duration tokens, removes hover transform and smooth scrolling.
Testing: keyboard through guide, toggle operating-system reduce motion, verify at 320px and 200% zoom, browser devtools performance check, avoid moving focus and avoid layout shift.
