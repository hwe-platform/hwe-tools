---
id: HU-019
titulo: Booking config completa en Payload — campos por motor con validación Zod
estado: spec-lista
prioridad: 2
hito: 1
agente: code-builder
rama: feat/HU-019-booking-config
dependencias: [HU-005]
---

## Contexto

El global `site-config` tiene un grupo `booking` con solo el campo `engine`.
Los campos específicos de cada motor (credenciales, URLs, features) no existen
aún — el comentario dice "pendiente de spec por motor". Sin estos campos, la
config de reservas no se puede gestionar desde el admin de Payload.

Esta historia completa el grupo `booking` con campos condicionales por motor
y extiende el schema Zod con la discriminated union. Es la base para que los
futuros bloques de booking lean su config de Payload en vez de un fichero
estático.

## Qué hacer

### 1. Extender el Zod schema en core-ui

Fichero: `packages/core-ui/src/schemas/globals/site-config.schema.ts`

Reemplazar el placeholder actual (líneas 85-88):

```typescript
booking: z.object({
  // TODO: campos específicos según `engine` — pendiente de spec por motor
  engine: z.enum(['thr', 'witbooking', 'mastercamping', 'resalys']),
}),
```

Por la discriminated union:

```typescript
booking: z.discriminatedUnion('engine', [
  // THR (eSeasonResa) — ILib v4 Web Components
  z.object({
    engine: z.literal('thr'),
    codeCamping: z.string().min(1),
    siteId: z.string().optional(),
    features: z.object({
      favorites: z.boolean().default(false),
      simpleblock: z.boolean().default(false),
    }).default({}),
  }),

  // Mastercamping
  z.object({
    engine: z.literal('mastercamping'),
    idProperty: z.number().int().positive(),
    bookingUrl: z.string().url(),
    layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
  }),

  // Witbooking — placeholder, campos por definir
  z.object({
    engine: z.literal('witbooking'),
  }),

  // Resalys — placeholder, campos por definir
  z.object({
    engine: z.literal('resalys'),
  }),

  // Sin motor de reservas
  z.object({
    engine: z.literal('none'),
  }),
]),
```

Nota: `siteConfigUpdateSchema` usa `.partial()`, pero `z.discriminatedUnion`
no soporta `.partial()` directamente. Solución: extraer el booking union a
una constante y hacer que `siteConfigUpdateSchema` use un override explícito
para el campo `booking`:

```typescript
export const bookingConfigSchema = z.discriminatedUnion('engine', [ ... ]);

export const siteConfigSchema = z.object({
  // ... otros campos ...
  booking: bookingConfigSchema,
});

// Para updates parciales: booking se envía entero o no se envía
export const siteConfigUpdateSchema = siteConfigSchema.partial();
```

Como `booking` es un grupo (objeto), `.partial()` hará que sea opcional en
el update — pero si se envía, debe ser un objeto completo válido. Eso es
correcto: no tiene sentido enviar medio booking config.

### 2. Extender el campo Payload en site-demo

Fichero: `apps/site-demo/src/fields/site-config-groups.ts`

Reemplazar el `bookingEngineGroup` actual (líneas 172-185) con campos
condicionales. Usar `admin.condition` para mostrar/ocultar según engine:

```typescript
export const bookingEngineGroup: Field = {
  name: 'booking',
  type: 'group',
  label: 'Motor de reservas',
  fields: [
    {
      name: 'engine',
      type: 'select',
      required: true,
      defaultValue: 'none',
      options: [
        { label: 'THR (eSeasonResa)', value: 'thr' },
        { label: 'Mastercamping', value: 'mastercamping' },
        { label: 'Witbooking', value: 'witbooking' },
        { label: 'Resalys', value: 'resalys' },
        { label: 'Sin motor', value: 'none' },
      ],
    },

    // ── THR fields ──────────────────────────────────
    {
      name: 'codeCamping',
      type: 'text',
      required: true,
      admin: {
        description: 'Código del camping en THR. Ej: LACIVELLE.',
        condition: (_data, siblingData) => siblingData?.engine === 'thr',
      },
    },
    {
      name: 'siteId',
      type: 'text',
      admin: {
        description: 'ID del site en THR. Opcional — solo si el camping tiene varios sites.',
        condition: (_data, siblingData) => siblingData?.engine === 'thr',
      },
    },
    {
      name: 'features',
      type: 'group',
      admin: {
        description: 'Widgets THR adicionales.',
        condition: (_data, siblingData) => siblingData?.engine === 'thr',
      },
      fields: [
        {
          name: 'favorites',
          type: 'checkbox',
          defaultValue: false,
          label: 'Favoritos',
          admin: { description: 'Activar bloque de favoritos.' },
        },
        {
          name: 'simpleblock',
          type: 'checkbox',
          defaultValue: false,
          label: 'SimpleBlock',
          admin: { description: 'Activar bloque de disponibilidad rápida.' },
        },
      ],
    },

    // ── Mastercamping fields ────────────────────────
    {
      name: 'idProperty',
      type: 'number',
      required: true,
      admin: {
        description: 'ID numérico de la propiedad en Mastercamping. Ej: 3.',
        condition: (_data, siblingData) => siblingData?.engine === 'mastercamping',
      },
    },
    {
      name: 'bookingUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'URL del sistema de reservas. Ej: https://booking.familycampings.com',
        condition: (_data, siblingData) => siblingData?.engine === 'mastercamping',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'horizontal',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
      admin: {
        description: 'Disposición del formulario de búsqueda.',
        condition: (_data, siblingData) => siblingData?.engine === 'mastercamping',
      },
    },

    // ── Witbooking / Resalys ────────────────────────
    // Sin campos específicos todavía. Se añadirán con su spec.
  ],
};
```

Matiz sobre `required` con `condition`: en Payload, un campo con `required:
true` y `condition` que lo oculta NO impide guardar — Payload solo valida
campos visibles. Por tanto, `codeCamping required: true` con condition
`engine === 'thr'` solo es obligatorio cuando THR está seleccionado. Si el
admin cambia de THR a Mastercamping, los campos de THR se ocultan pero sus
datos persisten en la DB hasta el siguiente guardado. Esto es el
comportamiento estándar de Payload.

### 3. Actualizar el seed

Fichero: `apps/site-demo/scripts/seed-globals.mjs`

Cambiar la línea 225 de:

```javascript
booking: { engine: 'mastercamping' },
```

A:

```javascript
booking: {
  engine: 'mastercamping',
  idProperty: 3,
  bookingUrl: 'https://booking.familycampings.com',
  layout: 'horizontal',
},
```

### 4. Actualizar tests de schemas

Fichero: `packages/core-ui/src/schemas/globals/site-config.schema.test.ts`

Añadir casos para la discriminated union:

- Caso THR válido: `{ engine: 'thr', codeCamping: 'LACIVELLE' }`
- Caso THR inválido: `{ engine: 'thr' }` sin codeCamping → falla
- Caso Mastercamping válido: `{ engine: 'mastercamping', idProperty: 3, bookingUrl: 'https://...' }`
- Caso Mastercamping inválido: `{ engine: 'mastercamping', idProperty: 'tres' }` → falla (no es number)
- Caso none: `{ engine: 'none' }` → OK
- Caso con engine desconocido → falla
- Caso con defaults: THR sin features → features = `{ favorites: false, simpleblock: false }`
- Caso update parcial: `siteConfigUpdateSchema` sin booking → OK (partial)

### 5. Actualizar test de paridad Payload ↔ Zod

Fichero: `apps/site-demo/src/globals/parity.test.ts`

Este test compara que los campos de la config Payload coincidan con el
schema Zod. Verificar que la adición de los nuevos campos de booking no
rompe la paridad. Si el test solo compara nombres top-level del grupo
`booking`, los campos condicionales internos podrían quedar fuera —
verificar y ajustar.

### 6. Crear migración

Ejecutar `pnpm --filter site-demo payload migrate:create` para generar la
migración que añade las nuevas columnas a la tabla de site-config.
Verificar que la migración se ejecuta limpia contra Postgres.

### 7. Exportar bookingConfigSchema desde core-ui

Añadir `bookingConfigSchema` al barrel export de
`packages/core-ui/src/schemas/globals/index.ts` y al
`packages/core-ui/src/index.ts`. Los futuros bloques de booking lo
necesitarán para validar la config.

## Leer antes

- `packages/core-ui/src/schemas/globals/site-config.schema.ts` — schema actual
- `apps/site-demo/src/fields/site-config-groups.ts` — campos Payload actuales
- `apps/site-demo/src/globals/SiteConfig.ts` — config del global
- `apps/site-demo/src/globals/parity.test.ts` — test de paridad
- `apps/site-demo/scripts/seed-globals.mjs` — seed data
- `docs/decisiones/DEC-004-zod.md` — Zod como fuente de verdad

## Criterios de aceptación

- [ ] `bookingConfigSchema` exportado desde `@hwe-platform/core-ui`
- [ ] El schema valida correctamente cada variante de motor (THR, Mastercamping, none)
- [ ] El schema rechaza datos inválidos (codeCamping vacío, idProperty no numérico, engine desconocido)
- [ ] Los defaults funcionan (features: {}, layout: 'horizontal')
- [ ] `siteConfigUpdateSchema.partial()` funciona sin romper la discriminated union
- [ ] En Payload admin, seleccionar THR muestra codeCamping + siteId + features
- [ ] En Payload admin, seleccionar Mastercamping muestra idProperty + bookingUrl + layout
- [ ] En Payload admin, seleccionar 'Sin motor' no muestra campos adicionales
- [ ] El seed de familycampings incluye todos los campos de Mastercamping
- [ ] La migración se ejecuta sin errores en Postgres
- [ ] Test de paridad Payload ↔ Zod sigue pasando
- [ ] Tests de schema ≥95% cobertura del grupo booking
- [ ] `pnpm typecheck` y `pnpm lint` sin errores en ambos packages

## Notas

**Sobre el consumo:** esta HU solo crea la estructura de datos. Los bloques
de booking (BookingSearchBlock, BookingFavoritesBlock, BookingSimpleBlock) se
reimplementarán en una HU futura. Cuando se hagan, leerán booking de
`siteConfig.booking` que ya llega en el `loadGlobals()` del layout.

**Sobre Witbooking y Resalys:** quedan como schemas vacíos (solo engine).
Sus campos se añadirán cuando llegue la spec del motor.

**Sobre `client.config.ts`:** no existe en el codebase actual. No hay nada
que migrar ni limpiar.