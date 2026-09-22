# MediaText

> Implementado en HU-009 · `@hwe-platform/core-ui/src/blocks/media-text/`

El bloque que más secciones cubre del catálogo: **siete** de las tres páginas
analizadas, con tres repartos distintos, los tres tipos de medio y las dos
orientaciones. Sus ejes salen de comparar esas siete, no de imaginarlas.

## Variantes

El eje estructural es **el tipo de medio**, no la posición:

| Variante | Tipo | Descripción |
|----------|------|-------------|
| `image` | estructural | Una imagen en el marco |
| `embed` | estructural | `<iframe>` con dominio de la lista blanca |
| `carousel` | estructural | Galería con estado y botones anterior/siguiente |

Resueltas por mapa (`MediaImage`, `MediaEmbed`, `MediaCarousel`). Una `<img>`,
un `<iframe>` y una galería con estado no comparten anatomía; resolverlos con un
`if` los mezclaría en un componente que hace tres cosas.

**La posición de la imagen no es una variante**: es `reverse`, un booleano de
estilo que cambia el `order` de las dos columnas. Izquierda y derecha comparten
el mismo HTML.

## Ejes

| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `media` | estructural | `image` \| `embed` \| `carousel` | Cambia la anatomía del medio |
| `split` | estilo | number (1–11) | Columnas que ocupa el medio sobre doce |
| `reverse` | estilo | bool | Medio a la derecha |
| `align` | estilo | `start` \| `center` | Alineación vertical de las dos columnas |
| `ratio` | estilo | `portrait` \| `landscape` \| `square` | Proporción del marco |
| `eyebrowRule` | estilo | bool | Línea de acento a la izquierda del antetítulo |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |

`split` es **número, no enumeración de los repartos vistos**. La Civelle ya usa
5, 6 y 7; fijar esa lista se rompería con el primer cliente que quiera otro. Las
once clases posibles se declaran en `ratio.ts` porque Tailwind no genera clases
desde una variable en tiempo de ejecución — eso es cómo se materializa el eje,
no su dominio.

La columna de texto ocupa el resto: `12 - split`.

## Campos del schema

| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | Antetítulo, se pinta con `Eyebrow` |
| `titleAccent` | text, localized | no | — | Segunda línea del titular, en color de acento |
| `content` | richText, localized | no | — | Cuerpo (Lexical) |
| `media` | select | sí | `image` | image \| embed \| carousel |
| `image` | upload → media | **condicional** | — | Exigido si `media: image` |
| `images` | upload hasMany | **condicional** | — | Exigido si `media: carousel` |
| `embedUrl` | text | **condicional** | — | Exigido si `media: embed`. Lista blanca de dominios |
| `split` | number | no | 6 | 1–11 |
| `reverse` | checkbox | no | `false` | |
| `eyebrowRule` | checkbox | no | `false` | |
| `align` | select | no | `center` | start \| center |
| `ratio` | select | no | `landscape` | portrait \| landscape \| square |
| `background` | select | no | `default` | |
| `ctas` | array | no | `[]` | |
| `slotId` | text | no | — | Identificador del slot de esta instancia |

### Obligatoriedad condicional

Los tres campos de medio son **opcionales por separado y obligatorios según
`media`**. Lo resuelve un `superRefine` del schema, no `required`:

```
media: 'image'    → exige image
media: 'embed'    → exige embedUrl
media: 'carousel' → exige images (array no vacío)
```

El error sale en el campo que falta, no en el bloque. En Payload los tres van
con `admin.condition`, así que el editor solo ve el que toca.

### Lista blanca de `embedUrl`

Solo `https` y solo de: `www.google.com`, `maps.google.com`,
`www.youtube-nocookie.com`, `player.vimeo.com` (`DOMINIOS_INCRUSTABLES`).

La regla está **en tres sitios a propósito**: el schema Zod (`refine`), el
`validate` del campo de Payload —para que el fallo salga en el panel al guardar
y no en silencio al pintar— y el propio `MediaEmbed` antes de montar el
`<iframe>`.

## Slots

| Slot | Dónde | Por qué existe |
|------|-------|----------------|
| `aside` | Caja bajo el texto | El Figma pone **tres cosas distintas** en el mismo sitio: horarios del restaurante, mini-tarjetas de la piscina, barra de estadísticas de Le Camping |
| `sobreLaImagen` | Adorno flotante sobre el medio | El medallón «Depuis 30 Ans», que es de La Civelle y de nadie más |

Solo existen los dos que un diseño real pidió. Se parametrizan **por dónde van,
no por qué son**. El site los conecta por `slotId` contra su `slot-registry`.

## Dependencias

- Primitivas: `Button`, `Image`, `Link`, `Eyebrow`, `RichText`
- `columnasDe()` y `PROPORCIONES` de `ratio.ts` — la tabla de proporciones vive ahí porque los tres medios comparten marco (estaba copiada en los tres: a la tercera copia se extrae, `codigo.md`)
- `BlockCtas` y `fondoDe()` de `blocks/seccion.tsx`
- `normalizePayloadData` — el bloque se puede usar fuera del renderer, y un dato crudo con `null` dejaría la sección en blanco

## Decisiones relevantes

- El titular va en color de marca en todo el export, y se parte en dos con la segunda línea en acento cuando hay `titleAccent`. Campo separado, no richText en títulos.
- **El «párrafo destacado» del lenguaje visual no se fija aquí**: su tamaño varía por sección —22px en la intro, 20px en Piscine, 18px en Restaurant—, así que es un eje y no un valor. Fijarlo acertaba en una de tres. Pendiente de decisión del Planner.
- Los rótulos del carrusel y del marco incrustado son interfaz, no contenido: van como props con valor por defecto en francés, no salen de Payload.
- `background` con tres opciones es patrón transversal, reutilizado luego en IconGrid, CardGrid y Blog.
