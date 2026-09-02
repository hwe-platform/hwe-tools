# Estándar de nombrado

Convenciones de nombrado para archivos, carpetas, componentes, variables y tipos en HWE.

---

## Archivos

| Tipo de archivo | Convención | Ejemplo |
|----------------|------------|---------|
| Componente React | PascalCase | `HeroBlock.tsx`, `AccommodationCard.tsx` |
| Test (co-localizado) | PascalCase + `.test` | `HeroBlock.test.tsx` |
| Hook | `use` + camelCase | `useBookingSearch.ts`, `useLocale.ts` |
| Utilidad / helper | camelCase | `buildSeoMetadata.ts`, `formatPrice.ts` |
| Schema Zod | camelCase | `accommodationSchema.ts`, `pageSchema.ts` |
| Configuración | kebab-case | `payload.config.ts`, `tailwind.config.ts` |
| Archivos Next.js | minúsculas (exigido por Next.js) | `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx` |

**Regla:** El nombre del archivo coincide con el nombre de lo que exporta. `HeroBlock.tsx` exporta `HeroBlock`. `useLocale.ts` exporta `useLocale`. Sin excepciones.

## Carpetas

**Siempre kebab-case.** Incluye carpetas de bloques.

```
core-ui/
  hero-block/
    HeroBlock.tsx
    HeroBlock.test.tsx
  accommodation-card/
    AccommodationCard.tsx
    AccommodationCard.test.tsx
  booking-search/
    BookingSearch.tsx
```

**Motivo:** macOS no distingue mayúsculas de minúsculas en carpetas, Linux sí. `HeroBlock/` y `heroblock/` son la misma carpeta en Mac pero diferentes en el servidor. kebab-case evita este problema.

---

## Dentro del código

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes React | PascalCase | `HeroBlock`, `AccommodationCard`, `NavBar` |
| Funciones | camelCase | `buildSeoMetadata()`, `applyVAT()` |
| Variables | camelCase | `activeLocale`, `isAvailable`, `pricePerNight` |
| Constantes | UPPER_SNAKE_CASE | `MAX_IMAGES`, `BOOKING_STATUS`, `DEFAULT_LOCALE` |
| Tipos e interfaces | PascalCase, sin prefijo | `Accommodation`, `BookingConfig`, `PageProps` |
| Schemas Zod | camelCase + sufijo `Schema` | `accommodationSchema`, `pageSchema` |
| Enums / objetos const | PascalCase + PascalCase valores | `BookingStatus.Confirmed`, `AccommodationType.Camping` |
| Hooks | `use` + camelCase | `useBookingSearch`, `usePersonalization` |

### Sin prefijos húngaros

```typescript
// ❌ Mal — prefijos innecesarios
interface IAccommodation { ... }
type TBookingConfig = { ... }

// ✅ Bien — TypeScript ya distingue tipos de valores
interface Accommodation { ... }
type BookingConfig = { ... }
```

### Preferir objetos `as const` sobre enums

```typescript
// ✅ Preferido — predecible en el bundle, funciona bien con Zod
const BookingStatus = {
  Draft: 'draft',
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
} as const

type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus]

// ⚠️ Evitar — comportamiento menos predecible en el bundle
enum BookingStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}
```

---

## Payload CMS

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Slugs de collections | kebab-case, plural | `accommodations`, `entities`, `pages` |
| Slugs de globals | kebab-case | `site-config`, `header`, `footer`, `banner` |
| Slugs de bloques | kebab-case | `hero`, `gallery`, `accommodation-card` |
| Nombres de campos | camelCase | `petFriendly`, `pricePerNight`, `backgroundImage` |

---

## Regla general

Si ves un nombre que no sigue estas convenciones, corrígelo en el mismo commit donde lo encuentres. No abrir un ticket aparte para renombrar — se arregla al tocar el archivo.
