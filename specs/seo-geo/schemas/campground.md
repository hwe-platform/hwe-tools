---
titulo: Schema Campground / Hotel (Home)
capa: 2 (específica)
schema-types: Campground, Hotel, Resort, BedAndBreakfast
datos-de: site-config, accommodations (resumen), entities (resumen)
---

## Cuándo se genera

Solo en la home. Es el schema principal del negocio — el más completo
y el más importante para posicionamiento.

El `@type` viene de `site-config.general.businessType`:

| businessType | @type |
|-------------|-------|
| campground | Campground |
| hotel | Hotel |
| resort | Resort |
| guesthouse | BedAndBreakfast |

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | `site-config.general.businessType` | Mapeado a schema.org type |
| `@id` | Obligatorio | site URL + `/#campground` | Referencia interna |
| `name` | Obligatorio | `site-config.general.siteName` | |
| `description` | Obligatorio | `site-config.general.siteDescription` | Localizado |
| `url` | Obligatorio | URL de la home | |
| `image` | Recomendado | Imagen del hero de la home | Array de URLs |
| `logo` | Recomendado | `site-config.general.logo` | URL |
| `address` | Obligatorio | `site-config.contact.*` | PostalAddress completo |
| `geo` | Recomendado | `site-config.location.latitude/longitude` | GeoCoordinates |
| `telephone` | Recomendado | `site-config.contact.phone` | Si existe |
| `email` | Recomendado | `site-config.contact.email` | Si existe |
| `starRating` | Opcional | `site-config.general.stars` | Si existe |
| `openingHoursSpecification` | Recomendado | `site-config.general.openingDates` | Si existe, parsear a fechas |
| `petsAllowed` | Opcional | — | true si algún alojamiento es petFriendly |
| `amenityFeature` | Recomendado | entities tipo service con featured=true | Array de LocationFeatureSpecification |
| `containsPlace` | Recomendado | accommodations con featured=true | Array resumido (nombre + URL + tipo) |
| `sameAs` | Opcional | `site-config.social.*` | URLs que existan |
| `contactPoint` | Opcional | `site-config.contact.*` + `site-config.languages.available` | Si existe teléfono |
| `paymentAccepted` | Opcional | `site-config.payments` | Si existen |
| `aggregateRating` | Opcional | — | Solo si hay reseñas con nota media |

## Ejemplo — Campground

```json
{
  "@type": "Campground",
  "@id": "https://camping-lacivelle.com/#campground",
  "name": "Camping La Civelle",
  "description": "Camping 3 étoiles à Capbreton, au cœur des Landes. Piscine chauffée, restaurant, accès direct à la plage.",
  "url": "https://camping-lacivelle.com",
  "image": ["https://camping-lacivelle.com/media/hero-home.jpg"],
  "logo": "https://camping-lacivelle.com/media/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Route de la Plage",
    "addressLocality": "Capbreton",
    "postalCode": "40130",
    "addressRegion": "Landes",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.6507,
    "longitude": -1.4285
  },
  "telephone": "+33 5 58 72 12 34",
  "email": "contact@camping-lacivelle.com",
  "starRating": {
    "@type": "Rating",
    "ratingValue": "3"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "validFrom": "2026-04-01",
    "validThrough": "2026-09-30"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Piscine chauffée", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Restaurant", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true }
  ],
  "containsPlace": [
    {
      "@type": "Accommodation",
      "name": "Mobile Home Confort 3 chambres",
      "url": "https://camping-lacivelle.com/mobile-home-confort"
    },
    {
      "@type": "CampingPitch",
      "name": "Emplacement Cyclo Rando",
      "url": "https://camping-lacivelle.com/emplacement-cyclo-rando"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+33 5 58 72 12 34",
    "contactType": "reservations",
    "availableLanguage": ["fr", "en", "es"]
  },
  "sameAs": [
    "https://facebook.com/campinglacivelle",
    "https://instagram.com/camping_lacivelle"
  ]
}
```

## Campos condicionales

- `starRating` solo si `site-config.general.stars` tiene valor
- `openingHoursSpecification` solo si `openingDates` es parseable a fechas (no texto libre)
- `amenityFeature` solo con entities tipo service que tengan featured=true
- `containsPlace` solo con accommodations que tengan featured=true
- `aggregateRating` solo si el site tiene reseñas con sistema de nota
- `petsAllowed` solo si hay datos para responder (no asumir false)
- `paymentAccepted` solo si `site-config.payments` tiene valores
