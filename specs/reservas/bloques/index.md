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

Cada bloque lee `siteConfig.booking.engine` y resuelve el adapter via
registry. El bloque no sabe qué motor hay detrás — solo conoce la
interfaz `BookingAdapter`.

### Solo campos de presentación en el schema

El schema Zod del bloque contiene campos de UI, nunca credenciales
ni config del motor:

```typescript
// BookingSearchBlock schema — ejemplo
z.object({
  blockType: z.literal('bookingSearch'),
  widgetTitle: z.string().optional(),
  accommodationType: z.string().optional(),
  debug: z.boolean().default(false),
})
```

Las credenciales (`codeCamping`, `idProperty`, etc.) vienen de
`siteConfig.booking`, no del bloque.

### Graceful degradation

Antes de resolver el adapter, el bloque comprueba:

```typescript
if (!isSearchAdapterAvailable(booking.engine)) {
  // Dev: DevWarning visual
  // Prod: return null (no renderiza nada)
}
```

Esto permite que una composición de página incluya bloques de booking
que no aplican al motor actual sin romper la página.

### Lifecycle

```
1. Bloque monta (React useEffect)
2. Lee siteConfig.booking
3. Comprueba isAdapterAvailable(engine)
4. Si disponible → resolveAdapter(engine)
5. adapter.validateConfig(booking)
6. adapter.mount(containerRef, booking)
7. Usuario interactúa con widget del vendor
8. React desmonta → adapter.destroy()
```

El adapter carga scripts de vendor al primer mount y los reutiliza
en mounts posteriores (navegación SPA).

## BookingSearchBlock

**Función:** buscador de disponibilidad. Es el bloque principal de
reservas — presente en la mayoría de páginas de camping/hotel.

**Schema (campos de presentación):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `widgetTitle` | text, opcional, localized | Título sobre el buscador |
| `accommodationType` | text, opcional | Filtro por tipo de alojamiento |
| `debug` | boolean, default false | Modo debug (solo dev) |

**Motores implementados:** THR (`<thr-search-engine>`), Mastercamping
(`new MasterWidget()`).

## BookingFavoritesBlock

**Función:** carrusel de categorías de alojamiento marcadas como
favoritas en el motor de reservas. Solo disponible para motores que
exponen este concepto (THR).

**Schema:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `widgetTitle` | text, opcional, localized | Título de la sección |

**Motores implementados:** THR (`<thr-favorites>`). Mastercamping no
ofrece este widget — el bloque degrada silenciosamente.

## BookingSimpleBlock

**Función:** widget compacto de disponibilidad rápida para una o varias
categorías específicas. Permite al visitante ver disponibilidad sin pasar
por el buscador completo.

**Schema:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `widgetTitle` | text, opcional, localized | Título de la sección |
| `categories` | string[], min 1 | IDs de categorías del motor |

**Motores implementados:** THR (`<thr-simpleblock>`). Mastercamping no
ofrece este widget — el bloque degrada silenciosamente.

**Nota:** los IDs de categoría son específicos del motor — en THR son
IDs numéricos como `'12'`. Cada motor puede tener su propio sistema de
categorías.

## Notas de implementación

### DevWarning

Componente compartido en `core-ui/src/primitives/` o `core-ui/src/utils/`:

- Solo renderiza en `process.env.NODE_ENV === 'development'`
- Estilos inline (no Tailwind) para funcionar sin config de CSS
- `role="status"` para accesibilidad
- Reutilizable fuera de booking (cualquier adapter/feature no implementado)

### Container con data-engine

Cada adapter envuelve el widget en un contenedor con
`data-engine="{engine}"`. Esto permite que los CSS overrides del cliente
se apliquen al motor correcto sin afectar al resto de la página.

```html
<div data-engine="thr">
  <thr-search-engine></thr-search-engine>
</div>
```
