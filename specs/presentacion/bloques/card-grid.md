 
# CardGrid
 
> Implementado en HU-010 · `@hwe-platform/core-ui/src/blocks/card-grid/`
 
## Variantes
 
| Variante | Tipo | Descripción |
|----------|------|-------------|
| `overlay` | estructural | Texto sobre imagen con gradient |
| `stacked` | estructural | Imagen arriba, texto debajo |
 
Resueltas por mapa (`CardOverlay`, `CardStacked`).
 
## Ejes
 
| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `card` | estructural | `overlay` \| `stacked` | Cambia anatomía de la tarjeta |
| `cardSize` | estilo | `default` \| `compact` | Escala de la tarjeta overlay. Las dos del diseño |
| `columns` | estilo | number o `spans` asimétrico | `spans: [5,7]` para reparto asimétrico |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |
| `headingTone` | estilo | `default` \| `brand` | Color del titular |
| `variant` (del item) | estilo | 6 formas de botón | Botón relleno o enlace suelto, por tarjeta |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | |
| `description` | textarea, localized | no | — | Párrafo bajo el título |
| `card` | select | sí | `stacked` | overlay \| stacked |
| `cardSize` | select | no | `default` | Solo visible con `card: overlay` |
| `columns` | number | no | 3 | Columnas en desktop |
| `spans` | array of numbers | no | — | Reparto asimétrico (ej: [5,7]), se recicla en ciclo |
| `background` | select | no | `default` | Fondo de sección |
| `headingTone` | select | no | `default` | Titular en color de texto, o de marca |
| `items` | array | **no** | `[]` | Solo visible con `source: manual`. Detalle abajo |
| `source` | select | no | `manual` | manual \| accommodations \| entities \| articles |
| `sourceConfig` | group | no | — | category, limit, featured — para resolución futura |
| `ctas` | array | no | — | Botones bajo el grid |
 
### Campos de cada tarjeta

| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `image` | upload → media | sí | — | |
| `title` | text, localized | sí | — | |
| `subtitle` | text, localized | no | — | |
| `tag` | text, localized | no | — | Etiqueta corta: categoría, zona, tipo |
| `url` | text | no | — | |
| `date` | text | no | — | Ya formateada por quien resuelve, no por la tarjeta |
| `readMoreLabel` | text, localized | no | — | Sin él la tarjeta no pinta llamada a la acción |
| `variant` | select | no | `link` | Forma del CTA de esa tarjeta |

**`variant` es un eje, no un valor fijo.** El diseño de referencia usa las dos
formas en secciones contiguas —botón relleno en «Nos Hébergements», enlace
suelto en «Les Alentours»—, así que elegir una sería elegir por el cliente
siguiente.

## Dependencias
 
- Primitivas: Image, Button, Link
- `columnasDe` de `ratio.ts` (reutilizado de HU-009)
- `Cabecera` de `blocks/seccion.tsx` (compartido con IconGrid)
- Variante `link` de Button (añadida en esta HU para CTAs sin fondo)
## Diferencias con el diseño de referencia

| Qué | En el export | Aquí | Por qué |
|-----|--------------|------|---------|
| Cuándo llega el reparto asimétrico | La rejilla pasa a doce columnas en `md`, pero los repartos por tarjeta solo existen en `lg` | Las doce columnas y los repartos llegan juntos, en `lg` | **Corrección deliberada.** En el export, entre `md` y `lg` cada tarjeta ocupa una de doce columnas y queda en una astilla. Es un defecto del diseño exportado (DEC-002) |
| Separación | `gap-10` fijo | `gap-8 md:gap-10` | Coincide a partir de `md`; por debajo respira algo menos |

`CardOverlay` reproduce las dos escalas del export a través del eje
`cardSize`: `default` es «Nos Hébergements» y `compact` es «Les Alentours»,
que va más baja, con menos relleno, el titular un escalón por debajo, el velo
más suave y el enlace pequeño.

## Decisiones relevantes
 
- `cardSize` es eje y no derivación: el diseño usa la escala grande donde hay dos tarjetas y la pequeña donde hay cuatro, pero atarla al número de columnas volvería ley del sistema una correlación de un cliente — el mismo motivo por el que en el hero `align` y `titleMode` van sueltos de `variant`
- `card` es estructural (overlay vs stacked cambia anatomía) → componentes por mapa
- `items` (no `cards`) como nombre del array — consistencia con Blog que comparte tarjeta
- `source` y `sourceConfig` en schema pero sin consumir — resolución futura en site-demo
- `spans` con reciclo en ciclo: `[5,7]` con 4 items → 5,7,5,7
- `CardStacked` acepta campos opcionales (date, readMoreLabel) para que Blog los reutilice
- Blog no es CardGrid — es bloque propio con campos específicos (showMoreLink, source: byCategory)
 