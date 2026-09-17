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

1. Crear `@hwe-platform/core-ui/src/blocks/icon-grid/`:
   - `icon-grid.schema.ts` — title, subtitle, items array (icon, title,
     description opcional)
   - `IconGridBlock.tsx` — grid responsive con iconos circulares
   - Tests y exports

**Ejes**, de las tres apariciones en el Figma (trío de features de la home,
grid de 6 servicios, y los 5 valores de Le Camping):

| Eje | Tipo | Dominio | Visto |
|---|---|---|---|
| `columns` | estilo | `number` — **no el enum `3\|4\|6`** | 3, 5 y 6 |
| `variant` | estilo | `card` \| `bare` | con tarjeta en servicios, sin ella en el trío |

El `columns: 3/4/6` que decía esta historia es justo el error que
`bloques.md` advierte: enumera lo que se vio y deja fuera el 5 que ya usa
Le Camping. Va como número.

**Iconos propios:** el Figma trae tres SVG que no están en `lucide-react`
(`EauChauffee`, `EspritFamilial`, `AnimationsEte`). El bloque debe aceptar
tanto un nombre del set de la primitiva `Icon` como un componente React, o
no se podrán pintar.

### CardGrid

2. Crear `@hwe-platform/core-ui/src/blocks/card-grid/`:
   - `card-grid.schema.ts` — title, subtitle, variant
     (standard/asymmetric), source (select: manual/accommodations/
     entities/articles), sourceConfig (category, limit, featured filter),
     manualItems (array de image+title+subtitle+tag+url, si source=manual)
   - `CardGridBlock.tsx` — si source es manual, renderiza los items.
     Si source es una colección, hace fetch a Payload y renderiza.
   - `CardGridItem.tsx` — tarjeta individual con imagen, gradient
     overlay, título, tag, link
   - Tests y exports

**Ejes**, de las cinco apariciones en el Figma:

| Eje | Tipo | Dominio | Visto |
|---|---|---|---|
| `card` | **estructural** | `overlay` \| `stacked` | overlay en Hébergements y Alentours; imagen arriba en Actualités, Découvrez aussi y la otra location |
| `columns` | estilo | `number` o reparto asimétrico | 2 asimétricas (5/7), 3 y 4 |

`card` cambia la anatomía de la tarjeta —texto sobre la imagen frente a texto
debajo—, así que son componentes separados resueltos por mapa.

### ReviewsGrid

3. Crear `@hwe-platform/core-ui/src/blocks/reviews-grid/`:
   - `reviews-grid.schema.ts` — title, subtitle, reviews array
     (stars, quote, author, date, source)
   - `ReviewsGridBlock.tsx` — 3 columnas de tarjetas de reseña
   - `ReviewCard.tsx` — tarjeta individual con estrellas, cita,
     autor, fecha
   - Tests y exports

### Blog

4. Crear `@hwe-platform/core-ui/src/blocks/blog/`:
   - Está en el modelo de datos y **ninguna historia lo construía**: es uno de
     los cuatro bloques huérfanos detectados al analizar el Figma
   - Encaja aquí porque su sección de *Actualités* usa la misma anatomía de
     tarjeta que `card-grid` con `card: stacked` — conviene decidir si es un
     bloque propio o una configuración de `card-grid` con `source: articles`

### Registro y costura del cliente

5. Registrar todos en `blockRegistry.ts` de plataforma
6. Crear su fichero en `apps/site-demo/src/blocks/`, aunque sea un reexport

## Leer antes

- `docs/lenguaje-visual.md` del repo del cliente — **antes de escribir JSX**
- docs/arquitectura/bloques.md
- specs/payload/modelo-datos.md (para bloques de referencia)
- docs/estandares/codigo.md
- docs/estandares/testing.md

## Verificar contra el diseño

Antes de marcar cualquier criterio, **comparar lo construido con la sección
correspondiente del export de Figma**, no de memoria. Los tests comprueban que
el dato sale; ninguno comprueba que salga como el diseño manda.

- Cada elemento usa el token que le asigna `docs/lenguaje-visual.md` del
  cliente — en particular las **etiquetas**, que van en color de acento y
  tipografía de cuerpo, no como encabezados
- Se respetan el ritmo vertical y el contenedor
- Las diferencias con el diseño están **listadas y justificadas**

Ver `specs/figma/analisis.md`, sección "Verificar contra el diseño".

## Criterios de aceptación

- [ ] IconGrid renderiza 3, 4 o 6 columnas según configuración
- [ ] IconGrid es responsive (apila en mobile)
- [ ] CardGrid renderiza items manuales correctamente
- [ ] CardGrid consulta Payload cuando source es una colección
- [ ] CardGrid variante asimétrica (5/7) funciona
- [ ] ReviewsGrid muestra estrellas, cita, autor
- [ ] Todos los bloques usan primitivas de @hwe-platform/core-ui
- [ ] Todos usan tokens de Tailwind
- [ ] Todos pasan vitest-axe
- [ ] Tests — cobertura >80%
- [ ] Schemas Zod validan correctamente
- [ ] Registrados en blockRegistry

## Retrospectiva

_(se llena después si aplica)_
