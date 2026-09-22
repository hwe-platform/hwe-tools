---
id: HU-017
titulo: Ficha de alojamiento — SpecBar, EquipmentList y template de detalle
estado: spec-lista
prioridad: 3
hito: 1
agente: code-builder
rama: feat/HU-017-accommodation-detail
dependencias: [HU-008, HU-009]
---

## Contexto

La página de detalle de un alojamiento es la pieza clave para que el
visitante decida reservar. Necesita mostrar la ficha técnica (capacidad,
superficie, dormitorios), el equipamiento incluido/excluido, los detalles
de dormitorios, las features destacadas y la composición de bloques que
el editor haya añadido. Los datos ya existen en Payload (colección
`accommodations` con `specs`, `equipment`, `bedroomDetails`, `features`,
`media`, `comparison`) — falta la UI.

## Qué hacer

### 1. SpecBar — componente de ficha técnica

Crear en `packages/core-ui/src/blocks/accommodation-detail/`:

`SpecBar.tsx` — barra horizontal de iconos con datos de `specs`:

| Dato | Icono | Valor |
|------|-------|-------|
| capacity | Users | `{n} pers.` |
| bedrooms | BedDouble | `{n} ch.` |
| surface | Maximize | `{n} m²` |
| hasAC | AirVent | icono presente/ausente |
| petFriendly | PawPrint | icono presente/ausente |

- Usa iconos de lucide-react (ya en el proyecto)
- Responsive: horizontal en desktop, 2 columnas en mobile
- Los booleanos (hasAC, petFriendly) muestran icono si true, no
  muestran nada si false (no mostrar "sin AC" — es ruido)
- Schema Zod: `specBarSchema = accommodationSchema.pick({ specs: true })`
  (no es un bloque del page builder, no necesita schema propio)

### 2. EquipmentList — checklist de equipamiento

`EquipmentList.tsx` — lista con iconos y marca incluido/no incluido:

- Cada item: icono + label + indicador incluido (✓ verde) / no incluido
  (✗ gris tachado)
- Agrupable por categorías en el futuro (por ahora lista plana)
- Los iconos vienen del campo `icon` del array `equipment` — usar el
  mismo `iconRegistry` prop pattern de HU-009 (IconGrid)
- Datos: `accommodations.equipment` array

### 3. BedroomList — detalle de dormitorios

`BedroomList.tsx` — lista simple de descripciones de dormitorios:

- Cada item: icono BedDouble + descripción textual
- Solo se renderiza si `bedroomDetails` tiene elementos
- Datos: `accommodations.bedroomDetails` array

### 4. FeatureBadges — highlights del alojamiento

`FeatureBadges.tsx` — badges horizontales con icono + texto:

- Similar a SpecBar pero con datos variables (no fijos)
- Solo se renderiza si `features` tiene elementos
- Usa `iconRegistry` prop pattern para los iconos
- Datos: `accommodations.features` array

### 5. ComparisonCard — alojamientos similares

`ComparisonCard.tsx` — tarjeta pequeña de alojamiento para la sección
"Ver también":

- Imagen + nombre + tipo + precio "desde" + link a la ficha
- Se reutiliza la tarjeta de CardGrid si el diseño coincide
- Si `comparison` está vacío, el template muestra otros de la misma
  categoría (la query la hace el resolver del site-demo, no el componente)

### 6. AccommodationDetail template

Crear en `apps/site-demo/src/templates/AccommodationDetail.tsx`:

Composición fija + bloques dinámicos:

```
┌─────────────────────────────────────┐
│ Hero (mainImage + nombre + tipo)    │
├─────────────────────────────────────┤
│ SpecBar                             │
├─────────────────────────────────────┤
│ Description (richText)              │
├─────────────────────────────────────┤
│ BedroomList (si tiene)              │
├─────────────────────────────────────┤
│ EquipmentList (si tiene)            │
├─────────────────────────────────────┤
│ FeatureBadges (si tiene)            │
├─────────────────────────────────────┤
│ Gallery (media.gallery via bloque)  │
├─────────────────────────────────────┤
│ FloorPlan (si tiene)                │
├─────────────────────────────────────┤
│ Documents (si tiene)                │
├─────────────────────────────────────┤
│ blocks[] (bloques custom del editor)│
├─────────────────────────────────────┤
│ ComparisonCard[] (similares)        │
├─────────────────────────────────────┤
│ Pricing + CTA reserva (si bookable)│
└─────────────────────────────────────┘
```

- Recibe un documento `accommodation` completo de Payload
- Las secciones opcionales (bedroomDetails, equipment, features,
  floorPlan, documents) no renderizan si el dato está vacío
- Los `blocks[]` se renderizan con BlockRenderer (igual que pages)
- El CTA de reserva enlaza al buscador de booking si `bookable: true`

### 7. Resolver de accommodations en site-demo

Verificar que `apps/site-demo/src/app/(frontend)/[[...slug]]/page.tsx`
(el catch-all) ya resuelve accommodations. La cadena de resolución
definida en HU-008 es: pages → accommodations → entities → articles.
Si accommodations ya está, solo falta pasar el documento al template.
Si no está, añadir la resolución.

### 8. Seed de alojamiento completo

Añadir al seed (o crear seed separado) al menos 2 alojamientos con
todos los campos rellenos: specs, equipment, bedroomDetails, features,
media con galería, pricing, y comparison entre ellos. Necesarios para
verificación visual.

## Leer antes

- `packages/core-ui/src/schemas/collections/accommodations.schema.ts`
- `apps/site-demo/src/collections/Accommodations.ts`
- `apps/site-demo/src/fields/accommodation-groups.ts`
- `apps/site-demo/docs/lenguaje-visual.md`
- `docs/estandares/codigo.md`

## Verificar contra el diseño

Antes de marcar criterios, comparar con la ficha de alojamiento del
export de Figma de La Civelle. Los tokens y espaciados deben seguir
`docs/lenguaje-visual.md`.

## Criterios de aceptación

- [ ] SpecBar muestra los 5 datos de specs con iconos correctos
- [ ] SpecBar es responsive (horizontal desktop, columnas mobile)
- [ ] EquipmentList muestra incluido/no incluido con iconos
- [ ] BedroomList renderiza descripciones con icono
- [ ] FeatureBadges renderiza badges horizontales
- [ ] ComparisonCard muestra tarjeta con imagen, nombre, precio
- [ ] AccommodationDetail compone todas las secciones en orden
- [ ] Secciones opcionales no renderizan si datos vacíos
- [ ] blocks[] del accommodation se renderizan con BlockRenderer
- [ ] CTA de reserva solo aparece si bookable: true
- [ ] Resolución /slug de accommodation funciona en el catch-all
- [ ] Seed con ≥2 alojamientos completos
- [ ] Todos los componentes pasan vitest-axe
- [ ] Tests — cobertura >80%

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|
