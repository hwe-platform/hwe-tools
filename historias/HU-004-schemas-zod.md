---
id: HU-004
titulo: Schemas Zod de todas las colecciones y globals de Payload
estado: hecha
prioridad: 1
hito: 1
agente: code-builder
rama: feat/HU-004-schemas-zod-payload
dependencias: [HU-001]
---

## Contexto

Zod es la fuente de verdad del modelo de datos (DEC-004). Los schemas
se definen primero y Payload deriva de ellos. Sin schemas, no hay
colecciones. Sin colecciones, no hay contenido.

## Qué hacer

1. Crear schemas Zod en `@hwe-platform/core-ui/src/schemas/` para cada colección:
   - `media.schema.ts`
   - `accommodations.schema.ts`
   - `entities.schema.ts`
   - `pages.schema.ts`
   - `articles.schema.ts`
   - `categories.schema.ts`
2. Crear schemas Zod para cada global:
   - `site-config.schema.ts`
   - `header.schema.ts`
   - `footer.schema.ts`
   - `banner.schema.ts`
3. Crear tipos derivados en `types/` para cada schema (`z.infer`)
4. Crear schemas de bloques de referencia dentro de `pages.schema.ts`:
   - `mediaTextBlockSchema`
   - `iconGridBlockSchema`
   - `cardGridBlockSchema`
   - `reviewsGridBlockSchema`
   - `galleryBlockSchema`
   - `mapBlockSchema`
   - `blogBlockSchema`
   - `ctaBlockSchema`
   - `faqBlockSchema`
   - `richTextBlockSchema`
   - `embedBlockSchema`
   - `servicesGridBlockSchema`
   - `accommodationsGridBlockSchema`
   - `environmentGridBlockSchema`
   - `instagramBlockSchema`
5. Exportar todo desde el entry point de `@hwe-platform/core-ui`
6. Escribir tests para cada schema:
   - Valida datos correctos (caso nominal)
   - Rechaza datos incorrectos (campos requeridos, tipos erróneos)
   - Valores por defecto funcionan
   - Campos opcionales aceptan undefined

## Leer antes

- specs/payload/modelo-datos.md (la referencia principal)
- specs/payload/localizacion.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/decisiones/DEC-004-zod.md
- docs/decisiones/DEC-005-typescript.md

## Criterios de aceptación

- [x] Un schema Zod por cada colección y global de la spec
- [x] Tipos derivados con `z.infer` para todos los schemas
- [x] Schemas de bloques de referencia definidos
- [x] Tests para cada schema — cobertura >95%
- [x] Todos los campos marcados como localized en la spec tienen el tipo correcto
- [x] Los schemas son importables desde `@hwe-platform/core-ui`
- [x] Naming sigue convención: `xxxSchema` en camelCase
- [x] JSDoc en castellano en todos los schemas exportados
- [x] `pnpm build` compila sin errores
- [x] `pnpm test` pasa (76/76)

## Retrospectiva

_(se llena después si aplica)_

### Decisiones de diseño no cubiertas literalmente por la spec

- **Coverage real:** configurado `@vitest/coverage-v8` con umbral 95% en
  `src/schemas/` (lines/statements/functions/branches). Verificado: 100%
  de cobertura en los 11 archivos de schema.
- **Relaciones auto-referenciadas** (`accommodations.comparison`, `pages.parent`):
  en vez de `z.lazy()` sobre el schema completo (ciclo de tipos TS difícil de
  mantener en modo estricto), se modelan como referencia superficial
  (`id` + `name`/`title` + `slug` + imagen) — Payload puebla self-relations
  a poca profundidad en la práctica.
- **Bloques con campos abiertos** (`icon` sin lista cerrada en la spec):
  tipados como `z.string()` en vez de inventar un enum no autorizado por producto.
- **`accommodations.comparison`:** confirmado como array — alojamientos
  recomendados; si vacío, el frontend muestra otros de la misma categoría
  automáticamente. La spec y el schema ya reflejan esto (ver modelo-datos.md).
