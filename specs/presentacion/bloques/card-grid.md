 
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
| `columns` | estilo | number o `spans` asimétrico | `spans: [5,7]` para reparto asimétrico |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | |
| `description` | text, localized | no | — | Párrafo bajo el título |
| `card` | select | sí | `overlay` | overlay \| stacked |
| `columns` | number | no | 3 | Columnas en desktop |
| `spans` | array of numbers | no | — | Reparto asimétrico (ej: [5,7]), se recicla en ciclo |
| `background` | select | no | `default` | Fondo de sección |
| `items` | array | sí | — | image, title, subtitle, tag, url, date?, readMoreLabel? |
| `source` | select | no | `manual` | manual \| accommodations \| entities \| articles |
| `sourceConfig` | group | no | — | category, limit, featured — para resolución futura |
| `ctas` | array | no | — | Botones bajo el grid |
 
## Dependencias
 
- Primitivas: Image, Button, Link
- `columnasDe` de `ratio.ts` (reutilizado de HU-009)
- `Cabecera` de `blocks/seccion.tsx` (compartido con IconGrid)
- Variante `link` de Button (añadida en esta HU para CTAs sin fondo)
## Decisiones relevantes
 
- `card` es estructural (overlay vs stacked cambia anatomía) → componentes por mapa
- `items` (no `cards`) como nombre del array — consistencia con Blog que comparte tarjeta
- `source` y `sourceConfig` en schema pero sin consumir — resolución futura en site-demo
- `spans` con reciclo en ciclo: `[5,7]` con 4 items → 5,7,5,7
- `CardStacked` acepta campos opcionales (date, readMoreLabel) para que Blog los reutilice
- Blog no es CardGrid — es bloque propio con campos específicos (showMoreLink, source: byCategory)
 