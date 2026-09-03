---
id: HU-011
titulo: Bloques Gallery, Map, SpecBar y EquipmentList
estado: spec-lista
prioridad: 3
hito: 1
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Gallery y Map completan las secciones de la home. SpecBar y EquipmentList
son específicos de las fichas de alojamiento — sin ellos, la página de
detalle de un alojamiento no tiene la información que el visitante necesita
para decidir reservar.

## Qué hacer

### Gallery

1. Crear `@hwe-platform/core-ui/src/blocks/gallery/`:
   - `gallery.schema.ts` — title, variant (carousel/thumbnails),
     images array (media + caption opcional)
   - `GalleryBlock.tsx` — resuelve variante por mapa
   - `GalleryCarousel.tsx` — carrusel con flechas prev/next
   - `GalleryThumbnails.tsx` — imagen principal grande + thumbnails
     debajo, click para cambiar principal
   - Tests y exports

### Map

2. Crear `@hwe-platform/core-ui/src/blocks/map/`:
   - `map.schema.ts` — title, showTransport (boolean)
   - `MapBlock.tsx` — lee coordenadas y transporte de site-config.
     Google Maps embed (iframe) o mapa estático según config.
     Sección de acceso con dirección y transportes al lado.
   - Tests y exports

### SpecBar

3. Crear `@hwe-platform/core-ui/src/blocks/spec-bar/`:
   - No es un bloque del page builder — es un componente de la ficha
     de alojamiento. Vive en `@hwe-platform/core-ui/src/blocks/accommodation-detail/`
   - `SpecBar.tsx` — barra horizontal con iconos:
     capacidad, habitaciones, superficie, climatización
   - Datos vienen de `accommodations.specs`
   - Tests y exports

### EquipmentList

4. Crear en `@hwe-platform/core-ui/src/blocks/accommodation-detail/`:
   - `EquipmentList.tsx` — checklist con iconos incluido/no incluido
   - Datos vienen de `accommodations.equipment`
   - Tests y exports

### Accommodation Detail template

5. Crear `hwe-template/src/templates/AccommodationDetail.tsx`:
   - Compone: Hero (imagen) + GalleryThumbnails + SpecBar +
     description + bedroomDetails + EquipmentList +
     bloques custom (si tiene) + ComparisonCard (si tiene)
   - Recibe un accommodation de Payload como prop

6. Registrar Gallery y Map en `blockRegistry.ts`

## Leer antes

- docs/arquitectura/bloques.md
- specs/payload/modelo-datos.md (sección accommodations)
- docs/estandares/codigo.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] GalleryCarousel navega entre imágenes con flechas
- [ ] GalleryThumbnails cambia imagen principal al clicar thumbnail
- [ ] Gallery resuelve variante por mapa
- [ ] MapBlock renderiza mapa con coordenadas de site-config
- [ ] MapBlock muestra transportes si showTransport=true
- [ ] SpecBar muestra iconos con datos de specs del alojamiento
- [ ] EquipmentList muestra checklist incluido/no incluido
- [ ] AccommodationDetail compone todos los componentes de ficha
- [ ] Todos pasan vitest-axe
- [ ] Tests — cobertura >80%
- [ ] Gallery y Map registrados en blockRegistry

## Retrospectiva

_(se llena después si aplica)_
