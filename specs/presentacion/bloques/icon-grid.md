 
# IconGrid
 
> Implementado en HU-010 · `@hwe-platform/core-ui/src/blocks/icon-grid/`
 
## Variantes
 
| Variante | Tipo | Descripción |
|----------|------|-------------|
| `bare` | estructural | Icono circular + texto, sin tarjeta |
| `card` | estructural | Icono + texto dentro de tarjeta con fondo |
 
Resueltas por mapa (`IconGridBare`, `IconGridCard`).
 
## Ejes
 
| Eje | Tipo | Dominio | Notas |
|-----|------|---------|-------|
| `variant` | estructural | `card` \| `bare` | Cambia anatomía del item |
| `columns` | estilo | number | Columnas ≤3 arrancan en 1 col responsive, >3 en 2 col |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | Línea corta de contexto |
| `description` | text, localized | no | — | Párrafo bajo el título (20px) |
| `variant` | select | sí | `bare` | card \| bare |
| `columns` | number | no | 3 | Columnas en desktop |
| `background` | select | no | `default` | Fondo de sección |
| `items` | array | sí | — | icon (string) + label + description |
| `ctas` | array | no | — | Botones bajo el grid |
 
## Dependencias
 
- Primitivas: Icon, Button, Link
- `iconRegistry` prop: el site pasa registro de iconos custom → busca registry → lucide → fallback
- Rampa responsive derivada del número de columnas (`esAmplio()`)
## Decisiones relevantes
 
- `columns` como número (no enum 3|4|6) — el Figma usa 3, 5 y 6
- `iconRegistry` como prop, mismo patrón que `slotRegistry` de HU-009
- Campo del item es `label` (no `title`) — decisión de no renombrar para evitar migración
- Componente `Cabecera` extraído como compartido en `blocks/seccion.tsx`
