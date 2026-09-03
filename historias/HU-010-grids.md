---
id: HU-010
titulo: Bloques IconGrid, CardGrid y ReviewsGrid
estado: spec-lista
prioridad: 3
hito: 1
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Tres bloques tipo grid que cubren la mayoría de los listados del site:
servicios con iconos, tarjetas con imagen, y reseñas de clientes.
CardGrid es especialmente importante porque es un bloque de referencia —
consulta colecciones de Payload en vez de contener datos propios.

## Qué hacer

### IconGrid

1. Crear `@hwe/core-ui/src/blocks/icon-grid/`:
   - `icon-grid.schema.ts` — title, subtitle, columns (3/4/6),
     items array (icon, title, description opcional)
   - `IconGridBlock.tsx` — grid responsive con iconos circulares
   - Tests y exports

### CardGrid

2. Crear `@hwe/core-ui/src/blocks/card-grid/`:
   - `card-grid.schema.ts` — title, subtitle, variant
     (standard/asymmetric), source (select: manual/accommodations/
     entities/articles), sourceConfig (category, limit, featured filter),
     manualItems (array de image+title+subtitle+tag+url, si source=manual)
   - `CardGridBlock.tsx` — si source es manual, renderiza los items.
     Si source es una colección, hace fetch a Payload y renderiza.
   - `CardGridItem.tsx` — tarjeta individual con imagen, gradient
     overlay, título, tag, link
   - Tests y exports

### ReviewsGrid

3. Crear `@hwe/core-ui/src/blocks/reviews-grid/`:
   - `reviews-grid.schema.ts` — title, subtitle, reviews array
     (stars, quote, author, date, source)
   - `ReviewsGridBlock.tsx` — 3 columnas de tarjetas de reseña
   - `ReviewCard.tsx` — tarjeta individual con estrellas, cita,
     autor, fecha
   - Tests y exports

### Registro

4. Registrar los tres en `blockRegistry.ts`

## Leer antes

- docs/arquitectura/bloques.md
- specs/payload/modelo-datos.md (para bloques de referencia)
- docs/estandares/codigo.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] IconGrid renderiza 3, 4 o 6 columnas según configuración
- [ ] IconGrid es responsive (apila en mobile)
- [ ] CardGrid renderiza items manuales correctamente
- [ ] CardGrid consulta Payload cuando source es una colección
- [ ] CardGrid variante asimétrica (5/7) funciona
- [ ] ReviewsGrid muestra estrellas, cita, autor
- [ ] Todos los bloques usan primitivas de @hwe/core-ui
- [ ] Todos usan tokens de Tailwind
- [ ] Todos pasan vitest-axe
- [ ] Tests — cobertura >80%
- [ ] Schemas Zod validan correctamente
- [ ] Registrados en blockRegistry

## Retrospectiva

_(se llena después si aplica)_
