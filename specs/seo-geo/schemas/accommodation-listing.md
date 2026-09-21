---
titulo: Schema listado de alojamientos
capa: 2 (específica)
schema-types: Campground/Hotel + containsPlace
datos-de: accommodations (filtradas), site-config
---

## Cuándo se genera

En páginas de tipo listing que muestran un grid o listado de alojamientos.
Ejemplo: "Nos Emplacements", "Nos Locations".

## Estructura

El schema es el Campground/Hotel con `containsPlace` listando los
alojamientos de esa categoría.

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | `site-config.general.businessType` | Mapeado |
| `name` | Obligatorio | Título de la página | Localizado |
| `url` | Obligatorio | URL de la página | |
| `description` | Recomendado | Descripción de la página | Localizado |
| `containsPlace` | Obligatorio | accommodations de la categoría | Array resumido |

Cada item de `containsPlace`:

| Campo | Nivel | Notas |
|-------|-------|-------|
| `@type` | Obligatorio | Accommodation o CampingPitch según type |
| `name` | Obligatorio | Nombre del alojamiento |
| `url` | Obligatorio | URL de la ficha |
| `description` | Recomendado | Descripción corta |
| `image` | Recomendado | mainImage del alojamiento |
| `offers` | Opcional | Solo si tiene precio |

## Ejemplo

```json
{
  "@type": "Campground",
  "name": "Nos Locations",
  "url": "https://camping-lacivelle.com/locations",
  "description": "Découvrez nos mobil-homes et cottages tout confort.",
  "containsPlace": [
    {
      "@type": "Accommodation",
      "name": "Mobile Home Confort 3 chambres",
      "url": "https://camping-lacivelle.com/mobile-home-confort",
      "description": "Mobil-home tout confort avec terrasse couverte.",
      "image": "https://camping-lacivelle.com/media/mh-confort-main.jpg",
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": 65,
          "priceCurrency": "EUR",
          "unitText": "nuit"
        }
      }
    },
    {
      "@type": "Accommodation",
      "name": "Cottage Premium 3 chambres",
      "url": "https://camping-lacivelle.com/cottage-premium",
      "description": "Cottage haut de gamme avec spa privatif.",
      "image": "https://camping-lacivelle.com/media/cottage-main.jpg"
    }
  ]
}
```

## Campos condicionales

- Solo incluye alojamientos que pertenecen a la categoría de esta página
- `offers` solo si el alojamiento tiene `pricing.from`
- `image` solo si tiene `mainImage`
- Si la página no tiene alojamientos asociados, no generar este schema — usar WebPage genérica
