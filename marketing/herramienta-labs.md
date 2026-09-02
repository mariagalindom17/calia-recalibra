# Herramienta de labs — estado real del código

> El puente entre los dos carriles. Compara lo que hoy hace
> `calia-recalibra.vercel.app` (este repo) contra los
> [Requerimientos v2 · semáforo, no protocolo](https://app.notion.com/p/3a7139566f4681f8b118d6f72bf7eba1)
> (24 jul 2026) y contra lo que se promete en la página de venta.
> Última revisión del código: 2 sep 2026.

## Qué hace hoy

Alumna crea cuenta (Clerk) → elige fase del ciclo → sube el PDF del lab
(máx. 10 MB) → recibe semáforo por marcador y por grupo, imprimible.
Límite de 10 análisis por día por usuaria.

- **22 biomarcadores** en 5 grupos (hormonal sexual, tiroideo, metabólico,
  estrés, nutrientes).
- Zonas: 🟢 óptimo funcional · 🟡 dentro del clínico pero fuera del funcional
  · 🔴 fuera de rango o umbral crítico · ⚪ sin dato.
- Cada resultado trae valor reportado por el lab, valor convertido a unidad
  canónica, rango del lab, rango funcional y la razón de la zona.

## Requerimientos v2 · qué ya se aplicó

La página de Notion sigue diciendo "pendiente: María comparte el repo". Ya no
aplica — el repo existe y buena parte de los fixes está en el código:

| Req | Estado en código |
|---|---|
| 1 · Conversión de unidades | ✅ Implementado (`src/lib/units.ts`), con `conversionStatus` por marcador (canonical / converted / assumed / unknown) |
| 2 · Fase hormonal | 🟡 Parcial — se captura la **fase** (folicular / lútea / posmenopáusica / no sé), no el **día de ciclo + largo de ciclo** que pedía la espec. La derivación automática de fase no existe |
| 2b · Progesterona no interpretable fuera de lútea | ✅ Implementado, con el mensaje de repetir en día 21 |
| 2c · Posmenopausia sin falso rojo | ✅ Implementado (FSH alta y E2/P4 bajos se leen como esperados) |
| 3 · Ratio P/E lúteo | ✅ Implementado — funcional 100–500, óptimo >300, y distingue dominancia estrogénica de agotamiento hormonal |
| 4 · Anticuerpos | 🟡 Codificado como umbral, pero **la reconciliación de ensayo/unidad de anti-TGA sigue pendiente** — es la misma duda que marcó la espec |
| 5 · Guardrails de salida | ✅ Sin dosis ni marcas; rojo clínico se rutea a médica |
| 6 · Privacidad / LFPDPPP | ❓ No verificado en esta revisión |

## Discrepancias abiertas (afectan al copy)

1. **22 vs. 23 biomarcadores.** El código tiene 22 y el comentario del propio
   archivo dice: *"El brief original mencionaba 23 marcadores, pero al
   desglosar los grupos suman 22. Confirmar con María si falta uno."* La página
   de venta de Hotmart, la carta de bienvenida y el ancla #20 del banco dicen
   **23**. O falta un marcador en el código, o el copy debe decir 22.
2. **Testosterona total.** Los rangos canónicos confirmados por María el 24 jul
   dicen **30–75 ng/dL**; el código usa **15–70**. Los workbooks de S2 citan el
   primero.
3. **Anti-TGA.** Sigue sin resolverse lo que la espec marcó: un óptimo
   funcional de `<3` no puede ser más laxo que un convencional de `0–0.9`. Es
   tema de ensayo/unidad y hoy puede estar falso-marcando.

Las tres son del carril de producto; están anotadas en `tablero.md`.
