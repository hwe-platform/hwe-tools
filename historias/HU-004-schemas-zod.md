---
id: HU-004
titulo: Schemas Zod de todas las colecciones y globals de Payload
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
dependencias: [HU-001]
---

## Contexto

Zod es la fuente de verdad del modelo de datos (DEC-004). Los schemas
se definen primero y Payload deriva de ellos. Sin schemas, no hay
colecciones. Sin colecciones, no hay contenido.

## Qué hacer

1. Crear schemas Zod en `@hwe/core-ui/src/schemas/` para cada colección:
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
5. Exportar todo desde el entry point de `@hwe/core-ui`
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

- [ ] Un schema Zod por cada colección y global de la spec
- [ ] Tipos derivados con `z.infer` para todos los schemas
- [ ] Schemas de bloques de referencia definidos
- [ ] Tests para cada schema — cobertura >95%
- [ ] Todos los campos marcados como localized en la spec tienen el tipo correcto
- [ ] Los schemas son importables desde `@hwe/core-ui`
- [ ] Naming sigue convención: `xxxSchema` en camelCase
- [ ] JSDoc en castellano en todos los schemas exportados
- [ ] `pnpm build` compila sin errores
- [ ] `pnpm test` pasa

## Retrospectiva

_(se llena después si aplica)_
