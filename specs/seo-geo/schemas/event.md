---
titulo: Schema Event
capa: 2 (específica)
schema-types: Event
datos-de: entities (type=event), site-config
---

## Cuándo se genera

En la ficha de una entidad de tipo `event`. Solo si tiene `name`
y al menos una fecha.

También puede generarse como array en una página de tipo listing
que muestre eventos (agenda).

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"Event"` |
| `name` | Obligatorio | `entity.name` | Localizado |
| `description` | Recomendado | `entity.shortDescription` o `description` | Localizado |
| `url` | Recomendado | URL de la ficha si `hasOwnPage: true` | |
| `image` | Recomendado | `entity.image` | URL |
| `startDate` | Obligatorio | Del schedule o campo de fecha | ISO 8601 |
| `endDate` | Opcional | Si existe | ISO 8601 |
| `location` | Recomendado | — | Place con el nombre del camping |
| `organizer` | Opcional | — | Referencia a la Organization |
| `eventStatus` | Opcional | — | `EventScheduled` por defecto si hay fecha futura |

## Ejemplo — evento individual

```json
{
  "@type": "Event",
  "name": "Soirée Moules-Frites",
  "description": "Grande soirée moules-frites sur la terrasse du restaurant. Animation musicale.",
  "url": "https://camping-lacivelle.com/soiree-moules-frites",
  "image": "https://camping-lacivelle.com/media/soiree-moules.jpg",
  "startDate": "2026-07-15T19:30:00+02:00",
  "endDate": "2026-07-15T23:00:00+02:00",
  "location": {
    "@type": "Place",
    "name": "Camping La Civelle",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Capbreton",
      "addressCountry": "FR"
    }
  },
  "organizer": {
    "@id": "https://camping-lacivelle.com/#organization"
  },
  "eventStatus": "https://schema.org/EventScheduled"
}
```

## Ejemplo — agenda (array en página listing)

```json
[
  {
    "@type": "Event",
    "name": "Soirée Moules-Frites",
    "startDate": "2026-07-15T19:30:00+02:00",
    "location": { "@type": "Place", "name": "Camping La Civelle" }
  },
  {
    "@type": "Event",
    "name": "Tournoi de Pétanque",
    "startDate": "2026-07-18T14:00:00+02:00",
    "location": { "@type": "Place", "name": "Camping La Civelle" }
  }
]
```

## Campos condicionales

- Sin `startDate` no hay schema Event — es obligatorio para Google
- `endDate` solo si existe — un evento de un día puede no tenerlo
- `eventStatus` solo para eventos futuros — los pasados no lo necesitan
- `offers` se añade si el evento es de pago (no implementado aún)
- No generar Event para entidades tipo event que no tengan fecha
