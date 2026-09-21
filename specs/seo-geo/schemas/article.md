---
titulo: Schema BlogPosting (Artículo)
capa: 2 (específica)
schema-types: BlogPosting
datos-de: articles, site-config
---

## Cuándo se genera

En la ficha individual de un artículo. Solo si tiene `title`,
`content` y `publishedAt`.

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"BlogPosting"` |
| `headline` | Obligatorio | `article.title` | Localizado |
| `description` | Obligatorio | `article.excerpt` | Localizado |
| `url` | Obligatorio | URL del artículo | |
| `datePublished` | Obligatorio | `article.publishedAt` | ISO 8601 |
| `dateModified` | Recomendado | `article.updatedAt` (automático de Payload) | ISO 8601 |
| `image` | Recomendado | `article.image` | URL |
| `author` | Recomendado | `article.author` | Si existe |
| `publisher` | Recomendado | — | Referencia a Organization |
| `articleSection` | Opcional | `article.category` | Localizado |
| `inLanguage` | Recomendado | Idioma activo | |
| `isPartOf` | Recomendado | — | Referencia al WebSite |

## Ejemplo

```json
{
  "@type": "BlogPosting",
  "headline": "Nouvelle saison 2026 : toutes les nouveautés du camping",
  "description": "Découvrez les nouveautés pour la saison 2026 : nouveaux mobil-homes, piscine rénovée et activités inédites.",
  "url": "https://camping-lacivelle.com/actualites/nouvelle-saison-2026",
  "datePublished": "2026-03-15T10:00:00+01:00",
  "dateModified": "2026-03-20T14:30:00+01:00",
  "image": "https://camping-lacivelle.com/media/saison-2026.jpg",
  "author": {
    "@type": "Person",
    "name": "L'équipe La Civelle"
  },
  "publisher": {
    "@id": "https://camping-lacivelle.com/#organization"
  },
  "articleSection": "Camping",
  "inLanguage": "fr",
  "isPartOf": {
    "@id": "https://camping-lacivelle.com/#website"
  }
}
```

## Campos condicionales

- `author` como Person si `article.author` es un texto. Si no existe, omitir (no inventar "Admin")
- `dateModified` solo si difiere de `datePublished`
- `image` solo si el artículo tiene imagen
- `articleSection` solo si `category` tiene valor
- Sin `publishedAt` no generar BlogPosting — usar WebPage genérica
