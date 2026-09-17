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
   - `HeroVideo.tsx` — vídeo a pantalla completa con overlay oscuro
   - `HeroImage.tsx` — imagen con gradiente, breadcrumbs opcionales
   - `HeroBlock.test.tsx` — tests de renderizado y accesibilidad
   - `index.ts` — export público

**Ejes de variación**, extraídos de los tres heros del Figma (home con vídeo,
Le Camping y la ficha de alojamiento):

| Eje | Tipo | Dominio | Visto en el Figma |
|---|---|---|---|
| `variant` | **estructural** | `video` \| `image` | ambos |
| `title` | **estructural** | `logo` \| `text` | la home usa el logo; las interiores, texto |
| `align` | estilo | `center` \| `left` | home centrado, interiores a la izquierda |
| `breadcrumbs` | datos | lista de niveles | 0 en la home, 2 en Le Camping, 3 en la ficha |

**El breadcrumb vive aquí, no en el layout**: en el Figma está dentro del hero
de cada página, no en la barra de navegación.

**Decisión de accesibilidad y SEO que hay que tomar aquí:** el hero de la home
del Figma **no tiene `<h1>` de texto** — su título es la imagen del logo. Eso
deja la página sin encabezado principal legible. No se copia tal cual: hay que
decidir dónde vive el `<h1>` (un `<h1>` visualmente oculto con el nombre del
site es lo habitual) y dejarlo escrito.

### MediaText

**Es el bloque de mayor impacto de todo el catálogo: cubre 7 secciones** de las
tres páginas analizadas. Sus ejes salen de comparar esas 7, no de imaginar.

2. Crear `@hwe-platform/core-ui/src/blocks/media-text/`:
   - `media-text.schema.ts` — schema Zod: `title`, `subtitle`, `content`
     (richText), `media`, `ctas` (array opcional)
   - `media-text.types.ts`
   - `MediaTextBlock.tsx` — dos columnas responsivas
   - `MediaTextBlock.test.tsx`
   - `index.ts`

**Ejes de variación** (ver `docs/arquitectura/bloques.md`). Se diseñan por la
dimensión que varía, no por los valores que toma La Civelle — esos son ejemplos:

| Eje | Tipo | Dominio | Visto en el Figma |
|---|---|---|---|
| `media` | **estructural** | `image` \| `iframe` \| `carousel` | los tres: fotos, el mapa de Google, los carruseles de Le Camping |
| `split` | estilo | `number` — columnas del medio sobre 12 | 5, 7 y 6 |
| `reverse` | estilo | bool | Piscine y Services van invertidos |
| `align` | estilo | `center` \| `start` | Restaurant centrado, Accès arriba |
| `ctas` | datos | lista | de 0 a 2 |

`media` es estructural, así que va por mapa a componentes separados
(`MediaImage`, `MediaEmbed`, `MediaCarousel`), nunca con `if`. El resto, CVA.

**Slots.** Solo se abren los que un diseño real pide:

| Slot | Qué resuelve |
|---|---|
| `aside` | La caja que acompaña al texto: horarios del restaurante, mini-tarjetas de la piscina, barra de estadísticas de Le Camping. Son tres cosas distintas en el mismo hueco — el caso de libro para un slot, no para tres props |
| `sobreLaImagen` | El medallón «Depuis 30 Ans» de la intro. Es de La Civelle y de nadie más: va en su repo, no en plataforma |

No abrir más slots "por si acaso".

### Registro y costura del cliente

3. Registrar ambos bloques en `blockRegistry.ts` de plataforma
4. Crear su fichero en `apps/site-demo/src/blocks/`, aunque solo sea un
   reexport de tres líneas: es lo que hace descubrible la personalización
   (ver "Tres niveles de uso por cliente" en `bloques.md`)
5. Rellenar en el site el slot `sobreLaImagen` con el medallón «Depuis 30 Ans»
   — es el primer uso real de un slot y sirve para comprobar que el mecanismo
   funciona de punta a punta
6. Verificar que el BlockRenderer los renderiza con datos reales de Payload

## Leer antes

- docs/arquitectura/bloques.md — en particular "Ejes de variación y slots"
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] HeroVideo renderiza vídeo fullscreen con overlay
- [ ] HeroImage renderiza imagen con gradient y breadcrumbs
- [ ] Hero resuelve variante por mapa, no if/switch
- [ ] La página tiene un `<h1>` legible aunque el hero muestre el logo
- [ ] MediaText renderiza en dos columnas con imagen izquierda o derecha
- [ ] MediaText acepta imagen, iframe y carrusel como medio
- [ ] MediaText admite cualquier reparto de columnas, no solo los del Figma
- [ ] El slot `aside` acepta las tres cajas distintas del Figma (horarios,
      features y estadísticas) sin cambiar el bloque
- [ ] El site rellena `sobreLaImagen` con el medallón, y el bloque de
      plataforma sigue sin saber nada de él
- [ ] MediaText es responsive (apila en mobile)
- [ ] Ambos bloques usan primitivas de @hwe-platform/core-ui (Image, Button, Link)
- [ ] Ambos bloques usan tokens de Tailwind, no estilos inline
- [ ] Ambos pasan vitest-axe sin violaciones
- [ ] Tests — cobertura >80%
- [ ] Schema Zod valida datos correctos y rechaza incorrectos
- [ ] Registrados en blockRegistry y renderizan desde BlockRenderer

## Retrospectiva

_(se llena después si aplica)_
