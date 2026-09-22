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

| Widget | Elemento | Adapter |
|--------|----------|---------|
| Buscador de disponibilidad | `<thr-search-engine>` | ThrSearchAdapter |
| Favoritos / categorías | `<thr-favorites>` | ThrFavoritesAdapter |
| Disponibilidad rápida | `<thr-simpleblock>` | ThrSimpleBlockAdapter |
| Tarifas | `<thr-tarifs>` | 🔴 futuro |
| Categorías | `<thr-categories>` | 🔴 futuro |

### Atributos de `<thr-search-engine>`

Solo necesita existir en el DOM. El script de ILib lo detecta y lo hidrata.
No recibe atributos de config — la config va en la URL del script.

### Atributos de `<thr-favorites>`

Similar: el script lo detecta. Las categorías visibles se controlan desde
el panel de THR, no desde nuestro lado.

### Atributos de `<thr-simpleblock>`

```html
<thr-simpleblock categories="['12']"></thr-simpleblock>
```

- `categories`: array de IDs de categoría como string JSON. Requerido,
  mínimo 1 elemento. Los IDs se obtienen del panel de THR del cliente.

**Importante:** en ILib v3 este widget se llamaba `<thr-onenight>`. En v4
es `<thr-simpleblock>` con contrato distinto (array de categorías en vez
de categoría única).

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
