# Mastercamping

Motor de reservas para campings. Integración via script injection con
constructor JavaScript clásico.

## Tipo de integración

**Script injection.** A diferencia de THR (Web Components), Mastercamping
usa un constructor JS clásico (`new MasterWidget(config)`). Se carga un
JS y un CSS desde CDN estático, se instancia el constructor con la config
del cliente, y el widget se monta en el contenedor indicado.

## Assets

URLs estáticas — no dependen de credenciales del cliente:

```
JS:  https://rsv4.mastercamping.com/cdn/master_booking_plugin.min.js
CSS: https://rsv4.mastercamping.com/cdn/master_booking_plugin.min.css
```

Ambos se cargan una sola vez via `script-loader.ts` (`loadScript` +
`loadStylesheet`). El CSS es requerido — sin él el widget no se renderiza
correctamente. Esta es la diferencia principal con THR, que no necesita
CSS externo explícito.

## Constructor

```javascript
new MasterWidget({
  container: '#booking-search',  // selector del contenedor
  idProperty: 3,                  // ID numérico de la propiedad
  bookingUrl: 'https://booking.familycampings.com',
  layout: 'horizontal',           // o 'vertical'
});
```

El adapter traduce la config de Payload a estos parámetros y llama al
constructor.

## Credenciales (campos en Payload)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `idProperty` | number | sí | ID numérico de la propiedad. Ej: `3` |
| `bookingUrl` | text (URL) | sí | URL del sistema de reservas del cliente |
| `layout` | select | no | `horizontal` (default) o `vertical` |

## Widgets disponibles

| Widget | Disponible | Adapter |
|--------|------------|---------|
| Buscador de disponibilidad | ✅ | MastercampingSearchAdapter |
| Favoritos | ❌ no existe | placeholder — DevWarning en dev |
| Disponibilidad rápida | ❌ no existe | placeholder — DevWarning en dev |

Mastercamping solo ofrece el widget de búsqueda. Los bloques de favoritos
y simpleblock degradan gracefully cuando el motor es Mastercamping.

## CSS overrides

```css
/* mastercamping-overrides.css */
[data-engine="mastercamping"] .mc-search-btn {
  background-color: var(--color-primary) !important;
  font-family: var(--font-body) !important;
}
```

Los estilos base vienen en `master_booking_plugin.min.css` (cargado por
el adapter). Los overrides solo cubren la personalización de marca.

## Dominios CSP

```
script-src: rsv4.mastercamping.com
style-src: rsv4.mastercamping.com
img-src: rsv4.mastercamping.com
connect-src: rsv4.mastercamping.com
```

**Pendiente de implementar** — ver backlog post-Hito 1.

## Cliente demo

**familycampings** — `idProperty: 3`, `bookingUrl: https://booking.familycampings.com`,
`layout: horizontal`. Smoke test realizado con datos reales (CDN OK, widget
monta correctamente).

## Pendientes

- CSP headers en `next.config.mjs`
- Adapters de favorites y simpleblock si Mastercamping los ofrece en el futuro
