# THR (eSeasonResa)

Motor de reservas de Sequoiasoft para campings y hoteles. Integración via
ILib v4 (Web Components).

## Tipo de integración

**Script injection.** THR inyecta un script que registra custom elements
en el DOM. Nosotros controlamos el contenedor; ellos controlan el interior
del widget. Estilo vía CSS overrides con `!important`.

## Script

Un solo script para todos los widgets. La URL se compone como pure function
desde la config del tenant (`buildThrScriptUrl`):

```
https://thelisresa.webcamp.fr/eresa4/{codeCamping}/jslib/ilib.js
                                      ^^^^^^^^^^^
                                      desde booking.codeCamping
```

Con parámetros opcionales según features activadas:

- `?favorites=1` si `features.favorites === true`
- `?simpleblock=1` si `features.simpleblock === true`

La URL se calcula **una sola vez** al primer mount y se reutiliza en todos
los widgets de la página. Esto evita race conditions cuando varios bloques
se montan en momentos distintos (DEC-027).

## Web Components (ILib v4)

### `<thr-search-engine>` — Buscador de disponibilidad

```html
<thr-search-engine title="Réservez votre séjour" type="2"></thr-search-engine>
```

| Atributo | Tipo | Obligatorio | Default | Descripción |
|----------|------|-------------|---------|-------------|
| `title` | string | no | — | Título sobre el formulario de búsqueda |
| `type` | `1` / `2` | no | ambos | 1=emplacement (parcela), 2=locatif (alquiler). Sin filtro si se omite |
| `site` | string | solo multi-site | — | ID del site para cuentas con varios campings |
| `on-load` | string | no | — | Nombre de función global al cargar |

**Desde el bloque:** `widgetTitle` → `title`, `accommodationType` → `type`.
Si `source === 'fromAccommodation'`, el adapter traduce el
`accommodation.type` (emplacement→1, mobilhome/cottage/chalet/tente→2).

### `<thr-favorites>` — Categorías favoritas

```html
<thr-favorites quantity="6" quantity-to-show="3"></thr-favorites>
```

| Atributo | Tipo | Obligatorio | Default | Descripción |
|----------|------|-------------|---------|-------------|
| `sites` | string (JSON array) | solo multi-site | todos | Sites a incluir |
| `quantity` | string (entero) | no | `"6"` | Total de items a cargar |
| `quantity-to-show` | string (entero) | no | `"3"` | Items visibles a la vez |
| `on-load` | string | no | — | Nombre de función global al cargar |
| `on-book` | string | no | — | Nombre de función global al reservar |

**Desde el bloque:** `quantity` → `quantity`, `quantityToShow` → `quantity-to-show`.
Las categorías visibles se controlan desde el panel de THR.

### `<thr-simpleblock>` — Disponibilidad rápida

```html
<thr-simpleblock categories="['12','15']" show-picture="true"></thr-simpleblock>
```

| Atributo | Tipo | Obligatorio | Default | Descripción |
|----------|------|-------------|---------|-------------|
| `categories` | string (JSON array) | sí | — | IDs de categorías: `"['12']"` o `"['12','15']"` |
| `show-picture` | `"true"` / `"false"` | no | `"false"` | Mostrar foto del alojamiento |
| `search-type` | string | no | — | Tipo de búsqueda |
| `day` | string | no | — | Día por defecto |
| `category-type` | string | no | — | Passthrough al motor |
| `on-load` | string | no | — | Nombre de función global al cargar |
| `on-book` | string | no | — | Nombre de función global al reservar |
| `on-search` | string | no | — | Nombre de función global al buscar |

**Desde el bloque:** si `source === 'manual'`, el adapter pasa `categories`
directamente. Si `source === 'fromAccommodation'`, el adapter lee
`accommodation.booking.externalId` del AccommodationContext y lo pasa
como categoría única. `showPicture` → `show-picture`.

**Nota v3→v4:** en ILib v3 este widget se llamaba `<thr-onenight>` con
atributo `category` (singular, string). En v4 es `<thr-simpleblock>` con
`categories` (plural, JSON array). El schema Zod refleja el contrato v4.

### `<thr-tarifs>` — Tarifas

Documentación pendiente. Widget existe en ILib v4. No implementado.

### `<thr-categories>` — Listado de categorías

Documentación pendiente. Widget existe en ILib v4. No implementado.

## Credenciales (campos en Payload)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `codeCamping` | text | sí | Código del camping en THR. Ej: `LACIVELLE` |
| `siteId` | text | no | Solo si el camping tiene varios sites |
| `features.favorites` | boolean | no | Activar bloque de favoritos |
| `features.simpleblock` | boolean | no | Activar bloque de dispo rápida |

## Runtime compartido

`thr-runtime.ts` centraliza:

- **Bootstrap:** carga el script una sola vez, espera a que los custom
  elements se registren en el browser
- **Callbacks:** THR emite eventos cuando el usuario interactúa (selección
  de fechas, búsqueda). El runtime los captura para analytics
- **buildThrScriptUrl:** pure function que compone la URL desde la config

## Consent

THR soporta `thelisresa.setConsentMode()` para gestión de consentimiento.
Se llama después de que el script de ILib carga. Pendiente de conectar
con Cookiebot (backlog post-Hito 1).

## CSS overrides

THR inyecta su propio CSS (AngularJS legacy, Font Awesome, Google Fonts,
Slick Slider daterangepicker). Para mantener la marca del cliente:

```css
/* thr-overrides.css */
[data-engine="thr"] .thr-search-engine__btn {
  background-color: var(--color-primary) !important;
  border-radius: var(--radius-md) !important;
}
```

Selector mínimo: `[data-engine="thr"]`. Para ganar a estilos muy
específicos de THR: `html.thr [data-engine="thr"]`.

### Decisiones de diseño visual

- **Tipografía widget titles:** Montserrat (no Playfair/Bitter). THR
  controla la longitud del contenido y los nombres largos de categoría
  renderizan mal en serif.
- **Flechas del carrusel:** círculos — excepción deliberada al estilo
  general del site.

## Dominios CSP

Para Content Security Policy, THR necesita:

```
script-src: thelisresa.webcamp.fr
style-src: thelisresa.webcamp.fr fonts.googleapis.com
font-src: fonts.gstatic.com
img-src: thelisresa.webcamp.fr
connect-src: thelisresa.webcamp.fr
```

**Pendiente de implementar** — ver backlog post-Hito 1.

## Pendientes

- Smoke test con `codeCamping` real
- CSP headers en `next.config.mjs`
- Cookiebot → consent bridge (los scripts de THR cargan sin consent)
- Verificación SPA navegación (mount/destroy en client-side nav)
