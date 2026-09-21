---
titulo: Schema TouristAttraction (Entorno)
capa: 2 (específica)
schema-types: TouristAttraction
datos-de: entities (type=environment), site-config
---

## Cuándo se genera

En la ficha de una entidad de tipo `environment`, o como array en
una página que muestre atracciones del entorno. Solo si tiene
`name` y `description`.

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | `"TouristAttraction"` |
| `name` | Obligatorio | `entity.name` | Localizado |
| `description` | Obligatorio | `entity.shortDescription` o `description` | Localizado |
| `url` | Recomendado | URL de la ficha si `hasOwnPage: true` | |
| `image` | Recomendado | `entity.image` | URL |
| `geo` | Opcional | Coordenadas de la atracción | Si se conocen |
| `touristType` | Opcional | `entity.tag` | Si existe (ej: "Surf", "Gastronomie") |
| `isAccessibleForFree` | Opcional | — | Solo si el dato existe |
| `containedInPlace` | Recomendado | — | Referencia al municipio o región |

## Ejemplo — ficha individual

```json
{
  "@type": "TouristAttraction",
  "name": "Capbreton — Village & Port",
  "description": "Port de pêche et de plaisance au cœur des Landes. Restaurants, marchés et ambiance authentique du sud-ouest.",
  "url": "https://camping-lacivelle.com/capbreton",
  "image": "https://camping-lacivelle.com/media/capbreton-port.jpg",
  "touristType": "Village & port"
}
```

## Ejemplo — array en página de entorno

Cuando la página muestra varios destinos:

```json
{
  "@type": "ItemList",
  "name": "Aux alentours du camping",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "TouristAttraction",
        "name": "Capbreton",
        "description": "Port de pêche et de plaisance.",
        "image": "https://camping-lacivelle.com/media/capbreton.jpg",
        "url": "https://camping-lacivelle.com/capbreton"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "TouristAttraction",
        "name": "Surf & Plages",
        "description": "Spots de surf réputés sur la côte landaise.",
        "image": "https://camping-lacivelle.com/media/surf.jpg"
      }
    }
  ]
}
```

## Campos condicionales

- Sin `name` y `description` no generar el schema
- `url` solo si `hasOwnPage: true` — si no tiene ficha propia, no tiene URL
- `geo` solo si se conocen las coordenadas de la atracción (no las del camping)
- En modo array (listado), si hay menos de 2 items, usar el schema individual
