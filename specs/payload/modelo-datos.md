# Spec Payload CMS — Modelo de datos HWE

**Fecha:** 2026-09-02
**Base:** Análisis del Figma Make de Camping La Civelle
**Estado:** Definido — pendiente de implementar (Hito 1)

---

## Resumen

6 colecciones + 4 globals. Cada cliente tiene su propia instancia de Payload
con su propia base de datos (DEC-003).

| Tipo | Nombre | Propósito |
|------|--------|-----------|
| Collection | `media` | Imágenes, vídeos, documentos |
| Collection | `accommodations` | Alojamientos (emplacements, mobil-homes, cottages) |
| Collection | `entities` | Servicios, actividades, restaurante, entorno, eventos |
| Collection | `pages` | Páginas con page builder (bloques) |
| Collection | `articles` | Blog / actualités |
| Collection | `categories` | Categorías para agrupar entidades y alojamientos |
| Global | `site-config` | Configuración general del site |
| Global | `header` | TopBar + navegación principal |
| Global | `footer` | Columnas de contenido, partners, newsletter, virtual assistant |
| Global | `banner` | Avisos globales |

Zod es fuente de verdad (DEC-004). Los schemas Zod se definen primero
y Payload deriva de ellos.

---

## Colecciones

### media

Gestión de archivos. Payload maneja upload, almacenamiento y generación
de tamaños automáticamente.

```
media
├── filename                (auto)
├── alt                     (text, localized, obligatorio)
├── caption                 (text, localized, opcional)
├── mimeType                (auto)
├── filesize                (auto)
├── width / height          (auto para imágenes)
└── sizes
    ├── thumbnail           (400px)
    ├── card                (800px)
    ├── hero                (1920px)
    └── og                  (1200x630px)
```

### accommodations

Alojamientos del cliente. Alimenta tarjetas en la home, fichas completas,
y conexión con el motor de reservas.

```
accommodations
├── name                    (text, localized — "Mobile Home Confort 3 chambres")
├── slug                    (text, localized — auto desde name)
├── type                    (select: emplacement, mobilhome, cottage, chalet, tente)
├── subtype                 (text, localized, opcional — "Cyclo Rando", "Premium")
├── shortDescription        (text, localized — para tarjetas)
├── description             (richText, localized — para ficha completa)
│
├── specs
│   ├── capacity            (number — 6)
│   ├── bedrooms            (number — 3)
│   ├── surface             (number — en m²)
│   ├── hasAC               (boolean)
│   └── petFriendly         (boolean)
│
├── bedroomDetails          (array)
│   └── description         (text, localized — "Chambre 1 : lit double 140×190 cm")
│
├── equipment               (array)
│   ├── label               (text, localized — "Cuisine équipée")
│   ├── icon                (select — coffee, utensils, bed, wifi, tv, etc.)
│   └── included            (boolean)
│
├── pricing
│   ├── from                (number, opcional — "à partir de")
│   ├── currency            (select — EUR por defecto)
│   └── priceNote           (text, localized, opcional — "par nuit", "par semaine")
│
├── media
│   ├── mainImage           (upload — media)
│   ├── gallery             (array de upload — media)
│   ├── floorPlan           (upload — media, opcional)
│   └── video               (text, opcional — URL)
│
├── documents               (array, opcional)
│   ├── label               (text, localized — "Fiche technique")
│   └── file                (upload — media)
│
├── features                (array, opcional — highlights)
│   ├── icon                (select)
│   └── label               (text, localized — "Vue forêt")
│
├── comparison              (array de relationship → accommodations, opcional —
│                            si vacío, el frontend muestra automáticamente
│                            otros alojamientos de la misma categoría)
│
├── category                (relationship — categories)
├── featured                (boolean)
├── order                   (number)
│
├── booking
│   ├── externalId          (text, opcional — ID en el motor de reservas)
│   └── bookable            (boolean)
│
├── personalization         (array, opcional)
│   ├── segment             (select — configurables por cliente)
│   ├── image               (upload — media)
│   └── gallery             (array media, opcional)
│
└── blocks                  (blocks field — secciones custom adicionales para la ficha)
```

### entities

Colección genérica para todo lo que no es alojamiento ni página.
Todos comparten base común, campos específicos son opcionales según tipo.

```
entities
├── type                    (select: service, activity, restaurant,
│                            environment, event, custom)
├── name                    (text, localized — "Restaurant", "Épicerie")
├── slug                    (text, localized — auto desde name)
├── shortDescription        (text, localized — para tarjetas)
├── description             (richText, localized — para página propia)
├── icon                    (select — utensils, bike, waves, shopping-bag, etc.)
├── image                   (upload — media)
├── gallery                 (array de upload — media, opcional)
├── tag                     (text, localized, opcional — "Village & port", "Sur place")
├── featured                (boolean)
├── order                   (number)
│
├── schedule                (group, opcional)
│   ├── periods             (array)
│   │   ├── label           (text, localized — "Déjeuner", "Dîner")
│   │   ├── icon            (select — utensils, wine, clock)
│   │   └── hours           (text, localized — "12h00 · 14h30")
│   └── note                (text, localized — "Ouvert juillet & août")
│
├── features                (array, opcional)
│   ├── icon                (select)
│   ├── label               (text, localized — "Eau chauffée")
│   └── detail              (text, localized — "26 °C")
│
├── ctas                    (array, opcional)
│   ├── label               (text, localized — "Voir la carte")
│   ├── url                 (text)
│   └── variant             (select: primary, outline)
│
├── hasOwnPage              (boolean)
├── category                (relationship — categories, opcional)
│
└── personalization         (array, opcional)
    ├── segment             (select)
    ├── image               (upload — media)
    └── gallery             (array media, opcional)
```

### pages

Páginas con page builder. El editor monta la secuencia de bloques
en el orden que quiera.

```
pages
├── title                   (text, localized — "Accueil", "Le Camping")
├── slug                    (text, localized — auto desde title)
├── type                    (select: home, landing, static, listing, contact, faq)
├── parent                  (relationship — pages, opcional — para breadcrumbs)
│
├── hero                    (group, opcional)
│   ├── variant             (select: video, image, minimal, none)
│   ├── media               (upload — media)
│   ├── title               (text, localized, opcional — override)
│   ├── subtitle            (text, localized, opcional)
│   └── showBreadcrumbs     (boolean)
│
├── blocks                  (blocks field — secuencia de bloques)
│   ├── mediaText           — imagen + texto en dos columnas
│   ├── iconGrid            — grid de iconos con labels
│   ├── cardGrid            — grid de tarjetas con imagen
│   ├── reviewsGrid         — tarjetas de reseñas
│   ├── servicesGrid        — referencia entities tipo service
│   ├── accommodationsGrid  — referencia accommodations
│   ├── environmentGrid     — referencia entities tipo environment
│   ├── gallery             — galería de imágenes / carrusel
│   ├── map                 — mapa + info acceso (lee site-config)
│   ├── instagram           — feed instagram
│   ├── blog                — referencia articles
│   ├── cta                 — call to action
│   ├── faq                 — preguntas y respuestas
│   ├── richText            — texto libre
│   └── embed               — código HTML/iframe
│
├── seo                     (group)
│   ├── metaTitle           (text, localized)
│   ├── metaDescription     (text, localized)
│   ├── ogImage             (upload — media)
│   ├── noIndex             (boolean)
│   └── canonicalUrl        (text, opcional)
│
└── personalization         (array, opcional)
    ├── segment             (select)
    ├── image               (upload — media — hero alternativo)
    └── gallery             (array media, opcional)
```

#### Bloques de referencia

Los bloques que muestran contenido de colecciones no duplican datos.
Configuran una query:

```
blog (bloque dentro de pages.blocks)
├── title                   (text, localized — "Actualités")
├── subtitle                (text, localized, opcional)
├── source                  (select: latest, featured, byCategory)
├── category                (text, opcional — si source=byCategory)
├── limit                   (number — cuántos mostrar)
├── showMoreLink            (boolean)
└── showMoreUrl             (text — slug de la página de blog)
```

Mismo patrón para `accommodationsGrid`, `servicesGrid`, `environmentGrid`:
configuran qué mostrar, el frontend consulta la colección correspondiente.

### articles

Blog / actualités. Colección propia porque tiene un ciclo de vida
diferente (fecha, autor) y el editor necesita acceso directo.

```
articles
├── title                   (text, localized)
├── slug                    (text, localized — auto desde title)
├── excerpt                 (text, localized — resumen para tarjetas)
├── content                 (richText, localized — cuerpo del artículo)
├── image                   (upload — media)
├── category                (text, localized — "Camping", "Tourisme")
├── publishedAt             (date)
├── author                  (text, opcional)
├── featured                (boolean)
└── seo                     (group)
    ├── metaTitle           (text, localized)
    ├── metaDescription     (text, localized)
    └── ogImage             (upload — media)
```

### categories

Categorías para agrupar entidades y alojamientos.

```
categories
├── name                    (text, localized — "Emplacements", "Locations")
├── slug                    (text, localized)
├── description             (text, localized, opcional)
└── order                   (number)
```

---

## Globals

### site-config

Configuración general del site. No cambia por página.

```
site-config
├── general
│   ├── siteName            (text — "Camping La Civelle")
│   ├── siteDescription     (text, localized — meta description por defecto)
│   ├── logo                (upload — media)
│   ├── logoInverted        (upload — media — versión para fondos oscuros)
│   ├── stars               (number, opcional — clasificación)
│   └── openingDates        (text, localized — "1er avril au 30 septembre")
│
├── contact
│   ├── address             (text)
│   ├── postalCode          (text)
│   ├── city                (text)
│   ├── country             (text)
│   ├── phone               (text)
│   └── email               (text)
│
├── location
│   ├── latitude            (number)
│   ├── longitude           (number)
│   └── transport           (array)
│       ├── icon            (select: car, train, plane)
│       └── label           (text, localized)
│
├── languages
│   ├── available           (array de codes — ["fr", "en", "es", "de"])
│   ├── default             (select — "fr")
│   ├── prefixDefault       (boolean — si el idioma principal lleva prefijo en URL)
│   ├── strategy            (select: prefix, domain)
│   └── domainMap           (array, si strategy=domain)
│       ├── locale          (text — "en")
│       └── domain          (text — "dominio.uk")
│
├── social
│   ├── instagram           (text, opcional)
│   ├── facebook            (text, opcional)
│   ├── youtube             (text, opcional)
│   ├── linkedin            (text, opcional)
│   ├── tiktok              (text, opcional)
│   └── instagramHandle     (text, opcional — "@camping_lacivelle")
│
├── payments                (array de text — ["CB", "Visa", "Mastercard", ...])
│
├── legal
│   └── links               (array)
│       ├── label           (text — "CGV", "RGPD")
│       └── url             (text)
│
├── tracking
│   ├── gtmId               (text, opcional)
│   ├── gaId                (text, opcional)
│   └── metaPixelId         (text, opcional)
│
├── customCode              (array)
│   ├── label               (text — "Cookiebot", "GuestSuite")
│   ├── code                (textarea — snippet tal cual)
│   ├── position            (select: head, bodyStart, bodyEnd)
│   └── requiresConsent     (boolean)
│
└── booking
    ├── engine              (select: thr, witbooking, mastercamping, resalys)
    └── ... (campos específicos según engine)
```

### header

Barra superior y navegación principal.

```
header
├── topBar
│   ├── links               (array)
│   │   ├── label           (text, localized — "Aide", "Contact")
│   │   ├── icon            (select: help, phone, video, user, custom)
│   │   └── url             (text)
│   ├── showLogin           (boolean)
│   └── bookingButtonLabel  (text, localized — "Réserver")
│
└── navigation              (array)
    ├── label               (text, localized — "Le Camping", "Nos Locations")
    ├── url                 (text)
    └── children            (array, opcional)
        ├── label           (text, localized)
        └── url             (text)
```

### footer

Contenido del footer. Redes sociales, pagos y links legales se leen
de `site-config` — no se duplican aquí.

```
footer
├── virtualAssistant
│   ├── enabled             (boolean)
│   ├── title               (text, localized — "Votre assistant virtuel")
│   ├── subtitle            (text, localized)
│   └── placeholder         (text, localized)
│
├── columns                 (array, max 4)
│   ├── title               (text, localized)
│   ├── type                (select: links, text, schedule, newsletter)
│   ├── links               (array, si type=links)
│   │   ├── label           (text, localized)
│   │   └── url             (text)
│   ├── content             (richText, si type=text)
│   └── newsletter          (group, si type=newsletter)
│       ├── description     (text, localized)
│       ├── buttonLabel     (text, localized)
│       ├── provider        (select: mailchimp, sendinblue, custom)
│       └── actionUrl       (text)
│
├── partners                (array)
│   ├── name                (text)
│   ├── logo                (upload — media)
│   └── url                 (text, opcional)
│
└── copyright               (text, localized)
```

### banner

Avisos globales.

```
banner
├── enabled                 (boolean)
├── message                 (text, localized)
├── type                    (select: info, warning, promo)
├── dismissible             (boolean)
└── url                     (text, opcional)
```

---

## Relaciones entre colecciones

```
pages.blocks —referencia→ accommodations (accommodationsGrid)
pages.blocks —referencia→ entities (servicesGrid, environmentGrid)
pages.blocks —referencia→ articles (blog)
accommodations → media (mainImage, gallery, floorPlan, documents)
accommodations → categories
accommodations → accommodations (comparison)
entities → media (image, gallery)
entities → categories
articles → media (image)
header.navigation → slugs de pages y entities
footer.partners → media (logos)
site-config → media (logo, logoInverted)
```

---

## Notas de implementación

- **Zod primero:** definir schemas Zod para cada colección y global
  antes de crear los configs de Payload (DEC-004)
- **Localización:** todo campo marcado como `localized` usa la localización
  nativa de Payload, campo por campo
- **Slugs:** se generan automáticamente desde el título, traducidos por idioma,
  editables manualmente (DEC-009)
- **Personalización:** los arrays de `personalization` existen en el modelo
  pero se dejan vacíos hasta el Hito 3
- **Bloques detallados:** cada bloque del `blocks field` de pages tendrá
  su propia spec cuando se construya desde el Figma
- **Access control:** se define cuando se aborde el estándar de seguridad
  (roles: super-admin, agency, client)
- **Organización de schemas:** `schemas/collections/` para colecciones,
  `schemas/globals/` para globals, `schemas/common.schema.ts` para piezas
  compartidas. Tipos co-localizados con su schema. Index.ts en cada carpeta.
