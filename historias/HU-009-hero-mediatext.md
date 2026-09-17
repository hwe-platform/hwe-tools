---
id: HU-009
titulo: Bloques Hero y MediaText
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Hero y MediaText son los primeros bloques reales. Hero es lo primero
que ve el visitante. MediaText es el patrón más reutilizado del Figma de
La Civelle: **aparece 7 veces** entre las tres páginas —cuatro en la home
(Intro, Restaurant, Piscine, Accès), dos en Le Camping y una en la ficha
de alojamiento—, así que es el bloque que más secciones desbloquea de
todo el catálogo.

**Ojo con el nombre "Hero":** no es un bloque del array `blocks`. En el
modelo de datos `hero` es un **grupo de campos de `pages`** (variant,
media, title, subtitle, showBreadcrumbs) y no está entre los 15 bloques.
Lo que se construye aquí es su renderizador, y por eso HU-008 deja el
hero sin pintar a propósito: para hacerlo una sola vez y aquí.

## Qué hacer

### Hero

1. Crear `@hwe-platform/core-ui/src/blocks/hero/`:
   - `hero.schema.ts` — **extraer** el schema del grupo `hero` que ya existe dentro de
     `schemas/collections/pages.schema.ts` y reutilizarlo desde ahí. **No escribirlo de nuevo**:
     duplicar esos campos reproduce la divergencia entre Zod y Payload que costó cara en HU-005,
     y el test de paridad no la detecta porque solo compara el primer nivel
   - `hero.types.ts` — tipo derivado con `z.infer`
   - `HeroBlock.tsx` — resuelve variante por mapa
   - `HeroVideo.tsx` — vídeo fullscreen con overlay oscuro,
     logo centrado, subtítulo
   - `HeroImage.tsx` — imagen con gradient overlay, breadcrumbs opcionales,
     título y subtítulo
   - `HeroBlock.test.tsx` — tests de renderizado y accesibilidad
   - `index.ts` — export público

### MediaText

2. Crear `@hwe-platform/core-ui/src/blocks/media-text/`:
   - `media-text.schema.ts` — schema Zod con image, title, text (richText),
     orientation (imageLeft/imageRight), features (array opcional con
     icon+label+detail), ctas (array opcional), badge (text opcional)
   - `media-text.types.ts`
   - `MediaTextBlock.tsx` — dos columnas responsivas, imagen a un lado,
     texto al otro. Si tiene features, las muestra como cards dentro.
     Si tiene CTAs, los muestra como botones.
   - `MediaTextBlock.test.tsx`
   - `index.ts`

### Registro

3. Registrar ambos bloques en `blockRegistry.ts`
4. Verificar que el BlockRenderer los renderiza correctamente con datos
   de Payload

## Leer antes

- docs/arquitectura/bloques.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] HeroVideo renderiza vídeo fullscreen con overlay
- [ ] HeroImage renderiza imagen con gradient y breadcrumbs
- [ ] Hero resuelve variante por mapa, no if/switch
- [ ] MediaText renderiza en dos columnas con imagen izquierda o derecha
- [ ] MediaText muestra features y CTAs si los tiene
- [ ] MediaText es responsive (apila en mobile)
- [ ] Ambos bloques usan primitivas de @hwe-platform/core-ui (Image, Button, Link)
- [ ] Ambos bloques usan tokens de Tailwind, no estilos inline
- [ ] Ambos pasan vitest-axe sin violaciones
- [ ] Tests — cobertura >80%
- [ ] Schema Zod valida datos correctos y rechaza incorrectos
- [ ] Registrados en blockRegistry y renderizan desde BlockRenderer

## Retrospectiva

_(se llena después si aplica)_
