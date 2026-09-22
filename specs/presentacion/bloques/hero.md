# Hero

> Implementado en HU-009 · `@hwe-platform/core-ui/src/blocks/hero/`

**No es un bloque del page builder**: es un grupo de campos de `pages`, así que
no se registra en el registry. Lo invoca la plantilla de página una sola vez,
antes de los bloques.

## Variantes

| Variante | Tipo | Descripción |
|----------|------|-------------|
| `video` | estructural | Pantalla completa con vídeo de fondo, velo plano + degradado vertical |
| `image` | estructural | Página interior: imagen atenuada con degradado **del color de marca** |
| `minimal` | estructural | Sin imagen, sobre el color de marca |
| `none` | — | La página no lleva cabecera |

Resueltas por mapa (`HeroVideo`, `HeroImage`, `HeroMinimal`).

**`none` no tiene componente a propósito.** No es un olvido: significa «esta
página no lleva cabecera», y su ausencia del mapa es exactamente lo que la hace
no pintar nada. Es además el valor por defecto en Payload, para que una página
nueva no estrene cabecera sin que nadie la pida.

`minimal` tampoco sale del Figma de La Civelle: existe porque el modelo de datos
ya declaraba la variante, y una variante declarada que no pinta nada es una
página en blanco esperando a que alguien la elija en el panel.

## Ejes

| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `variant` | estructural | `video` \| `image` \| `minimal` \| `none` | Cambia la anatomía |
| `titleMode` | estilo | `text` \| `logo` | Qué hace de título visible |
| `align` | estilo | `left` \| `center` | Alineación del contenido |
| `showBreadcrumbs` | datos | bool | Solo lo pintan `image` y `minimal` |

**`titleMode` y `align` son independientes de `variant` a propósito.** En el
Figma van correlacionados —el hero de vídeo lleva logo y centrado, los de imagen
llevan texto a la izquierda— pero esa correlación es de un cliente, no del
sistema: separarlos cuesta lo mismo y absorbe diseños no vistos.

## Campos del schema

| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `variant` | select | sí | `none` | video \| image \| minimal \| none |
| `media` | upload → media | no | — | Vídeo en `video`, imagen de fondo en `image` |
| `eyebrow` | text, localized | no | — | Supertítulo. En el diseño, la localización |
| `title` | text, localized | **no** | — | Opcional: con `titleMode: logo` el titular es el logo |
| `subtitle` | text, localized | no | — | |
| `titleMode` | select | no | `text` | text \| logo |
| `align` | select | no | `left` | left \| center |
| `showBreadcrumbs` | checkbox | no | `false` | |

Las migas **no son un campo**: llegan como prop `breadcrumbs` desde la
plantilla, que es quien conoce la jerarquía de la página. `showBreadcrumbs` solo
dice si se pintan.

Tampoco son campos `logoUrl` ni `siteName`: salen del global del site y entran
como props.

## Accesibilidad

**La página siempre tiene un `<h1>`.** Con `titleMode: logo` el titular es la
imagen del logo, y entonces el `<h1>` se pinta igual pero oculto (`sr-only`) con
el nombre del site. El export deja esa página sin encabezado legible; es un
fallo de accesibilidad y SEO que no se copia (DEC-002).

El mismo texto —nombre del site, o el título si no lo hay— sirve de encabezado
oculto y de `alt` del logo: calcularlos por separado ya hizo que uno cayera al
título y el otro a cadena vacía.

El vídeo va `muted` obligatoriamente, o el navegador bloquea la reproducción
automática y queda un rectángulo negro; y `aria-hidden`, porque es decorado.

## Dependencias

- Primitivas: `Image`, `Icon`, `Link`, `Eyebrow` (en su tamaño `lg`, el único sitio del diseño con ese espaciado entre letras)
- `HeroTitle` — las tres piezas de texto, compartidas por las tres variantes
- `HeroBreadcrumbs` — vive en el hero y no en el layout porque en el diseño va sobre la imagen, no en la barra de navegación
- `mediaUrl` / `mediaAlt` de `lib/media`
- `normalizePayloadData` — sin esto un `caption: null` de Payload tumba la validación

## Decisiones relevantes

- El degradado de `image` es **del color de marca, no negro**: el diseño tiñe la foto de verde en lugar de oscurecerla, y copiarlo en negro cambia el carácter de la cabecera.
- Cabecera con datos inválidos → no pinta nada y avisa en desarrollo. Una cabecera mal configurada no tumba la página.
- `eyebrow` es pieza propia y no el subtítulo reubicado: aparece en los tres heros del Figma, con logo y con texto.
