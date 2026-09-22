# Dominio: Reservas

Especificaciones del sistema de reservas: arquitectura, bloques, motores
e integraciones.

## Visión general

El sistema de reservas conecta los bloques del constructor de páginas con
motores externos de reservas (THR, Mastercamping, Witbooking, Resalys).
Cada motor tiene su propia forma de integrarse — scripts, widgets,
iframes — pero los bloques son idénticos independientemente del motor.

## Arquitectura: adapter pattern (DEC-025)

Cada tipo de widget de reservas tiene su propia familia de adapters:

```
BookingSearchBlock ──→ resolveSearchAdapter(engine) ──→ ThrSearchAdapter
                                                       MastercampingSearchAdapter
                                                       (placeholders: witbooking, resalys)

BookingFavoritesBlock → resolveFavoritesAdapter(engine) → ThrFavoritesAdapter
                                                          (placeholders: rest)

BookingSimpleBlock ──→ resolveSimpleBlockAdapter(engine) → ThrSimpleBlockAdapter
                                                           (placeholders: rest)
```

### Principios inamovibles

- **Sin `if (engine === 'xxx')` en ningún bloque.** El bloque delega al
  adapter resuelto por mapa. Añadir un motor nuevo nunca toca un bloque.
- **Engine autoritativo en el tenant.** La config de booking vive en el
  global `site-config` de Payload, campo `booking`. El bloque solo lleva
  campos de presentación (título, tipo de alojamiento, debug).
- **Un adapter por widget, no un mega-adapter.** Cada widget (search,
  favorites, simpleblock) tiene su registry y su interfaz. Un motor puede
  implementar solo search sin tocar los demás.
- **Graceful degradation.** Si el motor no tiene adapter para un widget,
  el bloque no renderiza nada en producción y muestra un `DevWarning` en
  desarrollo. Usa `isAdapterAvailable(engine)` — nunca captura excepciones
  del resolve.

### Interfaz de adapter

Todos los adapters de booking siguen este contrato:

```typescript
interface BookingAdapter {
  /** Monta el widget en el contenedor. Devuelve handle de limpieza. */
  mount(container: HTMLElement, config: TenantBookingConfig): Promise<{
    destroy: () => void;
    mounted: boolean;
  }>;

  /** Valida que la config del tenant tiene los campos necesarios. */
  validateConfig(config: TenantBookingConfig): boolean;
}
```

El lifecycle es: mount → (usuario interactúa) → destroy (en unmount de
React). El adapter es responsable de cargar scripts externos, crear
elementos DOM, y limpiar todo en destroy.

### Registry por mapa

Cada familia de widgets tiene un registry:

```typescript
// Pseudocódigo — el registry real usa factories
const searchAdapterMap = new Map<string, () => BookingAdapter>([
  ['thr', () => new ThrSearchAdapter()],
  ['mastercamping', () => new MastercampingSearchAdapter()],
]);

function resolveSearchAdapter(engine: string): BookingAdapter { ... }
function isSearchAdapterAvailable(engine: string): boolean { ... }
```

### Script loader

`script-loader.ts` es un utilitario compartido que:

- Carga scripts externos una sola vez (deduplicación por URL)
- Carga CSS cuando el motor lo requiere (`loadStylesheet`)
- No desinstala assets al destruir el widget — los scripts de vendor
  modifican el global y no se pueden descargar limpiamente

### CSS overrides

Los estilos de los widgets de vendor se personalizan con overrides CSS
en el repo del cliente. Patrón:

```
site-{slug}/src/styles/
├── globals.css                        ← sin CSS de motor
└── booking/
    ├── thr-overrides.css              ← [data-engine="thr"] overrides
    └── mastercamping-overrides.css    ← [data-engine="mastercamping"]
```

El layout importa solo el fichero del motor activo. Los overrides cubren
colores de marca, tipografía y chrome visual — los estilos base los trae
el CSS del vendor. Se usa `!important` para ganar especificidad al CSS
inyectado por el motor.

## Flujo de datos

```
Payload admin (site-config → booking)
         ↓
loadGlobals() — Local API en server component
         ↓
siteConfig.booking (validado con bookingConfigSchema)
         ↓
SiteLayout → contexto disponible para bloques
         ↓
BookingSearchBlock lee siteConfig.booking
         ↓
resolveSearchAdapter(booking.engine)
         ↓
adapter.mount(container, booking)
         ↓
Widget renderizado con scripts del vendor
```

## Config de booking en Payload

El grupo `booking` del global `site-config` usa campos condicionales:
al seleccionar un motor, solo aparecen sus campos. Ver
`specs/payload/modelo-datos.md` para el detalle de campos por motor.

## Estructura de ficheros en core-ui

```
@hwe-platform/core-ui/src/
├── adapters/booking/
│   ├── types.ts                 ← BookingAdapter interface
│   ├── script-loader.ts         ← carga de scripts/CSS de vendor
│   ├── search/
│   │   ├── registry.ts          ← resolveSearchAdapter + isAvailable
│   │   ├── thr.ts               ← ThrSearchAdapter
│   │   └── mastercamping.ts     ← MastercampingSearchAdapter
│   ├── favorites/
│   │   ├── registry.ts
│   │   └── thr.ts
│   └── simpleblock/
│       ├── registry.ts
│       └── thr.ts
│
├── blocks/
│   ├── booking-search/          ← BookingSearchBlock
│   ├── booking-favorites/       ← BookingFavoritesBlock
│   └── booking-simple/          ← BookingSimpleBlock
│
└── schemas/globals/
    └── site-config.schema.ts    ← bookingConfigSchema (discriminated union)
```

## Specs relacionadas

- [Motores de reservas](motores/index.md) — spec por motor
- [Bloques de reservas](bloques/index.md) — spec por bloque
- [Modelo de datos Payload](../payload/modelo-datos.md) — campos en site-config
