---
titulo: Capa de servicios Payload
fecha: 2026-09-03
estado: definido
dominio: payload
hito: 1
relacionado:
  - docs/arquitectura/paginas-routing.md
  - specs/payload/modelo-datos.md
  - specs/payload/localizacion.md
---

## Contexto

Los Server Components de Next.js necesitan consultar Payload para obtener
datos. Sin una capa intermedia, cada componente hace su propia query inline
y se duplica lógica. La capa de servicios centraliza todas las consultas
en funciones reutilizables, testeable con mocks, con JSDoc en castellano.

## Decisiones

- Todas las consultas usan **Payload Local API** (acceso directo a BD,
  sin HTTP). Máximo rendimiento.
- Cada función recibe `locale` y usa `fallbackLocale` internamente
  (DEC-009, localizacion.md).
- Las funciones devuelven datos o `null` — nunca lanzan excepciones
  por datos no encontrados.
- La capa vive en `apps/site-demo/src/services/` (código de la app,
  no de la librería). Se hereda al extraer hwe-template.
- Los clientes pueden extender los servicios con funciones propias
  sin sobreescribir las genéricas.

## Estructura

```
apps/site-demo/src/services/
├── index.ts                    → re-exporta todo
├── payload-client.ts           → inicialización compartida de Payload
├── pages.ts                    → consultas de páginas
├── accommodations.ts           → consultas de alojamientos
├── entities.ts                 → consultas de entidades
├── articles.ts                 → consultas de artículos
├── globals.ts                  → consultas de globals
├── resolver.ts                 → resolución de slug (catch-all)
└── static-params.ts            → generación de rutas estáticas
```

## Modelo / Funciones

### payload-client.ts

```typescript
/**
 * Obtiene la instancia de Payload inicializada.
 * Centralizado para no repetir la importación del config en cada archivo.
 */
export async function getPayloadClient()
```

### pages.ts

```typescript
/**
 * Busca una página por su slug en el idioma indicado.
 *
 * @param slug - Slug de la página
 * @param locale - Código de idioma (ej: 'fr', 'en')
 * @returns La página con sus bloques o null
 */
export async function getPageBySlug(slug: string, locale: string)

/**
 * Busca la página de tipo home.
 *
 * @param locale - Código de idioma
 * @returns La home con sus bloques o null
 */
export async function getHomePage(locale: string)
```

### accommodations.ts

```typescript
/**
 * Busca un alojamiento por su slug.
 */
export async function getAccommodationBySlug(slug: string, locale: string)

/**
 * Devuelve los alojamientos marcados como destacados.
 *
 * @param locale - Código de idioma
 * @param limit - Máximo de resultados (por defecto 3)
 */
export async function getFeaturedAccommodations(locale: string, limit?: number)

/**
 * Devuelve alojamientos de una categoría específica.
 */
export async function getAccommodationsByCategory(
  categorySlug: string, locale: string, limit?: number
)

/**
 * Devuelve alojamientos recomendados para una ficha.
 * Si el alojamiento tiene comparison manual, devuelve esos.
 * Si no, devuelve otros de la misma categoría.
 *
 * @param accommodationId - ID del alojamiento actual
 * @param categorySlug - Categoría para fallback automático
 * @param locale - Código de idioma
 * @param limit - Máximo de resultados (por defecto 3)
 */
export async function getRelatedAccommodations(
  accommodationId: string, categorySlug: string, locale: string, limit?: number
)
```

### entities.ts

```typescript
/**
 * Busca una entidad por su slug.
 */
export async function getEntityBySlug(slug: string, locale: string)

/**
 * Devuelve entidades de un tipo específico (service, activity, environment...).
 *
 * @param type - Tipo de entidad
 * @param locale - Código de idioma
 * @param limit - Máximo de resultados
 */
export async function getEntitiesByType(
  type: string, locale: string, limit?: number
)

/**
 * Devuelve entidades marcadas como destacadas.
 */
export async function getFeaturedEntities(locale: string, limit?: number)
```

### articles.ts

```typescript
/**
 * Busca un artículo por su slug.
 */
export async function getArticleBySlug(slug: string, locale: string)

/**
 * Devuelve los artículos más recientes.
 */
export async function getLatestArticles(locale: string, limit?: number)

/**
 * Devuelve artículos de una categoría.
 */
export async function getArticlesByCategory(
  category: string, locale: string, limit?: number
)

/**
 * Devuelve artículos marcados como destacados.
 */
export async function getFeaturedArticles(locale: string, limit?: number)
```

### globals.ts

```typescript
/**
 * Obtiene la configuración general del site.
 * No depende del idioma (datos no localizados mayormente).
 */
export async function getSiteConfig()

/**
 * Obtiene el header con la navegación traducida.
 */
export async function getHeader(locale: string)

/**
 * Obtiene el footer con las columnas traducidas.
 */
export async function getFooter(locale: string)

/**
 * Obtiene el banner global.
 */
export async function getBanner(locale: string)

/**
 * Obtiene todos los globals necesarios para el layout de una vez.
 * Evita 4 llamadas separadas.
 *
 * @returns { siteConfig, header, footer, banner }
 */
export async function getAllGlobals(locale: string)
```

### resolver.ts

```typescript
/**
 * Resuelve un slug buscando en todas las colecciones en orden.
 * Es el corazón del catch-all [...slug].
 *
 * Orden de búsqueda: pages → accommodations → entities → articles
 *
 * @param slug - Slug completo de la URL
 * @param locale - Código de idioma
 * @returns El contenido con su tipo, o null si no existe
 *
 * @example
 * const result = await resolveSlug('le-camping', 'fr')
 * // { type: 'page', data: { title: 'Le Camping', blocks: [...] } }
 *
 * const result = await resolveSlug('mobile-home-confort', 'fr')
 * // { type: 'accommodation', data: { name: 'Mobile Home Confort', ... } }
 *
 * const result = await resolveSlug('url-inexistente', 'fr')
 * // null → el catch-all devuelve 404
 */
export async function resolveSlug(
  slug: string,
  locale: string,
): Promise<ResolvedContent | null>

type ResolvedContent =
  | { type: 'page'; data: Page }
  | { type: 'accommodation'; data: Accommodation }
  | { type: 'entity'; data: Entity }
  | { type: 'article'; data: Article }
```

### static-params.ts

```typescript
/**
 * Genera todas las rutas estáticas de todas las colecciones
 * para generateStaticParams de Next.js.
 * Se usa para pre-renderizar páginas en build time (ISR).
 *
 * @param locale - Código de idioma
 * @returns Array de { slug: string[] } para cada URL del site
 */
export async function getAllSlugs(locale: string)
```

## Ejemplos

### Catch-all route usando resolver

```typescript
// apps/site-demo/src/app/(frontend)/[...slug]/page.tsx
import { resolveSlug } from '@/services'
import { BlockRenderer } from '@hwe-platform/core-ui'

export default async function Page({ params }) {
  const slug = params.slug.join('/')
  const result = await resolveSlug(slug, currentLocale)

  if (!result) notFound()

  switch (result.type) {
    case 'page':
      return (
        <>
          {result.data.hero && <HeroSection hero={result.data.hero} />}
          <BlockRenderer blocks={result.data.blocks} />
        </>
      )
    case 'accommodation':
      return <AccommodationDetail data={result.data} />
    case 'entity':
      return <EntityDetail data={result.data} />
    case 'article':
      return <ArticleDetail data={result.data} />
  }
}
```

### Layout cargando globals una vez

```typescript
// apps/site-demo/src/app/(frontend)/layout.tsx
import { getAllGlobals } from '@/services'
import { SiteLayout } from '@hwe-platform/core-ui'

export default async function Layout({ children }) {
  const { siteConfig, header, footer, banner } = await getAllGlobals(currentLocale)

  return (
    <SiteLayout
      siteConfig={siteConfig}
      header={header}
      footer={footer}
      banner={banner}
    >
      {children}
    </SiteLayout>
  )
}
```

### Bloque de referencia consultando colección

```typescript
// Dentro del CardGridBlock, cuando source='accommodations'
import { getFeaturedAccommodations } from '@/services'

const accommodations = await getFeaturedAccommodations(locale, block.limit)
```

## Qué NO cubre

- Mutaciones (crear/editar contenido) — eso es Payload admin, no el frontend
- Autenticación de usuarios visitantes — no hay login en el frontend público
- Queries específicas de un cliente — el cliente las añade en su propio repo
  extendiendo esta capa sin sobreescribirla
- Cache y revalidación — se gestiona con `revalidateTag` en los hooks de Payload,
  no en la capa de servicios

## Notas de implementación

- Usar `getPayloadClient()` centralizado, no importar config en cada archivo
- Siempre pasar `fallbackLocale` en las queries (el idioma principal del site)
- `limit: 1` cuando buscas por slug — no necesitas más
- Los campos de relación (category, comparison) pueden venir como ID o como
  documento poblado según la query. Usar `depth` de Payload para controlar.
- Tests con msw para mockear Payload Local API
