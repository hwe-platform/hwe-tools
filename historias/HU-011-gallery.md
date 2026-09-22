---
id: HU-011
titulo: Bloque Gallery con 5 variantes y lightbox
estado: spec-lista
prioridad: 3
hito: 1
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Gallery es el bloque con más variantes del site y uno de los de mayor
impacto SEO para hospitality. Google Images es fuente de tráfico
significativa para campings y hoteles.

El proyecto antiguo tenía este bloque completamente implementado con
5 variantes, lightbox, y accesibilidad completa. La referencia técnica
está en `docs/guides/guia-galleryblock.md` (repo antiguo). Esta HU
reimplementa todo adaptado al stack nuevo.

### Arquitectura en dos capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **CarouselPrimitive** | `core-ui/src/primitives/carousel/` | Wrapper reutilizable de Swiper.js. Encapsula configuración, módulos, y lógica compartida. No es un bloque — es un primitivo que cualquier bloque puede consumir (ReviewsBlock futuro, logo slider del footer, promos). Ningún bloque importa Swiper directamente. |
| **GalleryBlock** | `core-ui/src/blocks/gallery/` | Bloque de galería de imágenes. Usa CarouselPrimitive para las variantes de carrusel. Define el schema, las variantes visuales, y la lógica de lightbox. |

### Dependencia aprobada

**Swiper.js** (MIT, ~20KB con tree-shaking por módulos).

Justificación: la alternativa (Embla Carousel, ~7KB) es headless — no trae
accesibilidad, ni thumbnails sincronizados, ni lightbox, ni autoplay. Todo
eso habría que implementarlo a mano. El código ahorrado en bundle se gasta
con creces en implementación. Swiper trae de serie los módulos A11y,
Navigation, Pagination, Thumbs, Zoom, Keyboard, Autoplay, y EffectFade.

## Qué hacer

### 1. CarouselPrimitive

Crear `@hwe-platform/core-ui/src/primitives/carousel/`:
- `carousel-primitive.tsx` — wrapper de Swiper con props tipadas
- `carousel-primitive.types.ts` — tipos exportados
- `carousel-primitive.test.tsx` — tests
- `index.ts` — export público

El primitivo encapsula:
- Import de módulos Swiper bajo demanda (solo los que la variante necesita)
- Props tipadas para navigation, pagination, thumbs, autoplay, loop, effect
- ARIA carousel pattern (via módulo A11y de Swiper)
- Respeto de `prefers-reduced-motion` (desactiva autoplay y transiciones)
- Server shell + client island (el carousel es client component, el wrapper puede ser server)

**Regla:** ningún bloque importa Swiper directamente. Todos van por
CarouselPrimitive. Si mañana se cambia Swiper por otra librería, solo
se toca este primitivo.

### 2. GalleryBlock — 5 variantes

Crear `@hwe-platform/core-ui/src/blocks/gallery/`:

#### Variantes con carrusel (usan CarouselPrimitive)

**`slider`** — Carrusel horizontal clásico. Flechas + dots + autoplay opcional.
Módulos: Navigation, Pagination, Autoplay, A11y, EffectFade (si effect=fade).
Uso: galerías generales (home, servicios, entorno).

**`slider-thumbs`** — Carrusel con barra de miniaturas sincronizada debajo.
Dos instancias de Swiper conectadas via módulo Thumbs.
Módulos: Navigation, Thumbs, A11y.
Uso: fichas de alojamiento (la variante estrella en hospitality).

#### Variantes estáticas (CSS puro, sin Swiper)

**`grid`** — Grid responsive de columnas (2-4 configurables). CSS Grid.
Uso: listados donde importa ver todo de un vistazo.

**`masonry`** — Grid tipo Pinterest con alturas variables. CSS `columns`.
Uso: portfolios visuales, páginas de entorno.

**`collage`** — 1 imagen grande destacada + varias pequeñas. CSS Grid con areas.
Uso: cabecera de galería, sección destacada.

**Las 5 variantes son estructurales** → componentes separados resueltos por mapa.

#### Lightbox (transversal a todas las variantes)

Al hacer click en una imagen se abre visor fullscreen:
- Navegación flechas + swipe mobile
- Zoom pinch (mobile) + doble click (desktop)
- Keyboard: ← → navegar, Esc cerrar
- Caption visible
- Focus trap al abrir, devuelve foco al cerrar
- `role="dialog"` + `aria-modal="true"`

Se implementa con otra instancia de Swiper (fullscreen + módulos Zoom,
Navigation, Keyboard, A11y). Sin librería de lightbox externa.
Desactivable con `lightbox: false`.

### 3. Schema

```
gallery (block)
├── title              (text, localized, opcional)
├── description        (text, localized, opcional — párrafo bajo el título)
├── background         (select: default | muted | none — mismo patrón HU-009)
├── variant            (select: slider | slider-thumbs | grid | masonry | collage)
├── images             (array, mín. 1)
│   ├── image          (upload → media — obligatorio)
│   ├── alt            (text, localized — OBLIGATORIO, Zod rechaza sin alt)
│   └── caption        (text, localized, opcional — se renderiza como figcaption)
├── columns            (number — 2, 3 o 4 — solo grid y masonry)
├── aspectRatio        (select: 16/9 | 4/3 | 3/2 | 1/1 | auto)
├── lightbox           (boolean, default true)
├── autoplay           (boolean, default false — solo slider, slider-thumbs)
├── autoplayDelay      (number ms, default 3000 — solo si autoplay true)
├── loop               (boolean, default true — solo slider, slider-thumbs)
├── showDots           (boolean, default true — solo slider)
├── showArrows         (boolean, default true — solo slider, slider-thumbs)
├── effect             (select: slide | fade — solo slider)
├── slidesPerView      (number, default 1 — solo slider, para multi-slide)
├── headingLevel       (select: 2 | 3 | 4, default 2)
└── ctas               (array, opcional — mismo formato que HU-009/010)
```

**Nota sobre images:** en Payload, `image` es un `upload` que apunta a la
colección `media`. Las dimensiones (width, height) vienen de media. El `alt`
se puede heredar de media pero se sobreescribe aquí si se rellena — el del
bloque gana.

### 4. SEO

- **alt obligatorio** — Zod rechaza imágenes sin alt en el boundary
- **next/image** con `width`/`height` de media → evita CLS
- **priority={true}** en la primera imagen visible del viewport → mejora LCP
- **`<figure>` + `<figcaption>`** cuando la imagen tiene caption
- **JSON-LD ImageGallery** — schema.org con la lista de imágenes. Se genera
  en `services/json-ld/` (conecta con HU-013 cuando esté implementada)
- **Heading hierarchy** — el título se renderiza al headingLevel configurado,
  nunca `<h1>`

### 5. Accesibilidad

El carrusel sigue WAI-ARIA Carousel Pattern:

| Atributo | Elemento | Valor |
|----------|----------|-------|
| `role="region"` | contenedor del carrusel | Región landmark |
| `aria-roledescription="carousel"` | contenedor del carrusel | Identifica como carrusel |
| `aria-label` | contenedor del carrusel | Describe la galería |
| `role="group"` | cada slide | Agrupa contenido de la slide |
| `aria-roledescription="slide"` | cada slide | Identifica la slide |
| `aria-label` | cada slide | "Imagen 1 de 12" |

Keyboard: ← → navegar, Enter/Space abrir lightbox, Esc cerrar, Tab entre controles.

`prefers-reduced-motion`: autoplay se desactiva, transiciones instantáneas.

### 6. Rendimiento

- Lazy loading nativo de next/image en todas las imágenes excepto la primera visible
- Import de módulos Swiper bajo demanda (solo los que la variante necesita)
- Variantes estáticas (grid, masonry, collage) no cargan Swiper
- next/image genera srcset responsive automáticamente

### 7. Personalización por tokens

Controles del carrusel via design tokens del cliente:
- Flechas: `var(--color-on-surface)` + `var(--color-surface/80%)`
- Dots activo: `var(--color-primary)`
- Dots inactivo: `var(--color-on-surface/30%)`
- Lightbox fondo: `rgba(0, 0, 0, 0.9)`

### 8. Ficheros

```
core-ui/src/primitives/carousel/
├── carousel-primitive.tsx
├── carousel-primitive.types.ts
├── carousel-primitive.test.tsx
└── index.ts

core-ui/src/blocks/gallery/
├── gallery.schema.ts
├── gallery.types.ts
├── GalleryBlock.tsx          → resuelve variante por mapa
├── GallerySlider.tsx         → usa CarouselPrimitive
├── GallerySliderThumbs.tsx   → dos CarouselPrimitive sincronizados
├── GalleryGrid.tsx           → CSS Grid puro
├── GalleryMasonry.tsx        → CSS columns
├── GalleryCollage.tsx        → CSS Grid con areas
├── GalleryLightbox.tsx       → CarouselPrimitive fullscreen
├── __tests__/
│   ├── gallery.test.tsx
│   ├── gallery-slider.test.tsx
│   ├── gallery-lightbox.test.tsx
│   └── carousel-primitive.test.tsx
└── index.ts
```

### 9. Registro y costura

- Registrar en `blockRegistry.ts` de plataforma
- Crear en `apps/site-demo/src/blocks/`
- Demo con al menos 2 variantes: `slider-thumbs` (ficha alojamiento)
  y `grid` (galería general), con imágenes realistas de La Civelle

## Leer antes

- `docs/lenguaje-visual.md` del repo del cliente — antes de escribir JSX
- docs/arquitectura/bloques.md
- La guía del proyecto antiguo: `guia-galleryblock.md` y `guia-uso-galleryblock.md`
  (repo `AD-Web-Headless-IA/hwe-tools`, carpeta `docs/guides/`) — como referencia
  de la lógica y los patrones, NO copiar código directamente
- docs/estandares/codigo.md
- docs/estandares/testing.md

## Verificar contra el diseño

Antes de marcar cualquier criterio, comparar lo construido con el
export de Figma. Blog no tiene Figma — pero Gallery sí (la sección
de galería existe en la home y en las fichas de La Civelle).

- Cada elemento usa el token que le asigna `docs/lenguaje-visual.md`
- Se respetan el ritmo vertical y el contenedor
- Las diferencias con el diseño están listadas y justificadas

Ver `specs/figma/analisis.md`, sección "Verificar contra el diseño".

## Criterios de aceptación

### CarouselPrimitive
- [ ] Wrapper reutilizable de Swiper con props tipadas
- [ ] Import de módulos bajo demanda (no se carga todo Swiper)
- [ ] ARIA carousel pattern completo (via módulo A11y)
- [ ] `prefers-reduced-motion` respetado
- [ ] Tests — cobertura >80%

### Gallery — variantes
- [ ] slider: flechas + dots + autoplay + loop + effect fade/slide
- [ ] slider: multi-slide con slidesPerView responsive
- [ ] slider-thumbs: dos carruseles sincronizados
- [ ] grid: columnas 2-4, responsive
- [ ] masonry: CSS columns, alturas variables
- [ ] collage: 1 grande + N pequeñas, CSS Grid areas
- [ ] Las 5 variantes resueltas por mapa (componentes separados)

### Gallery — lightbox
- [ ] Fullscreen con zoom (pinch mobile + double click desktop)
- [ ] Navegación flechas + swipe + keyboard (← → Esc)
- [ ] Focus trap al abrir, devuelve foco al cerrar
- [ ] `role="dialog"` + `aria-modal="true"`
- [ ] Caption visible en lightbox
- [ ] Desactivable con lightbox: false

### Gallery — SEO
- [ ] alt obligatorio — Zod rechaza sin alt
- [ ] next/image con width/height → sin CLS
- [ ] priority={true} en primera imagen visible
- [ ] `<figure>` + `<figcaption>` cuando hay caption
- [ ] headingLevel configurable, nunca `<h1>`

### Gallery — campos transversales
- [ ] background: default | muted | none
- [ ] description: párrafo bajo el título
- [ ] ctas: array opcional de botones

### Transversal
- [ ] Todos pasan vitest-axe
- [ ] Tests — cobertura >80%
- [ ] Schemas Zod validan correctamente
- [ ] Registrado en blockRegistry
- [ ] Demo en site-demo con al menos slider-thumbs y grid
- [ ] Verificado contra el Figma

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_