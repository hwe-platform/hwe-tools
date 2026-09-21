---
titulo: Schema Restaurant
capa: 2 (específica)
schema-types: Restaurant
datos-de: entities (type=restaurant), site-config
---

## Cuándo se genera

En la ficha de una entidad de tipo `restaurant`. Solo si tiene
`hasOwnPage: true` y al menos `name` y `description`.

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"Restaurant"` |
| `name` | Obligatorio | `entity.name` | Localizado |
| `description` | Obligatorio | `entity.description` (texto plano del richText) | Localizado |
| `url` | Obligatorio | URL de la ficha | |
| `image` | Recomendado | `entity.image` | URL |
| `address` | Recomendado | `site-config.contact.*` | Misma que el camping |
| `geo` | Recomendado | `site-config.location.*` | Misma que el camping |
| `telephone` | Opcional | `site-config.contact.phone` | Si existe |
| `servesCuisine` | Opcional | `entity.tag` | Si existe (ej: "Cuisine du terroir") |
| `hasMenu` | Opcional | `entity.ctas` donde label contiene "carte" o "menu" | URL del menú |
| `openingHoursSpecification` | Recomendado | `entity.schedule.periods` | Si existe |
| `amenityFeature` | Opcional | `entity.features` | Si existen |
| `containedInPlace` | Recomendado | — | Referencia al Campground |

## Ejemplo

```json
{
  "@type": "Restaurant",
  "name": "Le Restaurant du Camping",
  "description": "Cuisine du terroir landais avec produits frais et locaux. Terrasse ombragée avec vue sur la piscine.",
  "url": "https://camping-lacivelle.com/restaurant",
  "image": "https://camping-lacivelle.com/media/restaurant-terrasse.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Route de la Plage",
    "addressLocality": "Capbreton",
    "postalCode": "40130",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 43.6507,
    "longitude": -1.4285
  },
  "servesCuisine": "Cuisine du terroir",
  "hasMenu": "https://camping-lacivelle.com/restaurant/carte",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "12:00",
      "closes": "14:30",
      "validFrom": "2026-07-01",
      "validThrough": "2026-08-31"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "19:00",
      "closes": "22:00",
      "validFrom": "2026-07-01",
      "validThrough": "2026-08-31"
    }
  ],
  "containedInPlace": {
    "@id": "https://camping-lacivelle.com/#campground"
  }
}
```

## Campos condicionales

- `openingHoursSpecification` solo si `schedule.periods` existe y es parseable. Si los horarios son texto libre ("Ouvert en juillet-août"), no forzar el formato — omitir el campo
- `hasMenu` solo si hay un CTA con URL que apunte al menú
- `servesCuisine` solo si `entity.tag` tiene un valor descriptivo de cocina
- No inventar `priceRange` — solo si el dato existe
