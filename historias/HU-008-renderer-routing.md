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

1. Crear `@hwe/core-ui/src/renderer/BlockRenderer.tsx`:
   - Recibe un array de bloques de Payload (`BlockInstance[]`)
   - Para cada bloque, busca el componente en el registry
   - Registry del cliente tiene prioridad sobre el de plataforma
   - Si no encuentra el componente: warning en dev, null en producción
   - No valida schemas — cada bloque valida los suyos internamente
   - Pasa los datos como `unknown` al componente

2. Crear `@hwe/core-ui/src/renderer/blockRegistry.ts`:
   - Objeto que mapea `blockType → React.ComponentType`
   - Vacío inicialmente, se llena conforme se crean bloques
   - Exporta tipo `BlockRegistry` para que el cliente pueda extenderlo

3. Crear `@hwe/core-ui/src/renderer/types.ts`:
   - `BlockInstance`: `{ blockType: string; id: string; [key: string]: unknown }`
   - `BlockRegistry`: `Record<string, React.ComponentType<{ data: unknown }>>`
   - `BlockRendererProps`: `{ blocks: BlockInstance[]; customRegistry?: BlockRegistry }`

### Catch-all routing

4. Crear `hwe-template/src/app/[...slug]/page.tsx`:
   - Server Component que recibe el slug
   - Busca en Payload en orden: pages → accommodations → entities → articles
   - Si encuentra page → renderiza hero (si tiene) + BlockRenderer con sus blocks
   - Si encuentra accommodation → renderiza template de ficha (placeholder por ahora)
   - Si encuentra entity → renderiza template de entidad (placeholder por ahora)
   - Si encuentra article → renderiza template de artículo (placeholder por ahora)
   - Si no encuentra nada → `notFound()`

5. Crear `hwe-template/src/app/page.tsx`:
   - Home page: busca la page con type='home' en Payload
   - Renderiza hero + BlockRenderer

6. Crear middleware de idioma `hwe-template/src/middleware.ts`:
   - Detecta locale desde el prefijo de URL
   - Si no hay prefijo, usa el default de site-config
   - Pasa el locale al contexto de Next.js

7. Crear `hwe-template/src/app/[...slug]/generateStaticParams.ts`:
   - Genera las rutas estáticas desde todas las colecciones
   - Para ISR con revalidación

8. Tests:
   - BlockRenderer renderiza bloques conocidos
   - BlockRenderer ignora bloques desconocidos con warning
   - Registry del cliente overridea el de plataforma
   - Catch-all resuelve páginas correctamente (con mocks de Payload)

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
- [ ] `generateStaticParams` genera rutas para todas las colecciones
- [ ] Tests del BlockRenderer — cobertura >80%
- [ ] Tests del catch-all con mocks — cobertura >60%

## Retrospectiva

_(se llena después si aplica)_
