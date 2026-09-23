---
id: HU-011
titulo: Bloque Gallery con 5 variantes y lightbox
estado: en-curso
prioridad: 3
hito: 1
agente: code-builder
rama: feat/HU-011-gallery
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

### Diferencias con lo que pide esta historia

Se listan aquí conforme aparecen, que es lo que pide el paso 4b de la
revisión. Una diferencia no listada cuenta como fallo aunque sea mejora.

| Qué dice la historia | Qué se construyó | Por qué |
|---|---|---|
| Sección 5: `aria-roledescription="carousel"` y `"slide"` | `"carrousel"` y `"diapositive"`, con los rótulos del carrusel y traducibles | A diferencia de `role`, `aria-roledescription` **se lee en voz alta**: dejarlo fijo en inglés hace que un site francés anuncie una palabra inglesa. El patrón WAI-ARIA los documenta en inglés porque su documentación lo está, no porque sean palabras clave |
| Sección 6: «import de módulos Swiper bajo demanda» | Los ocho módulos y sus seis hojas CSS son imports estáticos. Lo que decide la tabla del primitivo es qué módulos **se activan**, no cuáles se empaquetan | Un `import()` por capacidad mete estado de carga y un primer pintado sin carrusel, y no se puede medir hasta que existan las variantes. El ahorro que de verdad importa —que una galería en rejilla no cargue Swiper— se busca en el tramo de las variantes envolviendo las de carrusel con `next/dynamic`, donde sí se mide |
| Sección 8: ficheros `carousel-primitive.tsx` y `carousel-primitive.test.tsx` | `CarouselPrimitive.tsx` y `CarouselPrimitive.test.tsx` | `docs/estandares/naming.md` manda PascalCase para componentes React y «el nombre del archivo coincide con el nombre de lo que exporta, sin excepciones». Los seis primitivos ya existentes (`Button.tsx`, `Image.tsx`…) lo siguen. Los `.types.ts` y el `index.ts` sí van en kebab-case, como en `card-grid/`. El hook, que la sección 8 no nombraba, es `usePrefersReducedMotion.ts` |
| Sección 2 (variantes) y el Figma | Solo `slider-thumbs` tiene referencia en el export de La Civelle (la galería de `MobileHomePage.tsx`). `slider`, `grid`, `masonry` y `collage` **no existen en el export** | Se construyen desde esta historia, sin referencia Figma. El criterio «verificado contra el Figma» solo se puede cumplir de verdad para `slider-thumbs` |

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

Al cierre, migrado también `MediaCarousel.tsx` (bloque `media-text`, HU-009) a
`CarouselPrimitive` — no era parte formal de esta historia, pero era la
decisión acordada al empezarla y el Reviewer confirmó en modo 2 que había
quedado sin hacer, con dos implementaciones de carrusel conviviendo en el
catálogo (una con Swiper + patrón ARIA, otra con `useState` a mano y sin
teclado). Mismo aspecto visual exacto —flechas propias, contador de texto,
sin dots—, ahora con ARIA y navegación por teclado que antes no tenía.
Aislada con `next/dynamic` igual que `slider`/`slider-thumbs` de Gallery: sin
eso, `media-text` —uno de los bloques más usados— habría cargado Swiper en
cualquier página, aunque no use la variante carrusel.

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|
| Un hook exportado desde un barril que cuelga de `core-ui/index.ts` necesita `'use client'` aunque no sea un componente: el middleware y `payload.config.ts` importan ese barril, así que el módulo entra en el grafo de servidor. `next dev` no llega a ese camino y `next build` sí — el fallo aparece en el build, no en desarrollo | `docs/estandares/codigo.md`, sección nueva sobre `'use client'` | ⬜ |
| `{ ...POR_DEFECTO, ...props }` **no** equivale a los defaults por parámetro: el spread copia las claves cuyo valor es `undefined` y pisa el default. Importa en cuanto un bloque pasa campos de Payload tal cual, que llegan `undefined` sin rellenar | `docs/estandares/codigo.md`, junto a la regla de complejidad que empuja a usar la tabla | ⬜ |
| Los valores por defecto por parámetro (`x = false`) cuentan como camino para la regla `complexity` de ESLint: catorce dejaban el componente en 20 sin una sola bifurcación real | `docs/estandares/codigo.md`, sección de límites de complejidad | ⬜ |
| El `include` de cobertura de `src/primitives/**` era solo `*.tsx`, así que la lógica que no es componente no contaba para el umbral y nada avisaba. Es la misma trampa que `src/blocks/**` ya había corregido a `{ts,tsx}` | `docs/estandares/testing.md`, junto a la nota sobre umbrales que no se ejecutan | ⬜ |
| Swiper pinta flechas y puntos leyendo sus propias variables CSS, y por defecto son `#007aff`. Sin mapearlas a los tokens del cliente, los controles salen azul iOS en cualquier site | `specs/presentacion/bloques/gallery.md`, al escribirla al cierre | ⬜ |
| Dejar un módulo fuera del barril de `primitives/` no le ahorra su CSS a nadie mientras `exports` del paquete declare solo `"."` — resuelto en el tramo 2 con una subruta `@hwe-platform/core-ui/carousel` propia (`src/carousel.ts` + entrada en `exports`) | `docs/arquitectura/bloques.md`, patrón de subruta para cualquier módulo con efectos secundarios de CSS | ⬜ |
| Un `export { X } from './Y'` estático en un barril **evalúa `./Y` entero** para resolver el binding, aunque nadie importe `X` desde fuera. `blocks/gallery/index.ts` reexportaba `GallerySlider`/`GallerySliderThumbs` así, y eso volvía a arrastrar Swiper al barril principal de `core-ui` — el mismo `ERR_UNKNOWN_FILE_EXTENSION` de `payload generate:types`/`migrate:create` que la subruta del carrusel ya había resuelto, reabierto por otra puerta | `docs/estandares/codigo.md`, junto a la nota de la subruta | ⬜ |
| `next/dynamic(() => import('./X').then((m) => m.X))` carga un componente de export con nombre bajo demanda de verdad: el `import()` vive dentro de un closure que nadie llama hasta que React renderiza el componente, así que ni `payload generate:types` ni ningún otro consumidor que solo cargue el módulo (sin renderizarlo) llega a evaluarlo. Es además una versión mejor de «carga bajo demanda» que la de los módulos de Swiper: código completo, no solo tree-shaking | `docs/arquitectura/bloques.md`, como patrón para cualquier variante pesada de un bloque | ⬜ |
| **Swiper puede medir sus slides antes de que React las termine de montar**, cuando el carrusel llega vía `next/dynamic` dentro de una página con SSR: `slidesGrid` sale `[]` y el carrusel queda en blanco con imágenes de verdad ya en el DOM — no un error, un carrusel vacío sin avisar. Pasó de verdad en la demo: `GallerySlider` en sus tres configuraciones, en blanco; `GallerySliderThumbs` se libraba por casualidad porque su prop `thumbs` cambia de `null` a una instancia tras montar y ese segundo render fuerza a Swiper a remedir — con una sola imagen (sin miniaturas) le habría pasado también. Curl no lo detecta: el HTML servido es correcto, la ausencia es solo tras hidratar. Se corrigió con `onSwiper` + `useEffect(() => swiper.update(), [])` en los dos carruseles | `docs/estandares/codigo.md` o una guía nueva de «Swiper + next/dynamic + SSR», con el caso completo | ⬜ |
| Los puntos de paginación de Swiper por defecto miden 8px y no llevan ningún fondo de contraste: sobre una foto clara se pierden literalmente. Lo cazó la humana en la demo, no ningún test — `vitest-axe` no comprueba legibilidad de color por tamaño de elemento. Se subió el tamaño a 10px y se añadió un aro de doble color (negro + blanco, ambos a baja opacidad) para que funcione tanto sobre fondo claro como oscuro | `docs/estandares/seo.md` o un estándar nuevo de accesibilidad visual, con el porqué del aro de dos colores | ⬜ |
| **Swiper fija sus módulos al construirse — uno que falta en el primer render no se puede añadir después, aunque las props cambien.** `GallerySliderThumbs` monta el carrusel principal con `thumbs={miniaturas}` mientras `miniaturas` sigue siendo `null` (la barra de miniaturas todavía no ha montado su `onSwiper`), y decidir si el módulo Thumbs entraba por `thumbs !== null` lo dejaba fuera para siempre: pulsar una miniatura nunca navegaba el carrusel principal, en ningún navegador. No lo cazó ningún test —la cobertura de líneas del archivo era 100%, porque toda la lógica se ejecuta igual— ni la demo visual —la miniatura se marca activa igualmente cuando el carrusel principal avanza con las flechas, por un cableado de React aparte que no depende del módulo Thumbs, así que **parecía** sincronizado en las dos direcciones—. Lo cazó el Reviewer en modo 2 (cierre) al señalar que faltaba un test del sentido miniatura→carrusel; verificarlo con Playwright en un Chromium real confirmó el fallo. Arreglado en `CarouselPrimitive`: el módulo Thumbs se activa por si la prop `thumbs` **se pasó**, no por si su valor actual es distinto de `null` — Swiper ya trae su propio mecanismo (`needThumbsInit`) para enganchar la instancia real en cuanto llega, siempre que el módulo estuviera puesto desde el principio | `docs/arquitectura/bloques.md`, como advertencia general para cualquier primitivo de Swiper que reciba una instancia de otro componente tras un montaje en dos fases | ⬜ |
| **`fireEvent.click(elemento)` fija el `target` al nodo pedido, sin pasar por layout ni hit-testing** — un test que comprueba `evento.target === evento.currentTarget` puede dar verde aunque en un navegador real ese clic nunca ocurra sobre ese elemento. Pasó en `GalleryLightbox`: el `onClick` de cierre por fondo vivía en el `div[role=dialog]` exterior, pero el wrapper interior (`h-full w-full`) ocupa el 100% del área visible y no deja ningún hueco propio del div de fuera — cualquier clic real dentro del modal tenía como `target` ese wrapper o un descendiente, nunca el diálogo. El test pasaba porque `fireEvent.click(screen.getByRole('dialog'))` fija el target ahí directamente. Lo cazó el Reviewer en modo 1 (tramos 4+5), no un test ni la demo visual. Corregido moviendo el `onClick` al wrapper que de verdad actúa de fondo | `docs/estandares/testing.md`, junto a la advertencia ya existente de que «una prueba ejecutada no es una prueba correcta» | ⬜ |
| **Un modal con `z-50` no gana siempre.** El chrome del site llega hasta `z-100` (`FloatingActions`, `MobileMenu`) y la `TopBar` usa `z-[60]` — con `z-50`, la barra superior se pintaba encima del fondo oscuro del lightbox, visible y clicable a través del overlay. Ningún test lo cazaba: DOM, ARIA y foco eran correctos, el problema era puramente de superposición visual, solo visible con una captura real. Subido a `z-[200]` con un comentario que lista los z-index del chrome, para que la próxima vez no haga falta redescubrirlos | `docs/arquitectura/bloques.md` o `docs/estandares/codigo.md`, con la tabla de z-index del chrome (TopBar 60, BottomBookingWidget 50, FloatingActions/MobileMenu 100) para que un modal futuro sepa contra qué compite | ⬜ |

La propagación ocurre después del merge, no antes.