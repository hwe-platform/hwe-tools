---
id: HU-020
titulo: Bloques de booking y adapters — THR + Mastercamping
estado: spec-lista
prioridad: 2
hito: 1
agente: code-builder
rama: feat/HU-020-booking-blocks
dependencias: [HU-019, HU-008]
---

## Contexto

HU-019 puso los campos de booking config en Payload (engine + campos
condicionales por motor). Esta historia reimplementa los bloques de
booking del page builder y los adapters que conectan con los motores
reales (THR y Mastercamping). Los bloques son engine-agnostic: delegan
al adapter resuelto por registry sin saber qué motor hay detrás.

Cada bloque tiene campos de presentación que el editor controla por
instancia. Las credenciales y config del motor vienen del global
site-config via BookingProvider — nunca del bloque.

Las specs completas están en `docs/specs/reservas/`.

## Qué hacer

### Tramo 1 — Infraestructura: BookingProvider + script-loader + types

**BookingProvider** (`packages/core-ui/src/providers/BookingProvider.tsx`):

- Server component wrapper que lee `siteConfig.booking` del layout
- Crea context React con la booking config validada
- Hook `useBookingConfig()` para que los bloques client lean la config
- Si `engine === 'none'` o booking no existe, el context devuelve null

**AccommodationContext** (opcional, para bloques en fichas):

- Cuando un bloque de booking se renderiza dentro de una ficha de
  alojamiento, necesita saber el `booking.externalId` del alojamiento
  actual. El template `AccommodationDetail` provee un context con
  el accommodation actual. Los bloques de booking con
  `source: 'fromAccommodation'` leen de ahí.
- Si el bloque no está dentro de un AccommodationDetail (ej: en la
  home), el context devuelve null y `source: 'fromAccommodation'`
  degrada a DevWarning en dev / null en prod.

**script-loader** (`packages/core-ui/src/adapters/booking/script-loader.ts`):

- `loadScript(url)` — carga un script externo una sola vez (dedup por URL)
- `loadStylesheet(url)` — carga un CSS externo una sola vez
- Framework-agnostic, sin dependencias de React

**Types** (`packages/core-ui/src/adapters/booking/types.ts`):

```typescript
interface BookingAdapter {
  mount(container: HTMLElement, config: BookingConfig, blockProps: Record<string, unknown>): Promise<{
    destroy: () => void;
    mounted: boolean;
  }>;
  validateConfig(config: BookingConfig): boolean;
}
```

Nota: `blockProps` permite que el adapter reciba los campos de
presentación del bloque (categories, type, quantity, etc.) sin que
la interfaz sepa qué motor hay detrás. Cada adapter extrae lo que
necesita.

**DevWarning** (`packages/core-ui/src/primitives/dev-warning/DevWarning.tsx`):

- Solo renderiza en `process.env.NODE_ENV === 'development'`
- Estilos inline (no Tailwind) para funcionar sin config de CSS
- `role="status"` para accesibilidad
- Reutilizable fuera de booking

### Tramo 2 — Adapters THR

**thr-runtime.ts** (`adapters/booking/thr/thr-runtime.ts`):

- `buildThrScriptUrl(config)` — pure function, compone la URL del script
  desde `codeCamping` + features (favorites, simpleblock)
- `bootstrapThr(config)` — carga el script una sola vez via script-loader
- Los callbacks de THR (eventos de búsqueda) se capturan aquí

**Search adapter** (`adapters/booking/search/thr.ts`):

- `mount()` → bootstrap THR + insertar `<thr-search-engine>` en container
- Pasa atributos del bloque al elemento:
  - `title` → atributo `title`
  - `accommodationType` → atributo `type` (1=emplacement, 2=locatif)
  - Si `source === 'fromAccommodation'` → atributo `type` derivado
    del `accommodation.type` (emplacement→1, mobilhome/cottage/etc→2)
- `destroy()` → remover el custom element del DOM
- `validateConfig()` → comprueba que `codeCamping` existe

**Favorites adapter** (`adapters/booking/favorites/thr.ts`):

- `mount()` → bootstrap THR + insertar `<thr-favorites>` en container
- Solo disponible si `features.favorites === true`
- Pasa atributos del bloque:
  - `quantity` → número total a cargar (default 6)
  - `quantityToShow` → visibles a la vez (default 3)

**SimpleBlock adapter** (`adapters/booking/simpleblock/thr.ts`):

- `mount()` → bootstrap THR + insertar `<thr-simpleblock>` con atributos
- Solo disponible si `features.simpleblock === true`
- Resolución de categories según `source`:
  - `source: 'manual'` → usa `categories` del bloque directamente
  - `source: 'fromAccommodation'` → lee `accommodation.booking.externalId`
    del AccommodationContext y lo usa como categoría: `categories="['{externalId}']"`
- Pasa atributos del bloque:
  - `categories` → atributo `categories` (JSON array string)
  - `showPicture` → atributo `show-picture`

### Tramo 3 — Adapter Mastercamping

**Search adapter** (`adapters/booking/search/mastercamping.ts`):

- `mount()` → cargar JS + CSS de CDN + `new MasterWidget(config)`
- URLs estáticas:
  - JS: `https://rsv4.mastercamping.com/cdn/master_booking_plugin.min.js`
  - CSS: `https://rsv4.mastercamping.com/cdn/master_booking_plugin.min.css`
- `validateConfig()` → comprueba `idProperty` (number) + `bookingUrl` (URL)

**Favorites y SimpleBlock** → registrar como no disponibles. `isAdapterAvailable()`
devuelve false. DevWarning en dev, null en prod.

### Tramo 4 — Registries

Un registry por tipo de widget. Mapa, no if/else:

```typescript
// adapters/booking/search/registry.ts
const searchAdapterMap = new Map<string, () => BookingAdapter>([
  ['thr', () => new ThrSearchAdapter()],
  ['mastercamping', () => new MastercampingSearchAdapter()],
]);

export function resolveSearchAdapter(engine: string): BookingAdapter { ... }
export function isSearchAdapterAvailable(engine: string): boolean { ... }
```

Lo mismo para `favorites/registry.ts` y `simpleblock/registry.ts`.

### Tramo 5 — Bloques del page builder

Tres bloques, todos client components (`'use client'`):

**BookingSearchBlock** (`blocks/booking-search/`):

Schema:

```typescript
bookingSearchBlockSchema = z.object({
  blockType: z.literal('bookingSearch'),
  widgetTitle: z.string().optional(),
  source: z.enum(['manual', 'fromAccommodation']).default('manual'),
  accommodationType: z.enum(['all', 'emplacement', 'locatif']).default('all'),
  // accommodationType solo aplica si source === 'manual'
  // si source === 'fromAccommodation', se deriva del tipo de alojamiento
  debug: z.boolean().default(false),
})
```

- Lee `useBookingConfig()` → comprueba `isSearchAdapterAvailable(engine)`
- Si `source === 'fromAccommodation'` → lee AccommodationContext
- Si disponible: `resolveSearchAdapter(engine).mount(ref, config, blockProps)`
- Container con `data-engine="{engine}"` para CSS overrides
- `useEffect` cleanup → `adapter.destroy()`

**BookingFavoritesBlock** (`blocks/booking-favorites/`):

Schema:

```typescript
bookingFavoritesBlockSchema = z.object({
  blockType: z.literal('bookingFavorites'),
  widgetTitle: z.string().optional(),
  quantity: z.number().int().positive().default(6),
  quantityToShow: z.number().int().positive().default(3),
})
```

- Mismo patrón: `useBookingConfig()` → `isFavoritesAdapterAvailable()`
- Si el motor no tiene favorites → no renderiza nada (prod) / DevWarning (dev)
- `quantity` y `quantityToShow` se pasan al adapter como blockProps

**BookingSimpleBlock** (`blocks/booking-simple/`):

Schema:

```typescript
bookingSimpleBlockSchema = z.object({
  blockType: z.literal('bookingSimple'),
  widgetTitle: z.string().optional(),
  source: z.enum(['manual', 'fromAccommodation']).default('manual'),
  categories: z.array(z.string()).optional(),
  // categories requerido si source === 'manual', ignorado si 'fromAccommodation'
  showPicture: z.boolean().default(false),
})
```

- Si `source === 'manual'` → usa `categories` del schema (el editor
  pone los IDs manualmente, con descripción en el admin de dónde sacarlos)
- Si `source === 'fromAccommodation'` → lee `accommodation.booking.externalId`
  del AccommodationContext y lo pasa como categoría
- Si `source === 'fromAccommodation'` pero no hay AccommodationContext
  (el bloque está en la home) → DevWarning en dev, null en prod

### Tramo 6 — Campos Payload + registro en site-demo

**Campos Payload** en `apps/site-demo/src/fields/blocks/`:

- `booking-search.ts` — campos espejo del schema Zod, con `condition`
  para que `accommodationType` solo aparezca si `source === 'manual'`
- `booking-favorites.ts` — widgetTitle + quantity + quantityToShow
- `booking-simple.ts` — campos espejo del schema, con `condition`
  para que `categories` solo aparezca si `source === 'manual'`
- Añadir los tres a `contentBlocks` en `fields/blocks/index.ts`

El campo `categories` en Payload tiene `admin.description`:
"IDs de categoría del motor de reservas. En THR, consultar el panel
de administración de THR para obtener los IDs."

**Registro:**

- `blockRegistry.ts` — entradas bookingSearch, bookingFavorites, bookingSimple
- `apps/site-demo/src/blocks/` — reexports de costura

**Layout:**

- Envolver el contenido con `<BookingProvider booking={siteConfig.booking}>`
- Va dentro del layout de frontend, después de cargar globals

**CSS overrides:**

- Crear `apps/site-demo/src/styles/booking/thr-overrides.css`
- Crear `apps/site-demo/src/styles/booking/mastercamping-overrides.css`
- El layout importa el del motor activo (por ahora importar ambos —
  son pocos KB y solo aplican via selector `[data-engine]`)

**Seed:**

- Verificar que HU-019 ya seedeó la booking config de Mastercamping
- Añadir un bloque bookingSearch (source: manual) en la home seedeada
- Si hay alojamientos seedeados con booking.externalId, añadir un
  bookingSimple (source: fromAccommodation) en un bloque de
  accommodation para verificar la resolución automática

**Migración:**

- `pnpm --filter site-demo payload migrate:create hu020_booking_blocks`

### Tramo 7 — Tests

- Unit tests para cada adapter (mount, destroy, validateConfig, blockProps)
- Unit tests para cada registry (resolve, isAvailable, engine desconocido)
- Unit tests para script-loader (dedup, loadStylesheet)
- Unit tests para BookingProvider (context, null cuando none)
- Unit tests para cada bloque:
  - source: manual → usa categories/accommodationType del schema
  - source: fromAccommodation → lee del AccommodationContext
  - source: fromAccommodation sin context → degrada correctamente
  - no renderiza sin adapter (graceful degradation)
- Unit tests para DevWarning (solo en dev)
- Cobertura: adapters >90%, bloques >80%

## Leer antes

- `docs/specs/reservas/index.md` — arquitectura del sistema de booking
- `docs/specs/reservas/motores/thr/index.md` — spec completa THR
- `docs/specs/reservas/motores/mastercamping/index.md` — spec completa Mastercamping
- `docs/specs/reservas/bloques/index.md` — spec de los bloques
- `docs/specs/payload/modelo-datos.md` — campos booking en site-config
- `packages/core-ui/src/schemas/globals/site-config.schema.ts` — bookingConfigSchema
- `packages/core-ui/src/schemas/collections/accommodations.schema.ts` — booking.externalId
- `docs/docs/estandares/codigo.md`
- `docs/docs/estandares/testing.md`

## Criterios de aceptación

### Infraestructura
- [ ] BookingProvider expone useBookingConfig() con la config validada
- [ ] useBookingConfig() devuelve null cuando engine === 'none'
- [ ] script-loader carga scripts una sola vez (dedup)
- [ ] script-loader carga CSS cuando el motor lo requiere
- [ ] DevWarning solo renderiza en development

### THR
- [ ] BookingSearchBlock renderiza `<thr-search-engine>` cuando engine === 'thr'
- [ ] BookingSearchBlock pasa title y type como atributos al widget
- [ ] BookingSearchBlock con source 'fromAccommodation' deriva type del alojamiento
- [ ] BookingFavoritesBlock renderiza `<thr-favorites>` cuando features.favorites === true
- [ ] BookingFavoritesBlock pasa quantity y quantityToShow al widget
- [ ] BookingFavoritesBlock no renderiza cuando features.favorites === false
- [ ] BookingSimpleBlock con source 'manual' usa categories del bloque
- [ ] BookingSimpleBlock con source 'fromAccommodation' usa externalId del alojamiento
- [ ] BookingSimpleBlock sin AccommodationContext y source 'fromAccommodation' degrada
- [ ] BookingSimpleBlock pasa showPicture al widget
- [ ] Script URL se compone correctamente desde codeCamping + features
- [ ] El script se carga una sola vez aunque haya 3 widgets en la página

### Mastercamping
- [ ] BookingSearchBlock renderiza MasterWidget cuando engine === 'mastercamping'
- [ ] JS y CSS de CDN se cargan correctamente
- [ ] BookingFavoritesBlock no renderiza (graceful degradation)
- [ ] BookingSimpleBlock no renderiza (graceful degradation)

### Bloques
- [ ] Los 3 bloques están en blockRegistry
- [ ] Los 3 bloques aparecen en el admin de Payload como opciones
- [ ] Container tiene data-engine para CSS overrides
- [ ] useEffect cleanup llama adapter.destroy()
- [ ] Campos condicionales en Payload (categories solo si source === manual)

### General
- [ ] Todos los adapters pasan tests con cobertura >90%
- [ ] Todos los bloques pasan tests con cobertura >80%
- [ ] CSS overrides existen para THR y Mastercamping
- [ ] pnpm typecheck, lint, format:check sin errores
- [ ] Migración generada

## No incluido en esta HU

- CSP headers — backlog post-Hito 1
- Cookiebot consent bridge — backlog post-Hito 1
- SPA navigation cleanup — backlog post-Hito 1
- Smoke test con codeCamping real — backlog post-Hito 1
- Witbooking / Resalys — placeholders en el schema, sin adapter
- Select dinámico de categories desde el motor — futuro, por ahora campo texto

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|