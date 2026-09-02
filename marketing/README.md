# marketing/

Carril de marketing de Calia Lab · Recalibra, separado del carril de producto.

- `producto.md` — qué es y qué no es Recalibra, en términos de marketing.
- `marca.md` — voz, paleta, tipografía y líneas rojas de claims.
- `tablero.md` — temas abiertos, decisiones y preguntas. **Es la memoria.**

## Cómo trabajar aquí

El agente vive en `.claude/agents/marketing.md`. Para invocarlo en una sesión
de Claude Code: `@marketing` o pídelo por nombre ("usa el agente de
marketing"). Trabaja en su propio contexto, así que puedes llevar un tema de
marketing en paralelo a uno de producto sin que se mezclen.

Regla de la casa: el agente de marketing **no edita `src/`**. Si una idea
necesita un cambio en la app, lo anota en `tablero.md` bajo "Pide al agente de
producto".

Las piezas largas (landing, secuencias de email, planes de lanzamiento) se
guardan como archivos aquí para poder iterarlas; lo corto se queda en el chat.
