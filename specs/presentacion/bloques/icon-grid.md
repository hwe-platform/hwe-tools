 
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
| `columns` | estilo | number (1–12) | ≤3 arranca en 1 columna y llega en `md`; >3 arranca en 2, para en 3 y llega en `lg` |
| `background` | estilo | `default` \| `muted` \| `none` | Fondo de sección |
| `headingTone` | estilo | `default` \| `brand` | Color del titular |
 
## Campos del schema
 
| Campo | Tipo | Obligatorio | Default | Notas |
|-------|------|-------------|---------|-------|
| `title` | text, localized | no | — | |
| `subtitle` | text, localized | no | — | Línea corta de contexto |
| `description` | textarea, localized | no | — | Párrafo bajo el título (20px) |
| `variant` | select | no | `bare` | card \| bare |
| `columns` | number | no | 3 | Columnas en desktop |
| `background` | select | no | `default` | Fondo de sección |
| `headingTone` | select | no | `default` | Titular en color de texto, o de marca |
| `items` | array | sí | — | icon (string) + label + description |
| `ctas` | array | no | — | Botones bajo el grid |
 
## Dependencias
 
- Primitivas: Icon, Button, Link
- `iconRegistry` prop: el site pasa registro de iconos custom → busca registry → lucide → fallback
- Rampa responsive derivada del número de columnas (`esAmplio()`)
## Diferencias con el diseño de referencia

| Qué | En el export | Aquí | Por qué |
|-----|--------------|------|---------|
| Separación de las rejillas estrechas | `gap-8` con cinco columnas y `gap-6` con seis, fijos | `gap-6 md:gap-8` | La separación se deriva del mismo umbral que el marco y la escala. Reproducir los dos valores exactos pediría un segundo umbral que solo sirve para dos píxeles |

El resto coincide: «Pourquoi choisir» sale `grid-cols-1 md:grid-cols-3 gap-12
lg:gap-24` y «Activités & Services» `grid-cols-2 md:grid-cols-3
lg:grid-cols-6`, idénticas al export.

## Decisiones relevantes
 
- `columns` como número (no enum 3|4|6) — el Figma usa 3, 5 y 6
- `iconRegistry` como prop, mismo patrón que `slotRegistry` de HU-009
- Campo del item es `label` (no `title`) — decisión de no renombrar para evitar migración
- Componente `Cabecera` extraído como compartido en `blocks/seccion.tsx`
- `headingTone` es eje y no constante: el diseño pone «Pourquoi choisir» en color de marca y las otras tres secciones en color de texto
