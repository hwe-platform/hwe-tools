---
titulo: Schema Accommodation / CampingPitch (Ficha)
capa: 2 (específica)
schema-types: Accommodation, CampingPitch
datos-de: accommodations, site-config
---

## Cuándo se genera

En la ficha individual de un alojamiento. El `@type` depende del tipo
de alojamiento en Payload:

| accommodations.type | @type |
|--------------------|-------|
| emplacement | CampingPitch |
| mobilhome | Accommodation |
| cottage | Accommodation |
| chalet | Accommodation |
| tente | Accommodation |

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | `accommodations.type` | Mapeado arriba |
| `name` | Obligatorio | `accommodations.name` | Localizado |
| `description` | Obligatorio | `accommodations.shortDescription` o `description` | Localizado |
| `url` | Obligatorio | URL de la ficha | |
| `image` | Recomendado | `accommodations.media.gallery` | Array de URLs |
| `occupancy` | Recomendado | `accommodations.specs.capacity` | Si existe |
| `numberOfRooms` | Recomendado | `accommodations.specs.bedrooms` | Si existe |
| `floorSize` | Recomendado | `accommodations.specs.surface` | Si existe, en m² |
| `petsAllowed` | Opcional | `accommodations.specs.petFriendly` | Solo si el campo está definido |
| `amenityFeature` | Opcional | `accommodations.equipment` donde included=true | Array |
| `offers` | Opcional | `accommodations.pricing` | Solo si tiene precio |
| `containedInPlace` | Recomendado | — | Referencia al Campground de la home |
| `accommodationCategory` | Opcional | `accommodations.subtype` | Si existe |

## Ejemplo — Mobil-home

```json
{
  "@type": "Accommodation",
  "name": "Mobile Home Confort 3 chambres",
  "description": "Mobil-home tout confort avec 3 chambres, terrasse couverte et vue forêt.",
  "url": "https://camping-lacivelle.com/mobile-home-confort",
  "image": [
    "https://camping-lacivelle.com/media/mh-confort-1.jpg",
    "https://camping-lacivelle.com/media/mh-confort-2.jpg"
  ],
  "occupancy": {
    "@type": "QuantitativeValue",
    "value": 6
  },
  "numberOfRooms": 3,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": 35,
    "unitCode": "MTK"
  },
  "petsAllowed": false,
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Cuisine équipée", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Climatisation", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terrasse couverte", "value": true }
  ],
  "offers": {
    "@type": "Offer",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": 65,
      "priceCurrency": "EUR",
      "unitText": "nuit"
    }
  },
  "containedInPlace": {
    "@id": "https://camping-lacivelle.com/#campground"
  }
}
```

## Ejemplo — Emplacement (CampingPitch)

```json
{
  "@type": "CampingPitch",
  "name": "Emplacement Cyclo Rando",
  "description": "Emplacement nature pour tentes et petits campeurs, idéal pour randonneurs et cyclistes.",
  "url": "https://camping-lacivelle.com/emplacement-cyclo-rando",
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": 80,
    "unitCode": "MTK"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Électricité", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Point d'eau", "value": true }
  ],
  "containedInPlace": {
    "@id": "https://camping-lacivelle.com/#campground"
  }
}
```

## Campos condicionales

- `offers` solo si `pricing.from` tiene valor numérico — no inventar precio
- `occupancy` solo si `specs.capacity` existe — un emplacement puede no tenerlo
- `numberOfRooms` solo para mobil-homes/cottages — no tiene sentido en emplacements
- `petsAllowed` solo si el campo está explícitamente definido — no asumir false
- `amenityFeature` solo con equipment donde `included === true`
- `accommodationCategory` solo si `subtype` tiene valor (ej: "Premium", "Confort")
