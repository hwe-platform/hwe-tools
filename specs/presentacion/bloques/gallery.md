# Gallery

> Implementado en HU-011 · `@hwe-platform/core-ui/src/blocks/gallery/`

El bloque con más variantes del catálogo, y uno de los de mayor impacto SEO
para hospitality — Google Images es fuente de tráfico significativa para
campings y hoteles. No consulta Payload: las imágenes llegan resueltas en el
dato, como el resto de bloques de `core-ui`.

## Variantes

El eje estructural es **cómo se ve la galería**:

| Variante | Tipo | Descripción |
|----------|------|-------------|
| `slider` | estructural | Carrusel horizontal: flechas, dots y autoplay opcionales, efecto slide o fade. El `default` del schema — cubre más casos generales |
| `slider-thumbs` | estructural | Carrusel principal + barra de miniaturas sincronizada debajo, dos instancias de `CarouselPrimitive` conectadas por el módulo Thumbs de Swiper. Única variante con referencia real en el Figma (`MobileHomePage.tsx`) |
| `grid` | estructural | Rejilla regular, CSS puro, todas las fotos al mismo tamaño |
| `masonry` | estructural | Grid tipo Pinterest (`columns-*` de Tailwind): cada foto mantiene su proporción real y cae en la columna que le toca por su alto |
| `collage` | estructural | Una imagen grande destacada (2 columnas × 2 filas) + el resto en celdas normales, CSS Grid |

Resueltas por mapa (`VARIANTES` en `GalleryBlock.tsx`). `slider` y
`slider-thumbs` se cargan con `next/dynamic` — tiran de `CarouselPrimitive`,
que tira de Swiper; `grid`, `masonry` y `collage` son imports normales, CSS
puro, sin Swiper.

## Ejes

| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `variant` | estructural | `slider` \| `slider-thumbs` \| `grid` \| `masonry` \| `collage` | Cambia la anatomía completa |
| `columns` | estilo | number (2–4) | Solo `grid` y `masonry` |
| `aspectRatio` | estilo | `16/9` \| `4/3` \| `3/2` \| `1/1` \| `auto` | Proporción del marco de cada imagen. `masonry` la ignora siempre, con o sin este valor |
| `lightbox` | comportamiento | bool | Visor a pantalla completa al pulsar una imagen |
| `autoplay` / `autoplayDelay` | comportamiento | bool / number | Solo `slider` y `slider-thumbs` |
| `loop` | comportamiento | bool | Solo `slider` y `slider-thumbs` |
| `showDots` | estilo | bool | Solo `slider` |
| `showArrows` | estilo | bool | Solo `slider` y `slider-thumbs` |
| `effect` | estilo | `slide` \| `fade` | Solo `slider` |
| `slidesPerView` | estilo | number | Solo `slider`, para el multi-slide |
| `headingLevel` | estructural | `'2'` \| `'3'` \| `'4'` | Nunca `'1'` — string, como el resto de selects del catálogo |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |

`aspectRatio` tiene su propia tabla en `proporciones.ts`
(`16/9 | 4/3 | 3/2 | 1/1 | auto`) y no la de la primitiva `Image`
(`16/9 | 4/3 | 1/1 | 3/4`, fijada en HU-006): son dominios distintos, y no se
toca la primitiva por un bloque. Mismo patrón que `media-text` con su propio
`ratio.ts`.

`columns` acotado a 2–4, no al 1–12 de `icon-grid`/`card-grid`: una galería de
una columna no es una rejilla, y por encima de cuatro las fotos se quedan sin
sitio para respirar.

## Campos del schema

### Bloque

| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `description` | textarea, localized | no | — | Párrafo entre el titular y la galería |
| `background` | select | no | `default` | default \| muted \| none |
| `variant` | select | no | `slider` | |
| `images` | array | **sí**, mínimo 1 | — | Ver «Imagen» abajo |
| `columns` | number | no | `3` | 2–4. Visible solo si `variant` es `grid` o `masonry` |
| `aspectRatio` | select | no | `16/9` | 16/9 \| 4/3 \| 3/2 \| 1/1 \| auto |
| `lightbox` | checkbox | no | `true` | |
| `autoplay` | checkbox | no | `false` | Visible solo si `variant` es slider o slider-thumbs |
| `autoplayDelay` | number | no | `3000` | Entero positivo (`min: 1` en Payload). Visible solo si `autoplay` |
| `loop` | checkbox | no | `true` | Visible solo si `variant` es slider o slider-thumbs |
| `showDots` | checkbox | no | `true` | Visible solo si `variant: slider` |
| `showArrows` | checkbox | no | `true` | Visible solo si `variant` es slider o slider-thumbs |
| `effect` | select | no | `slide` | slide \| fade. Visible solo si `variant: slider` |
| `slidesPerView` | number | no | `1` | Entero positivo (`min: 1` en Payload). Visible solo si `variant: slider` |
| `headingLevel` | select | no | `'2'` | '2' \| '3' \| '4' |
| `ctas` | array | no | `[]` | Mismo formato que el resto de bloques de sección |

### Imagen (`images[]`)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `image` | upload → media | sí | |
| `alt` | text, localized | **sí** | Zod lo rechaza vacío. Gana sobre el `alt` del archivo — describe la foto en el contexto de esta galería |
| `caption` | text, localized | no | Se pinta como `<figcaption>` cuando está presente |

## Lightbox

Transversal a las cinco variantes — cualquiera abre el mismo visor, con la
imagen pulsada como punto de partida. `lightbox: false` no pinta ningún botón
en ninguna figura (no hay una prop `enabled`: sin `GalleryLightboxProvider`
montado, `useGalleryLightbox()` devuelve `null`).

- Zoom con pellizco (móvil) y doble clic (desktop), vía el módulo Zoom de
  Swiper — nada de esto es una librería de lightbox aparte.
- Navegación con flechas, swipe y teclado (← → Esc). Sin `loop`, a diferencia
  del slider normal: en pantalla completa, volver al principio de golpe es
  más desorientador que útil.
- `role="dialog"` + `aria-modal="true"`, focus trap al abrir (foco al primer
  elemento operable, Tab cicla dentro), devuelve el foco a quien lo abrió al
  cerrar.
- Cierra con Escape, con el botón de cerrar, o al pulsar el fondo — el
  `onClick` de cierre por fondo vive en el wrapper que de verdad ocupa el
  área visible del overlay, no en el `div[role=dialog]` exterior (ver
  Aprendizajes de HU-011).
- Bloquea el scroll del body mientras está abierto.
- `z-[200]`: el chrome del site llega hasta `z-100` (`FloatingActions`,
  `MobileMenu`), y un modal tiene que ganar siempre, no empatar.
- Cargado bajo demanda con `next/dynamic` dentro de `GalleryLightboxProvider`
  — el código del visor no se pide hasta el primer clic.

## Dependencias

- `CarouselPrimitive` / `CarouselSlide` de `@hwe-platform/core-ui/carousel` — único punto del catálogo que toca Swiper, usado tres veces: el carrusel principal de `slider`, las dos instancias de `slider-thumbs`, y el lightbox
- Primitivas: `Button`, `Icon`, `Image`
- `proporcionDe()`, `reticulaDe()`, `columnasDe()` de `proporciones.ts`
- `Cabecera`, `BlockCtas`, `fondoDe()` de `blocks/seccion.tsx`
- `normalizePayloadData` — el bloque se puede usar fuera del renderer, y un dato crudo con `null` dejaría la sección en blanco

## Decisiones relevantes

- **Sin JSON-LD propio.** Diferido a HU-013 (structured data transversal) — no hay ninguna función suelta de JSON-LD en este bloque.
- **Verificación visual contra el Figma solo para `slider-thumbs`**: es la única variante con referencia real en el export de La Civelle. `slider`, `grid`, `masonry` y `collage` se construyeron desde la historia, sin comparación visual posible — verificadas en navegador (regla 6), no contra un export que no existe.
- Swiper aislado en su propia subruta de exports (`@hwe-platform/core-ui/carousel`) y cargado bajo demanda vía `next/dynamic` para `slider`/`slider-thumbs`/el lightbox — ninguna variante CSS pura carga Swiper, y `payload generate:types`/`migrate:create` no rompen por el CSS de la librería. Ningún archivo de `blocks/gallery/` reexporta esas piezas de forma estática (ver Aprendizajes).
- `aria-roledescription` traducido al francés (`"carrousel"`, `"diapositive"`) en vez de dejar el inglés del patrón WAI-ARIA — a diferencia de `role`, este atributo se lee en voz alta.
- Dos bugs reales encontrados en la revisión de cierre, no solo huecos de cobertura: el cierre del lightbox al pulsar el fondo, y que `slider-thumbs` nunca navegaba el carrusel principal al pulsar una miniatura (Swiper fija sus módulos al construirse; `CarouselPrimitive` decide si activa el módulo Thumbs por si la prop se pasó, no por si ya tiene instancia). Los dos, con su causa raíz completa, están documentados en Aprendizajes de `HU-011-gallery.md`.
- `MediaCarousel` (bloque `media-text`, HU-009) migrado a `CarouselPrimitive` al cierre de esta historia — no era parte de su alcance formal, pero sí una decisión acordada al empezarla.
