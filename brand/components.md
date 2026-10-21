# Component map — v1
All classes defined in `assets/styles.css`; tokens in `assets/tokens.css`.
| Name | CSS class | Variants | Example copy |
| --- | --- | --- | --- |
| Button | .btn | --primary / --dark / --outline / --lime | Empezar ahora |
| Kicker | .kicker | standard | TU ENERGÍA |
| Sticker | .sticker | standard / --pink | Ciencia sin vueltas |
| Note | .note | standard | Información educativa |
| Card | .card | standard / --lilac / --lime | Descansar también es avanzar |
| Field | .field | standard / invalid via native validation | Tu correo |
| FAQ item | .faq-item | collapsed/open native details | ¿Cómo funciona? |
| Form | .form | standard | Quiero conocer más |
| Footer | .footer | standard | Más energía para todo lo que viene |
| Logo lockup | .brand-logo | standard | Calia Lab |
Do: semantic HTML, visible focus, 48px controls, valid label associations. Don't: use stickers as buttons, convey clinical zones by color alone, use decorative curves on every section.

## Product content principles
For fatigue-related components, write “posibles factores” rather than “tu diagnóstico”; show progress as observed trends, not proof of causality. Cards should offer a single action plus a measurement, e.g. “Registra tu descanso durante siete días”. Error/empty states should preserve empathy and clearly distinguish missing data from normal results.
