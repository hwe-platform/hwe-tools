# Blog

> Implementado en HU-010 · `@hwe-platform/core-ui/src/blocks/blog/`

**El primer bloque de referencia.** No contiene su contenido: lo pide. El editor
configura la consulta —los últimos, los destacados, los de una categoría— y el
site la resuelve antes de renderizar, porque `core-ui` no habla con Payload.

El reparto es deliberado y es el patrón para los bloques de referencia que
vengan (`instagram`, reseñas, alojamientos destacados):

```
core-ui (puro, con tests)          site-demo (capa fina)
  consultaDeBlog(bloque)  ───────▶  payload.find({ collection: 'articles', ... })
  articuloATarjeta(doc)   ◀───────  docs
                                    { ...bloque, items }  ──▶  <BlogBlock data=… />
```

## Variantes

No tiene. La tarjeta es `CardStacked`, la misma de [CardGrid](card-grid.md): un
artículo resuelto no es más que una tarjeta con fecha, y mantener dos tarjetas
para lo mismo acaba en dos diseños distintos.

## Ejes

| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `source` | datos | `latest` \| `featured` \| `byCategory` | Qué se pide, no cómo se pinta |
| `limit` | datos | number (1–24) | Cuántos se piden |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |

Las columnas **no** son un eje: son 3, constante del componente. El diseño de
referencia solo usa esa forma y un eje sin segundo valor observado es una
suposición. Cuando aparezca el segundo, se abre igual que en CardGrid.

## Campos del schema

| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | |
| `description` | textarea, localized | no | — | Párrafo entre el titular y las tarjetas |
| `background` | select | no | `default` | Fondo de sección |
| `source` | select | sí | `latest` | latest \| featured \| byCategory |
| `category` | text, localized | no | — | Solo visible con `source: byCategory` |
| `limit` | number | no | 3 | 1–24 |
| `showMoreLink` | checkbox | no | `false` | Enlace al listado completo |
| `showMoreUrl` | text | no | — | Sin él no se pinta aunque el check esté |
| `showMoreLabel` | text, localized | no | — | «Voir toutes les actualités» en el diseño |
| `items` | array | no | `[]` | **No lo rellena el editor** — lo inyecta el site |

`items` existe en el schema Zod pero **no en los campos de Payload**: es la
salida de la consulta, no una entrada del editor. Por eso tiene default — un
bloque recién creado es válido y se queda vacío hasta que alguien lo resuelve.

## Consulta

`consultaDeBlog()` traduce el bloque a un `where` de Payload:

| `source` | Filtro | Orden |
|----------|--------|-------|
| `latest` | ninguno | `-publishedAt` |
| `featured` | `featured = true` | `-publishedAt` |
| `byCategory` | `category = <category>` | `-publishedAt` |

`byCategory` **sin categoría no filtra**: un bloque a medio configurar enseña
los últimos en lugar de una sección vacía, que es lo que el editor entiende
como «todavía no he elegido».

`articuloATarjeta()` mapea el artículo a `CardGridItem`: el resumen va de
subtítulo, la categoría de etiqueta, la URL se compone con `basePath` (por
defecto `/blog`) y la fecha se formatea con `Intl.DateTimeFormat` en el idioma
de la página. Fecha ilegible → la tarjeta se queda sin ella, nunca «Invalid Date».

## Comportamiento

- **Sin artículos no pinta la sección.** Un listado vacío no es una sección
  vacía: es una sección que sobra.
- **Si la consulta falla, el bloque llega con `items: []`** y desaparece. Una
  página no se cae porque un listado no responda.
- El enlace «ver más» usa la variante `link` de Button con icono `arrowRight`.

## Dependencias

- `CardStacked` de `card-grid` — acepta `date` y `readMoreLabel` opcionales precisamente para esto
- `reticulaDe()` de `icon-grid/grid.ts`
- `Cabecera`, `BlockCtas`, `fondoDe()` de `blocks/seccion.tsx`
- Variante `link` de Button
- Colección `articles` (`title`, `slug`, `excerpt`, `image`, `category`, `publishedAt`, `featured`)

## Decisiones relevantes

- La lógica que puede equivocarse —qué filtra cada fuente, cómo se mapea un
  artículo, cómo se formatea la fecha— vive en `core-ui` con tests; el site solo
  ejecuta la consulta. Mismo patrón que los hooks de HU-005.
- La fecha se formatea en `core-ui` y no en el componente: dejarlo al componente
  lo ataría a un idioma, y dejarlo al site lo sacaría de donde hay tests.
- El rótulo «Lire l'article» es interfaz, no contenido: lo pone el site
  (`blocks/resolve.ts`), no Payload.
- Blog no es CardGrid con otra fuente: tiene campos propios (`showMoreLink`,
  `source: byCategory`) y comparte la tarjeta, no el bloque.
