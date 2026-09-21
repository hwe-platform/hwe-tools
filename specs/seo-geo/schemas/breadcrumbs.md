---
titulo: Schema BreadcrumbList
capa: 1 (layout, todas excepto home)
schema-types: BreadcrumbList
datos-de: pages.parent, categories, URL
---

## Cuándo se genera

En todas las páginas excepto la home. Se construye desde el campo
`parent` de la página o la categoría del contenido.

## BreadcrumbList

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"BreadcrumbList"` |
| `itemListElement` | Obligatorio | Calculado desde parent/categoría | Array de BreadcrumbItem |

### Cada item

| Campo | Nivel | Notas |
|-------|-------|-------|
| `@type` | Obligatorio | `"ListItem"` |
| `position` | Obligatorio | 1, 2, 3... (entero, orden) |
| `name` | Obligatorio | Título de la página/categoría |
| `item` | Obligatorio | URL absoluta (excepto el último item) |

### Construcción según tipo de contenido

**Página con parent:**
```
Accueil → {parent.title} → {page.title}
```

**Alojamiento:**
```
Accueil → {category.name} → {accommodation.name}
```

**Entidad:**
```
Accueil → {entity.type label} → {entity.name}
```

**Artículo:**
```
Accueil → Actualités → {article.title}
```

### Ejemplo — ficha alojamiento

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://camping-lacivelle.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Locations",
      "item": "https://camping-lacivelle.com/locations"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Mobile Home Confort 3 chambres"
    }
  ]
}
```

El último item no lleva `item` (URL) — es la página actual.

### Ejemplo — artículo

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://camping-lacivelle.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Actualités",
      "item": "https://camping-lacivelle.com/actualites"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Nouvelle saison 2026"
    }
  ]
}
```

## Notas

- Los nombres son localizados — en la versión inglesa, "Accueil" sería "Home"
- Las URLs usan los slugs traducidos del idioma activo
- La profundidad máxima depende de la estructura del cliente, no hay límite
