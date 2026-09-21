---
titulo: Schemas JSON-LD
fecha: 2026-09-21
estado: definido
dominio: seo-geo
hito: 1
relacionado:
  - docs/estandares/seo.md
  - specs/payload/modelo-datos.md
  - specs/payload/servicios.md
---

## Contexto

Los schemas JSON-LD dicen a Google y a los crawlers de IA (ChatGPT,
Perplexity, Gemini) qué es cada página: un camping, un alojamiento,
un restaurante, un artículo. Sin ellos, el buscador adivina. Con ellos,
entiende.

Son la pieza clave de SEO técnico y de GEO (Generative Engine Optimization).

## Tres principios

### 1. Solo datos reales

El JSON-LD se genera dinámicamente desde Payload. Si un campo no tiene
valor, no aparece en el schema. Nunca un placeholder, nunca un valor
inventado, nunca un campo vacío. Google prefiere no tener un campo
a tener un campo falso.

### 2. Mínimo viable por tipo

Cada campo tiene un nivel:
- **Obligatorio** — sin él Google ignora el schema. Si no existe en
  Payload, no generes el schema de ese tipo.
- **Recomendado** — Google lo valora. Inclúyelo si existe.
- **Opcional** — mejora menor, solo si el dato está.

### 3. Dinámico, no estático

Los schemas son funciones TypeScript que reciben datos de Payload y
devuelven JSON-LD. Si el editor cambia un dato, el schema cambia en
el siguiente render. No son archivos JSON que alguien rellena.

```
Payload (datos reales) → Servicio (función pura) → JSON-LD (dinámico)
```

## Arquitectura de tres capas

### Capa 1 — Siempre presente (layout)

Todas las páginas sin excepción:
- [WebSite + Organization](base-website.md) — el site y quién está detrás
- [BreadcrumbList](breadcrumbs.md) — dónde estás (excepto home)

### Capa 2 — Específica por tipo de página

Solo si el tipo de página la tiene:

| Tipo de página | Schema | Spec |
|----------------|--------|------|
| Home | Campground / Hotel / Resort | [campground.md](campground.md) |
| Ficha alojamiento | Accommodation / CampingPitch | [accommodation.md](accommodation.md) |
| Listado alojamientos | Campground + containsPlace | [accommodation-listing.md](accommodation-listing.md) |
| Ficha restaurante | Restaurant | [restaurant.md](restaurant.md) |
| Evento | Event | [event.md](event.md) |
| Artículo blog | BlogPosting | [article.md](article.md) |
| FAQ | FAQPage | [faq.md](faq.md) |
| Entorno | TouristAttraction | [environment.md](environment.md) |

### Capa 3 — Genérica (fallback)

Cualquier página sin schema específico:
- [WebPage](web-page.md) — schema mínimo con título, descripción, URL

Ninguna página sale sin JSON-LD.

## Tipo de negocio dinámico

El tipo raíz del schema principal (Campground, Hotel, Resort, BedAndBreakfast)
se configura en `site-config.general.businessType`. La función base lo lee
y usa el tipo correspondiente. Esto afecta a la home y a las páginas que
referencian el negocio principal.

## Implementación

Las funciones viven en `apps/site-demo/src/services/json-ld/`:

```
services/json-ld/
├── index.ts
├── base.ts               → buildWebSiteSchema, buildOrganizationSchema
├── breadcrumbs.ts         → buildBreadcrumbSchema
├── campground.ts          → buildCampgroundSchema (home)
├── accommodation.ts       → buildAccommodationSchema (ficha)
├── accommodation-listing.ts
├── restaurant.ts          → buildRestaurantSchema
├── event.ts               → buildEventSchema
├── article.ts             → buildArticleSchema
├── faq.ts                 → buildFAQSchema
├── environment.ts         → buildEnvironmentSchema
├── web-page.ts            → buildWebPageSchema (fallback)
├── page-resolver.ts       → buildPageJsonLd (orquestador)
└── utils.ts               → helpers compartidos
```

`page-resolver.ts` decide qué schemas se generan según el tipo de contenido
resuelto por `services/resolver.ts`.

## Schemas nuevos

Se añaden cuando surjan: spa, sala de conferencias, tienda, barbacoa.
Se crea la función, se añade al resolver, funciona. No hay que prever
todos los casos ahora.
