<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dos carriles: producto y marketing

Este repo lleva dos hilos de trabajo en paralelo, cada uno con su agente:

- **Producto / código** — `src/`, la app Next.js. Es el carril por defecto.
- **Marketing** — `marketing/`, con su agente en `.claude/agents/marketing.md`.
  Se invoca con `@marketing`. Es solo el taller: el sistema vive en Notion y la
  tarea corre en Cowork. Ve estrategia de marca, temas y piezas para redes, y
  campañas de lanzamiento. No ve labs, ni lo clínico, ni el curso, ni `src/`.

Si trabajas en el carril de producto, no edites `marketing/` sin que te lo
pidan, y viceversa.
