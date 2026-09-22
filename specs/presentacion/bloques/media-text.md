# MediaText
 
> Implementado en HU-009 · `@hwe-platform/core-ui/src/blocks/media-text/`
 
## Variantes
 
| Variante | Tipo | Descripción |
|----------|------|-------------|
| `image-left` | estructural | Imagen a la izquierda, texto a la derecha |
| `image-right` | estructural | Imagen a la derecha, texto a la izquierda |
 
Resueltas por mapa.
 
## Ejes
 
| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `variant` | estructural | `image-left` \| `image-right` | Cambia la posición de la imagen |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de la sección |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | sí | — | |
| `titleAccent` | text, localized | no | — | Segunda línea en color secundario |
| `subtitle` | text, localized | no | — | |
| `content` | richText, localized | no | — | Cuerpo de texto (Lexical) |
| `image` | upload → media | sí | — | |
| `variant` | select | sí | `image-left` | Posición de la imagen |
| `background` | select | no | `default` | Fondo de sección |
| `ctas` | array | no | — | Botones de acción |
 
## Dependencias
 
- Primitivas: Button, Image, Link
- Patrón: slotRegistry para contenido custom (ej: horarios, medallón)
- `columnasDe` de `ratio.ts` para el reparto de columnas
## Decisiones relevantes
 
- `background` con 3 opciones — patrón transversal reutilizado en IconGrid, CardGrid
- Párrafo destacado diferido (Lexical no tiene formato nativo para ello)
- Botón con tokens CSS del cliente + campo `icon` opcional
