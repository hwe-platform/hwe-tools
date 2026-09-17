---
id: HU-008
titulo: BlockRenderer, registry de bloques y catch-all routing
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
dependencias: [HU-005, HU-006]
---

## Contexto

El BlockRenderer es el corazón del page builder. Sin él, los bloques
de Payload no se renderizan. El catch-all `[...slug]` es lo que hace
que cualquier URL funcione sin crear carpetas en Next.js. Sin estos dos,
no hay site.

## Qué hacer

### BlockRenderer y Registry

1. Crear `@hwe-platform/core-ui/src/renderer/BlockRenderer.tsx`:
   - Recibe un array de bloques de Payload (`BlockInstance[]`)
   - Para cada bloque, busca el componente en el registry
   - Registry del cliente tiene prioridad sobre el de plataforma
   - Si no encuentra el componente: warning en dev, null en producción
   - No valida schemas — cada bloque valida los suyos internamente
   - Pasa los datos como `unknown` al componente

2. Crear `@hwe-platform/core-ui/src/renderer/blockRegistry.ts`:
   - Objeto que mapea `blockType → React.ComponentType`
   - Claves en **kebab-case**, como las guarda Payload (`media-text`, no `mediaText`)
   - Arranca con `rich-text` y `cta` (ver paso 3b); el resto se añaden conforme se crean
   - Exporta tipo `BlockRegistry` para que el cliente pueda extenderlo

3. Crear `@hwe-platform/core-ui/src/renderer/types.ts`:
   - `BlockInstance`: `{ blockType: string; id: string; [key: string]: unknown }`
   - `BlockRegistry`: `Record<string, React.ComponentType<{ data: unknown }>>`
   - `BlockRendererProps`: `{ blocks: BlockInstance[]; customRegistry?: BlockRegistry }`

### Bloques huérfanos

3b. Crear `@hwe-platform/core-ui/src/blocks/rich-text/` y `blocks/cta/`:
   - Son los dos únicos bloques del modelo de datos que **ninguna otra historia construye**
     (`blog` va en HU-010 e `instagram` en HU-011)
   - Se hacen aquí porque **no dependen del Figma**: `rich-text` solo pinta el contenido del
     editor y `cta` es título + botones, que salen de la primitiva `Button` de HU-006
   - Sus schemas Zod **ya existen** en `pages.schema.ts` — no redefinirlos
   - Con ellos, al terminar esta historia ya se ve una página real en el navegador

### Catch-all routing

4. Crear `apps/site-demo/src/app/(frontend)/[[...slug]]/page.tsx`:
   - **Dentro del route group `(frontend)`**, no en `src/app/` — si no, choca con `(payload)`
   - **Doble corchete**: `[...slug]` no captura `/`, así que la home necesita `[[...slug]]`.
     Sustituye al placeholder que dejó HU-002
   - Server Component que recibe el slug
   - Sin slug → busca la page con `type='home'`
   - Con slug → busca en Payload en orden: pages → accommodations → entities → articles
   - Si encuentra page → renderiza BlockRenderer con sus blocks
   - Si encuentra accommodation → renderiza template de ficha (placeholder por ahora)
   - Si encuentra entity → renderiza template de entidad (placeholder por ahora)
   - Si encuentra article → renderiza template de artículo (placeholder por ahora)
   - Si no encuentra nada → `notFound()`
   - **El hero no se renderiza aquí** — lo hace HU-009 una sola vez, junto con su schema.
     Hasta entonces, una página con hero configurado simplemente no lo pinta
   - La **resolución de slug va como función pura en core-ui**, testeada allí; el Server
     Component queda como capa fina. Mismo patrón que los hooks de HU-005
   - Usar `revalidationTags()` de `core-ui/src/payload/revalidation.ts` en los tags de caché
     del fetch, para que la revalidación de HU-005 sirva de algo

5. Crear middleware de idioma `apps/site-demo/src/middleware.ts`:
   - Detecta locale desde el prefijo de URL
   - Si no hay prefijo, usa el default de site-config
   - Pasa el locale al contexto de Next.js
   - **Propio, no `next-intl`**: para tres idiomas con estrategia `prefix` son ~30 líneas, y
     aún no hay textos de UI que traducir que justifiquen la dependencia (`codigo.md`)

6. ~~Exportar `generateStaticParams` desde el propio `page.tsx`~~ — **aplazado**
   - La ruta queda como `dynamic = 'force-dynamic'`: cada petición consulta Payload
   - No es una omisión, es una limitación: la página lee por la **Local API de
     Payload**, que no es un `fetch`, así que Next no puede etiquetar el resultado
     y lo que cachea sin tags no lo suelta nunca. Durante esta historia se cacheó
     un 404 de la home y siguió sirviéndose después de crear la página
   - Montarlo bien exige `'use cache'` + `cacheTag()` de Next 16, que requiere una
     bandera experimental que afecta también al admin de Payload. Es una decisión
     propia y se toma cuando el rendimiento se pueda medir: HU-012
   - Detalle en `docs/arquitectura/paginas-routing.md`, sección "Pendiente"

7. Tests:
   - BlockRenderer renderiza bloques conocidos
   - BlockRenderer ignora bloques desconocidos con warning
   - Registry del cliente overridea el de plataforma
   - Resolución de slug (función pura en core-ui) cubre los cuatro órdenes y el 404
   - `rich-text` y `cta` renderizan y pasan vitest-axe

## Leer antes

- docs/arquitectura/bloques.md
- docs/arquitectura/paginas-routing.md
- specs/payload/localizacion.md
- docs/estandares/codigo.md
- docs/decisiones/DEC-009-rutas.md

## Criterios de aceptación

- [ ] BlockRenderer renderiza un array de bloques desde Payload
- [ ] Registry del cliente tiene prioridad sobre el de plataforma
- [ ] Bloque desconocido no rompe la página (warning en dev, null en prod)
- [ ] URL `/le-camping` resuelve la page con slug `le-camping`
- [ ] URL inexistente devuelve 404
- [ ] Home (`/`) resuelve la page con type `home`
- [ ] Middleware de idioma detecta locale desde prefijo URL
- [ ] ~~`generateStaticParams` genera rutas para todas las colecciones~~ —
      **aplazado a HU-012**, ver el paso 6 y `paginas-routing.md`
- [ ] Tests del BlockRenderer — cobertura >80%
- [ ] Tests de la resolución de slug — cobertura >60%
- [ ] Una página montada en el panel con `rich-text` y `cta` se ve en el navegador, con los
      colores y la tipografía del cliente

## Retrospectiva

_(se llena después si aplica)_
