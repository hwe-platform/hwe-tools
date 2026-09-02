# Páginas y routing

Cómo funcionan las URLs, la resolución de páginas, el multilingüe
y la generación estática en HWE.

---

## Principio

Una sola ruta dinámica catch-all en Next.js resuelve todas las páginas (DEC-009).
Las URLs son datos en Payload, completamente libres.

```
src/app/[...slug]/page.tsx    — catch-all, resuelve cualquier URL
src/app/page.tsx              — home (caso especial, sin slug)
```

No hay carpetas de páginas en Next.js por cada sección del site.
Toda URL se resuelve consultando Payload.

---

## Flujo de resolución

Cuando un visitante entra a una URL (ej: `/le-camping`):

```
1. Next.js recibe la petición con slug ['le-camping']
2. Middleware detecta el idioma (por prefijo URL o por dominio)
3. Server Component busca en Payload via Local API:
   a. ¿Hay una page con ese slug en ese idioma?    → template de página
   b. ¿Hay un accommodation con ese slug?           → template de ficha alojamiento
   c. ¿Hay una entity con ese slug?                  → template de ficha entidad
   d. ¿Hay un article con ese slug?                  → template de artículo
4. Si encuentra → renderiza con el template correspondiente
5. Si no encuentra → 404
```

### Templates de renderizado

Cada colección tiene su propio template:

| Colección | Template | Qué renderiza |
|-----------|----------|---------------|
| `pages` | Page template | Hero + BlockRenderer con la secuencia de bloques |
| `accommodations` | Accommodation template | Galería, specs, equipamiento, booking, comparison |
| `entities` | Entity template | Imagen, descripción, horarios, features, CTAs |
| `articles` | Article template | Imagen, contenido richText, categoría, fecha |

### Orden de búsqueda

La búsqueda es secuencial por colección. Para el volumen de HWE
(un camping tiene 20-50 páginas máximo), esto es suficiente.
Payload Local API accede directo a la BD sin HTTP.

Si en el futuro el rendimiento es un problema, se puede añadir
una tabla de lookup `slug → colección + id` sin cambiar la arquitectura.

---

## Estructura de URLs

Las URLs son campos de texto libre en Payload. No hay estructura
forzada por código. La profundidad de segmentos es configurable:

```
/mobile-home-confort                                — 1 segmento
/locations/mobile-home-confort                       — 2 segmentos
/hebergements/locations/mobile-home-confort           — 3 segmentos
```

Lo único que importa es que el slug completo sea único dentro
del mismo idioma.

La recomendación SEO es mantener las URLs cortas (1-2 segmentos),
pero el sistema no impone un límite.

### Slugs automáticos

Los slugs se generan automáticamente desde el título del contenido
en Payload (hook `beforeChange`). El editor puede ajustarlos
manualmente si quiere.

---

## Multilingüe

### Contenido localizado

Todo campo marcado como `localized` en Payload tiene un valor
por idioma. El editor cambia de idioma en Payload admin y
ve/edita la versión de ese idioma.

Campos localizados: títulos, slugs, descripciones, contenido
de bloques, labels de navegación, textos del footer, banner.

### Slugs traducidos

Cada idioma tiene su propia URL:

```
FR: /le-camping
EN: /the-campsite
ES: /el-camping
DE: /der-campingplatz
```

### Dos estrategias de idioma

Configurable en `site-config.languages.strategy`:

#### Estrategia `prefix` (por defecto)

El idioma se indica en el prefijo de la URL:

```
dominio.com/               — idioma principal (si prefixDefault=false)
dominio.com/fr/             — idioma principal (si prefixDefault=true)
dominio.com/en/the-campsite — inglés
dominio.com/es/el-camping   — español
```

`prefixDefault` controla si el idioma principal lleva prefijo o no.
El cliente lo decide según su estrategia SEO.

#### Estrategia `domain` (multi-dominio)

Cada idioma tiene su propio dominio:

```
dominio.com/le-camping      — francés
dominio.uk/the-campsite      — inglés
dominio.es/el-camping        — español
```

No hay prefijos de idioma porque el dominio ya lo indica.
La detección de idioma se hace en el middleware de Next.js
por hostname.

Vercel permite configurar múltiples dominios custom en un mismo
proyecto. El contenido y la base de datos son los mismos —
solo cambia el punto de entrada.

Los `hreflang` tags de SEO apuntan entre dominios:

```html
<link rel="alternate" hreflang="fr" href="https://dominio.com/le-camping" />
<link rel="alternate" hreflang="en" href="https://dominio.uk/the-campsite" />
```

### Configuración en site-config

```
languages
├── available           (array — ["fr", "en", "es", "de"])
├── default             (select — "fr")
├── prefixDefault       (boolean — si el principal lleva prefijo)
├── strategy            (select: prefix, domain)
└── domainMap           (array, si strategy=domain)
    ├── locale          (text — "en")
    └── domain          (text — "dominio.uk")
```

El Hito 1 implementa solo la estrategia `prefix`. La estrategia
`domain` se implementa cuando un cliente la necesite — es
configuración de middleware y Vercel, no cambio de arquitectura.

---

## Breadcrumbs

### Para páginas

Se construyen desde el campo `parent` de `pages`. Si la página
"Mobile Home Confort" tiene como parent "Nos Locations":

```
Accueil → Nos Locations → Mobile Home Confort
```

### Para alojamientos y entidades

No tienen campo `parent`. El breadcrumb se construye por convención:
la categoría del contenido es el nivel intermedio.

```
Accueil → Locations → Mobile Home Confort 3ch.
Accueil → Activités & Services → Restaurant
```

### Para artículos

```
Accueil → Actualités → Nouvelle saison 2026
```

El nivel intermedio es el listado de artículos (configurable en
`site-config` o derivado de la página de tipo `listing` que
contiene el bloque blog).

---

## Navegación

### Estructura

La navegación se define en `header.navigation` (global de Payload).
Es un array ordenable de items con hasta 2 niveles:

```
Le Camping                              — link directo
Nos Emplacements                        — dropdown
  ├── Cyclo Rando                       — link
  ├── Confort                           — link
  ├── Camping-car                       — link
  └── Privilège                         — link
Nos Locations                           — dropdown
  ├── Mobile Home Confort 3ch.          — link
  └── Cottage Premium 3ch.              — link
Activités & Services                    — link directo
Restaurant                             — link directo
```

### Ordenación

Los arrays en Payload son ordenables por drag and drop. El editor
reordena los items arrastrando y guarda. El frontend renderiza
en ese orden. Sin código.

Lo mismo aplica para los `children` dentro de un dropdown.

---

## Generación estática (ISR)

### Build time

Next.js puede pre-renderizar todas las páginas en build time
consultando Payload con `generateStaticParams`:

```typescript
export async function generateStaticParams() {
  const pages = await payload.find({ collection: 'pages' })
  const accommodations = await payload.find({ collection: 'accommodations' })
  const entities = await payload.find({ collection: 'entities', where: { hasOwnPage: { equals: true } } })
  const articles = await payload.find({ collection: 'articles' })

  return [
    ...pages.docs.map(p => ({ slug: p.slug.split('/') })),
    ...accommodations.docs.map(a => ({ slug: a.slug.split('/') })),
    ...entities.docs.map(e => ({ slug: e.slug.split('/') })),
    ...articles.docs.map(a => ({ slug: a.slug.split('/') })),
  ]
}
```

### Revalidación

Cuando el contenido cambia en Payload, un hook `afterChange`
revalida la página afectada:

```typescript
hooks: {
  afterChange: [
    ({ doc }) => {
      revalidateTag(`page-${doc.slug}`)
      revalidateTag(`site-global`)
    }
  ],
}
```

El visitante siempre ve la versión cacheada excepto los segundos
que tarda en regenerarse tras un cambio.

---

## Resumen de decisiones

| Decisión | Valor |
|----------|-------|
| Ruta Next.js | Catch-all `[...slug]` único |
| Fuente de URLs | Datos en Payload, libres |
| Resolución | Búsqueda secuencial por colección |
| Profundidad de URL | Sin límite, recomendación 1-2 segmentos |
| Slugs | Auto-generados, traducidos, editables |
| Estrategia idioma | Prefijo URL (default) o multi-dominio |
| Prefijo idioma principal | Configurable por cliente |
| Idiomas | N configurables, sin tope |
| Breadcrumbs | Desde parent (páginas) o categoría (contenido) |
| Caché | ISR con revalidación por hook de Payload |
