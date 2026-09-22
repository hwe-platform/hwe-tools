# Hero
 
> Implementado en HU-009 · `@hwe-platform/core-ui/src/blocks/hero/`
 
## Variantes
 
| Variante | Tipo | Descripción |
|----------|------|-------------|
| `full` | estructural | Imagen fullscreen con overlay de texto |
| `split` | estructural | Dos columnas: texto + imagen |
 
Resueltas por mapa — componentes separados (`HeroFull`, `HeroSplit`).
 
## Ejes
 
| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `variant` | estructural | `full` \| `split` | Cambia la anatomía |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | sí | — | Título principal |
| `titleAccent` | text, localized | no | — | Segunda línea en `text-secondary` |
| `subtitle` | text, localized | no | — | Bajo el título |
| `backgroundImage` | upload → media | sí (full) | — | Imagen de fondo |
| `ctas` | array | no | — | Botones de acción |
| `variant` | select | sí | `full` | full \| split |
 
## Dependencias
 
- Primitivas: Button, Image, Link
- Patrón: slotRegistry prop para contenido custom por instancia
## Decisiones relevantes
 
- `titleAccent` como campo separado para titulares bicolor (no richText en títulos)
- Slots por instancia via `slotRegistry` prop del BlockRenderer
