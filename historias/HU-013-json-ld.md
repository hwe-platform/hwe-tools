---
id: HU-013
titulo: Datos estructurados JSON-LD
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-007, HU-008]
---

## Contexto

JSON-LD es transversal: toca el layout (WebSite, Organization, BreadcrumbList en todas las páginas) y cada tipo de template (Campground en home, Accommodation en fichas, FAQPage en FAQ, BlogPosting en artículos...). Distribuirlo en varias HUs haría que nadie fuese responsable del conjunto y las piezas podrían no encajar.

Esta historia implementa **todas** las funciones generadoras de JSON-LD en `apps/site-demo/src/services/json-ld/`, las integra en el layout, y las conecta con el resolver de páginas. Las specs de cada schema ya están escritas en `specs/seo-geo/schemas/` (12 archivos).

### Arquitectura de tres capas

**Capa 1 — Siempre presente (layout):** todas las páginas sin excepción incluyen WebSite + Organization y BreadcrumbList (excepto home).

**Capa 2 — Específica por tipo de página:** solo si el tipo de página la tiene (Campground en home, Accommodation en fichas, Restaurant, Event, BlogPosting, FAQPage, TouristAttraction, listado de alojamientos).

**Capa 3 — Genérica (fallback):** cualquier página sin schema específico recibe WebPage con título, descripción, URL e idioma. Ninguna página sale sin JSON-LD.

### Tres principios inamovibles

1. **Solo datos reales** — si un campo no tiene valor en Payload, no aparece en el schema. Nunca placeholders, nunca valores inventados.
2. **Mínimo viable por tipo** — cada campo es obligatorio (sin él Google ignora el schema), recomendado (Google lo valora) u opcional (mejora menor). Si faltan los obligatorios, no se genera ese schema.
3. **Dinámico, no estático** — las funciones TypeScript reciben datos de Payload y devuelven JSON-LD. Si el editor cambia un dato, el schema cambia en el siguiente render.

### Tipo de negocio dinámico

El `@type` raíz del schema principal (Campground, Hotel, Resort, BedAndBreakfast) viene de `site-config.general.businessType`. Esto afecta a la home y a las páginas que referencian el negocio.

### Ejecución en paralelo

Esta HU toca `services/json-ld/` y el layout — no bloques. Se puede ejecutar en paralelo con HU-010 (grids) y HU-011 (gallery, map, fichas) sin conflictos de archivos.

## Qué hacer

### 1. Estructura de carpetas

Crear `apps/site-demo/src/services/json-ld/` con esta estructura:

```
services/json-ld/
├── index.ts               → export público
├── types.ts               → tipos compartidos (JsonLdSchema, etc.)
├── utils.ts               → helpers (buildAddress, buildGeo, omitEmpty, wrapInGraph)
├── base.ts                → buildWebSiteSchema, buildOrganizationSchema
├── breadcrumbs.ts         → buildBreadcrumbSchema
├── campground.ts          → buildCampgroundSchema (home)
├── accommodation.ts       → buildAccommodationSchema (ficha)
├── accommodation-listing.ts → buildAccommodationListingSchema
├── restaurant.ts          → buildRestaurantSchema
├── event.ts               → buildEventSchema
├── article.ts             → buildArticleSchema
├── faq.ts                 → buildFAQSchema
├── environment.ts         → buildEnvironmentSchema
├── web-page.ts            → buildWebPageSchema (fallback)
└── page-resolver.ts       → buildPageJsonLd (orquestador)
```

### 2. Tipos compartidos (`types.ts`)

Definir tipos base:

- `JsonLdThing` — tipo genérico con `@type`, `@id`, y campos opcionales
- `JsonLdGraph` — wrapper `{ "@context": "https://schema.org", "@graph": [...] }`
- Tipos auxiliares: `PostalAddress`, `GeoCoordinates`, `QuantitativeValue`, `Offer`, etc.
- Tipo del mapa `businessType → @type`: `{ campground: 'Campground', hotel: 'Hotel', resort: 'Resort', guesthouse: 'BedAndBreakfast' }`

### 3. Helpers (`utils.ts`)

Funciones puras compartidas:

- `buildAddress(contact)` → `PostalAddress` o `undefined` si incompleta
- `buildGeo(location)` → `GeoCoordinates` o `undefined` si no hay lat/lng
- `omitEmpty(obj)` → elimina campos `undefined`, `null`, arrays vacíos
- `wrapInGraph(...schemas)` → envuelve N schemas en un `@graph` con `@context`
- `toPlainText(lexicalContent)` → convierte Lexical JSON a texto plano (para descriptions)
- `buildImageArray(media)` → extrae URLs de imágenes desde relaciones de Payload

### 4. Builders de capa 1 (`base.ts`, `breadcrumbs.ts`)

**`buildWebSiteSchema(siteConfig, locale)`** — Spec: `specs/seo-geo/schemas/base-website.md`

- Siempre presente. `@id`: `{siteUrl}/#website`
- Campos: name, url, inLanguage, description (localizada)

**`buildOrganizationSchema(siteConfig)`** — Spec: `specs/seo-geo/schemas/base-website.md`

- Siempre presente. `@id`: `{siteUrl}/#organization`
- Campos: name, url, logo, telephone, email, address, sameAs (redes sociales)
- Cada campo solo si existe en `site-config`

**`buildBreadcrumbSchema(segments, locale)`** — Spec: `specs/seo-geo/schemas/breadcrumbs.md`

- Todas las páginas excepto home
- Recibe array de `{ name, url }` calculado por el resolver
- Último item sin `item` (URL) — es la página actual
- Nombres y URLs localizados según idioma activo

### 5. Builders de capa 2

**`buildCampgroundSchema(siteConfig, accommodations?, entities?)`** — Spec: `campground.md`

- Solo en home. `@type` dinámico desde `businessType`
- Campos obligatorios: name, description, url, address
- Recomendados: image, logo, geo, telephone, email, starRating, openingHours, amenityFeature (entities featured), containsPlace (accommodations featured)
- Opcionales: petsAllowed, paymentAccepted, aggregateRating, contactPoint, sameAs

**`buildAccommodationSchema(accommodation, siteConfig)`** — Spec: `accommodation.md`

- En ficha individual. `@type`: Accommodation o CampingPitch según `type`
- Campos: name, description, url, image, occupancy, numberOfRooms, floorSize, petsAllowed, amenityFeature, offers (si tiene precio), containedInPlace

**`buildAccommodationListingSchema(page, accommodations, siteConfig)`** — Spec: `accommodation-listing.md`

- En páginas de listado. `@type` del negocio + `containsPlace` con resumen de cada alojamiento

**`buildRestaurantSchema(entity, siteConfig)`** — Spec: `restaurant.md`

- En ficha de entidad tipo restaurant
- Campos: name, description, url, image, address, geo, servesCuisine, hasMenu, openingHours, containedInPlace

**`buildEventSchema(entity, siteConfig)`** — Spec: `event.md`

- En ficha de entidad tipo event. Sin `startDate` no se genera
- Campos: name, description, url, image, startDate, endDate, location, organizer, eventStatus

**`buildArticleSchema(article, siteConfig)`** — Spec: `article.md`

- En ficha de artículo. Sin `publishedAt` no se genera — fallback a WebPage
- Campos: headline, description, url, datePublished, dateModified, image, author, publisher, articleSection, inLanguage

**`buildFAQSchema(faqBlocks)`** — Spec: `faq.md`

- Cuando la página contiene bloque(s) FAQ. Se genera desde los items del bloque, no de una colección
- Si hay varios bloques FAQ en la misma página, se combinan en un solo FAQPage
- Cada item: Question + acceptedAnswer (texto plano del richText)

**`buildEnvironmentSchema(entity)`** — Spec: `environment.md`

- En ficha de entidad tipo environment. `@type`: TouristAttraction
- Campos: name, description, url, image, touristType

**`buildWebPageSchema(page)`** — Spec: `web-page.md`

- Fallback para cualquier página sin schema específico
- Campos: name, description, url, inLanguage, isPartOf (ref WebSite)

### 6. Orquestador (`page-resolver.ts`)

**`buildPageJsonLd(resolvedContent, siteConfig, locale, path)`**

Función principal que decide qué schemas se generan:

```typescript
function buildPageJsonLd(
  resolvedContent: ResolvedContent,
  siteConfig: SiteConfig,
  locale: string,
  path: string,
  blocks?: BlockInstance[]
): JsonLdGraph {
  // Capa 1 — siempre
  const base = [
    buildWebSiteSchema(siteConfig, locale),
    buildOrganizationSchema(siteConfig),
  ]
  if (path !== '/') {
    base.push(buildBreadcrumbSchema(segments, locale))
  }

  // Capa 2 — específica según tipo
  const specific = resolveSpecificSchema(
    resolvedContent, siteConfig, blocks
  )

  // Si no hay schema específico → capa 3
  const pageSchema = specific ?? buildWebPageSchema(resolvedContent)

  return wrapInGraph(...base, pageSchema)
}
```

`resolveSpecificSchema` usa el tipo de contenido resuelto por `services/resolver.ts` para elegir el builder correcto. Si el tipo no tiene builder, devuelve `null` → WebPage.

### 7. Integración en layout

Modificar `apps/site-demo/src/app/layout.tsx` (o el componente de metadata/head):

```tsx
// En el <head> de cada página
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd)
  }}
/>
```

El JSON-LD se genera en el Server Component durante el render — no hay llamada extra a Payload (los datos ya están resueltos por el resolver de la página).

### 8. Tests

Un archivo de test por builder + tests del orquestador:

```
services/json-ld/__tests__/
├── base.test.ts
├── breadcrumbs.test.ts
├── campground.test.ts
├── accommodation.test.ts
├── accommodation-listing.test.ts
├── restaurant.test.ts
├── event.test.ts
├── article.test.ts
├── faq.test.ts
├── environment.test.ts
├── web-page.test.ts
├── page-resolver.test.ts
└── utils.test.ts
```

Cada test verifica:

- Schema válido con datos completos
- Campos opcionales omitidos cuando no hay dato
- Schema NO generado cuando faltan campos obligatorios
- Output validable contra schema.org (estructura correcta)
- `omitEmpty` elimina campos vacíos
- Orquestador elige el builder correcto según tipo de contenido

Todos los tests usan fixtures con datos realistas de La Civelle (FR).

## Decisiones de diseño

### Decidido

| # | Decisión | Resolución | Justificación |
| --- | --- | --- | --- |
| 1 | ¿Un `@graph` o múltiples `<script>` tags? | Un solo `<script>` con `@graph` | Menos DOM, Google los parsea igual, más limpio |
| 2 | ¿Dónde se inyecta el JSON-LD? | En el layout, como Server Component | Los datos ya están resueltos; no hay fetch extra |
| 3 | ¿Cómo se mapea businessType? | Mapa const `{ campground: 'Campground', hotel: 'Hotel', resort: 'Resort', guesthouse: 'BedAndBreakfast' }` | Directo, tipado, sin switch |
| 4 | ¿Qué pasa con Lexical richText? | `toPlainText()` convierte a string sin HTML | JSON-LD `text` acepta string plano; HTML en JSON-LD es frágil |
| 5 | ¿FAQSchema viene de colección o de bloque? | Del bloque FAQ renderizado en la página | Google quiere que el FAQ visible coincida con el schema; si viene de una colección separada pueden divergir |

### Por decidir durante implementación

| # | Pregunta | Opciones | Impacto | |---|----------|----------|---------|| | 6 | ¿Validación del output JSON-LD con Zod? | A) Schema Zod que valide la estructura del JSON-LD generado (seguridad en tests). B) Solo tests manuales contra la spec | Bajo — los tests ya verifican la estructura; Zod añade una capa de seguridad pero también complejidad | | 7 | ¿`aggregateRating` en Campground? | A) Implementar si hay reseñas con nota media calculable. B) Diferir a cuando exista un sistema de reseñas real | Medio — Google muestra estrellas en resultados si hay aggregateRating, pero sin datos reales es peligroso | | 8 | ¿Cómo calcula breadcrumbs el path? | A) Desde el campo `parent` de la page en Payload. B) Desde la URL parseada. C) Desde un servicio de navegación | Alto — afecta a la arquitectura del resolver |

## Leer antes

- `specs/seo-geo/schemas/index.md` — principios y arquitectura de capas
- `specs/seo-geo/schemas/*.md` — spec de cada schema (leer solo el que toca)
- `specs/payload/modelo-datos.md` — estructura de colecciones y globals
- `specs/payload/servicios.md` — cómo funciona el resolver
- `docs/estandares/seo.md` — estándares SEO generales
- `docs/estandares/codigo.md` — convenciones de código
- `docs/estandares/testing.md` — convenciones de testing

## Criterios de aceptación

- [ ] `services/json-ld/` existe con todos los builders listados
- [ ] Cada builder es una función pura: recibe datos, devuelve objeto JSON-LD
- [ ] `buildPageJsonLd` orquesta correctamente según tipo de contenido resuelto
- [ ] Capa 1: todas las páginas tienen WebSite + Organization en el `@graph`
- [ ] Capa 1: todas las páginas excepto home tienen BreadcrumbList
- [ ] Capa 2: home genera Campground/Hotel/Resort según `businessType`
- [ ] Capa 2: ficha alojamiento genera Accommodation o CampingPitch según `type`
- [ ] Capa 2: página con bloque FAQ genera FAQPage combinando todos los bloques FAQ
- [ ] Capa 3: página sin schema específico genera WebPage
- [ ] Ningún schema contiene campos vacíos, null ni placeholders
- [ ] Campos opcionales se omiten si no hay dato en Payload
- [ ] Si faltan campos obligatorios de un schema, ese schema NO se genera
- [ ] El JSON-LD se inyecta como `<script type="application/ld+json">` en el layout
- [ ] Output validable con la herramienta de prueba de datos estructurados de Google
- [ ] Tests — cobertura >90% en todos los builders
- [ ] Tests — cobertura >80% en el orquestador
- [ ] Tests en castellano, co-localizados en `__tests__/`
- [ ] Fixtures con datos realistas de La Civelle (FR)

## Schemas implementados vs diferidos

| Schema | Se implementa ahora | Motivo si diferido |
| --- | --- | --- |
| WebSite + Organization | ✅ | — |
| BreadcrumbList | ✅ | — |
| Campground/Hotel | ✅ | — |
| Accommodation/CampingPitch | ✅ | — |
| Accommodation listing | ✅ | — |
| WebPage (fallback) | ✅ | — |
| FAQPage | ✅ | — |
| Restaurant | ⏳ Stub | Sin template de entidad aún |
| Event | ⏳ Stub | Sin template de entidad aún |
| BlogPosting | ⏳ Stub | Sin template de artículo aún |
| TouristAttraction | ⏳ Stub | Sin template de entorno aún |

Los stubs son funciones exportadas que existen y tienen tests, pero no se conectan al orquestador hasta que el template correspondiente esté implementado. Así el código está listo y testeado cuando llegue la HU del template.

## Aprendizajes

| Aprendizaje | Propagar a |
| --- | --- |
| *(se llena después si aplica)* |  |

## Retrospectiva

*(se llena después si aplica)*
