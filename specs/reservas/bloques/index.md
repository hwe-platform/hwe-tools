# Bloques de reservas

Bloques del constructor de páginas que conectan con motores de reservas
externos. Todos son **engine-agnostic**: delegan al adapter resuelto por
el registry.

## Catálogo

| Bloque | Qué hace | Motores con adapter |
|--------|----------|---------------------|
| BookingSearchBlock | Buscador de disponibilidad (fechas, ocupación, tipo) | THR, Mastercamping |
| BookingFavoritesBlock | Carrusel de categorías favoritas | THR |
| BookingSimpleBlock | Widget de disponibilidad rápida por categoría | THR |

## Principios comunes

### Engine-agnostic

Cada bloque lee `siteConfig.booking.engine` via `useBookingConfig()`
(BookingProvider) y resuelve el adapter via registry. El bloque no sabe
qué motor hay detrás — solo conoce la interfaz `BookingAdapter`.

### Dos fuentes de config, dos caminos

**Config del motor** (credenciales, features): viene del global
`site-config.booking` via BookingProvider. Se configura una vez en el
admin, no se toca al colocar bloques.

**Config de presentación** (título, categorías, tipo): viene de los
campos del bloque en el page builder. El editor la controla por instancia.

El adapter recibe ambas: `mount(container, motorConfig, blockProps)`.

### Campo `source` — manual o desde el alojamiento

BookingSearchBlock y BookingSimpleBlock tienen un campo `source`:

- `manual` — el editor introduce los parámetros a mano (IDs de
  categoría, tipo de alojamiento). Para uso en la home o páginas
  genéricas.
- `fromAccommodation` — el bloque lee automáticamente los datos del
  alojamiento actual (su `booking.externalId`, su `type`). Para uso
  en fichas de alojamiento.

Si `source === 'fromAccommodation'` pero el bloque no está dentro de
una ficha de alojamiento (no hay AccommodationContext), degrada:
DevWarning en dev, no renderiza en prod.

### Graceful degradation

Antes de resolver el adapter, el bloque comprueba:

```typescript
if (!isSearchAdapterAvailable(booking.engine)) {
  // Dev: DevWarning visual
  // Prod: return null (no renderiza nada)
}
```

Esto permite que una composición de página incluya bloques de booking
que no aplican al motor actual sin romper la página. Si mañana el
motor añade soporte para ese widget, el bloque empieza a funcionar
sin tocar la página.

### Lifecycle

```
1. Bloque monta (React useEffect)
2. Lee useBookingConfig() — config del motor
3. Lee useAccommodation() — contexto del alojamiento (si source === 'fromAccommodation')
4. Comprueba isAdapterAvailable(engine)
5. Si disponible → resolveAdapter(engine)
6. adapter.validateConfig(motorConfig)
7. adapter.mount(containerRef, motorConfig, blockProps)
8. Usuario interactúa con widget del vendor
9. React desmonta → adapter.destroy()
```

## BookingSearchBlock

**Función:** buscador de disponibilidad. Es el bloque principal de
reservas — presente en la mayoría de páginas de camping/hotel.

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `widgetTitle` | text, opcional, localized | — | Título sobre el buscador |
| `source` | enum | `manual` | `manual`: editor elige tipo. `fromAccommodation`: deriva del alojamiento |
| `accommodationType` | enum | `all` | `all`, `emplacement`, `locatif`. Solo visible si source=manual |
| `debug` | boolean | false | Modo debug (solo dev) |

**Mapping a widgets por motor:**

| Campo del bloque | THR (`<thr-search-engine>`) | Mastercamping (`MasterWidget`) |
|------------------|---------------------------|-------------------------------|
| `widgetTitle` | atributo `title` | no aplicable |
| `accommodationType` | atributo `type` (1=emplacement, 2=locatif) | no aplicable |
| source=fromAccommodation | `type` derivado del `accommodation.type` | no aplicable |

## BookingFavoritesBlock

**Función:** carrusel de categorías de alojamiento marcadas como
favoritas en el motor de reservas. Solo disponible para motores que
exponen este concepto (THR).

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `widgetTitle` | text, opcional, localized | — | Título de la sección |
| `quantity` | number | 6 | Total de items a cargar del motor |
| `quantityToShow` | number | 3 | Items visibles a la vez en el carrusel |

**Mapping a widgets por motor:**

| Campo del bloque | THR (`<thr-favorites>`) |
|------------------|----------------------|
| `quantity` | atributo `quantity` |
| `quantityToShow` | atributo `quantity-to-show` |

**Motores implementados:** THR. Mastercamping no ofrece este widget —
el bloque degrada silenciosamente.

## BookingSimpleBlock

**Función:** widget compacto de disponibilidad rápida para una o varias
categorías específicas. Permite al visitante ver disponibilidad sin pasar
por el buscador completo.

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `widgetTitle` | text, opcional, localized | — | Título de la sección |
| `source` | enum | `manual` | `manual`: editor pone IDs. `fromAccommodation`: lee del alojamiento |
| `categories` | string[] | — | IDs de categorías del motor. Solo visible si source=manual |
| `showPicture` | boolean | false | Mostrar foto del alojamiento en el widget |

**Resolución de categories:**

- `source: 'manual'` → usa `categories` del bloque tal cual
- `source: 'fromAccommodation'` → lee `accommodation.booking.externalId`
  del AccommodationContext y lo usa como categoría única:
  `categories="['{externalId}']"`

**Mapping a widgets por motor:**

| Campo del bloque | THR (`<thr-simpleblock>`) |
|------------------|-------------------------|
| `categories` | atributo `categories` (JSON array: `"['12','15']"`) |
| `showPicture` | atributo `show-picture` |

**Motores implementados:** THR. Mastercamping no ofrece este widget —
el bloque degrada silenciosamente.

**Nota sobre IDs de categoría:** los IDs son específicos del motor —
en THR son IDs numéricos como `'12'`. El editor los obtiene del panel
de administración de THR. En el futuro se puede añadir un select
dinámico que consulte al motor.

## Notas de implementación

### BookingProvider

Context React que distribuye `siteConfig.booking` a todos los bloques
de booking. Se coloca una vez en el layout de frontend. Los bloques
hacen `useBookingConfig()`.

### AccommodationContext

Context que el template `AccommodationDetail` provee con el alojamiento
actual. Los bloques de booking con `source: 'fromAccommodation'` leen
`accommodation.booking.externalId` de aquí. Sin este context, esos
bloques degradan.

### DevWarning

Componente compartido reutilizable:

- Solo renderiza en `process.env.NODE_ENV === 'development'`
- Estilos inline (no Tailwind) para funcionar sin config de CSS
- `role="status"` para accesibilidad
- Reutilizable fuera de booking (cualquier adapter/feature no disponible)

### Container con data-engine

Cada adapter envuelve el widget en un contenedor con
`data-engine="{engine}"`. Esto permite que los CSS overrides del cliente
se apliquen al motor correcto sin afectar al resto de la página.

```html
<div data-engine="thr">
  <thr-search-engine title="Réservez" type="2"></thr-search-engine>
</div>
```
