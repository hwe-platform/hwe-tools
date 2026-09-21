---
titulo: Schema WebPage (genérica / fallback)
capa: 3 (fallback)
schema-types: WebPage
datos-de: pages, cualquier contenido con título y descripción
---

## Cuándo se genera

Cuando una página no tiene un schema específico de capa 2. Es el
fallback — ninguna página sale sin JSON-LD.

Ejemplos: páginas estáticas (Mentions légales, CGV, Plan du camping),
entidades sin schema propio (servicios genéricos), páginas de tipo
`static` o `listing` sin alojamientos asociados.

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"WebPage"` |
| `name` | Obligatorio | `page.title` o `entity.name` | Localizado |
| `description` | Recomendado | `page.seo.metaDescription` o `shortDescription` | Localizado |
| `url` | Obligatorio | URL de la página | |
| `inLanguage` | Recomendado | Idioma activo | |
| `isPartOf` | Recomendado | — | Referencia al WebSite |
| `dateModified` | Opcional | `updatedAt` de Payload | ISO 8601 |

## Ejemplo

```json
{
  "@type": "WebPage",
  "name": "Mentions légales",
  "description": "Mentions légales et conditions d'utilisation du site Camping La Civelle.",
  "url": "https://camping-lacivelle.com/mentions-legales",
  "inLanguage": "fr",
  "isPartOf": {
    "@id": "https://camping-lacivelle.com/#website"
  }
}
```

## Campos condicionales

- `description` solo si existe — una página legal puede no tener metaDescription
- `dateModified` solo si es relevante (no para páginas estáticas que nunca cambian)
- Si ni siquiera tiene `name`, algo va mal en Payload — no generar nada
