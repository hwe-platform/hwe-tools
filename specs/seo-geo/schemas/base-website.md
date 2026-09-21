---
titulo: Schema base — WebSite + Organization
capa: 1 (layout, todas las páginas)
schema-types: WebSite, Organization
datos-de: site-config
---

## Cuándo se genera

Siempre. Todas las páginas del site incluyen estos dos schemas.

## WebSite

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"WebSite"` |
| `@id` | Obligatorio | site URL + `/#website` | Referencia interna |
| `name` | Obligatorio | `site-config.general.siteName` | |
| `url` | Obligatorio | URL base del site | |
| `inLanguage` | Recomendado | `site-config.languages.default` | |
| `description` | Recomendado | `site-config.general.siteDescription` | Localizado |
| `potentialAction` | Opcional | — | SearchAction si hay buscador en el site |

### Ejemplo

```json
{
  "@type": "WebSite",
  "@id": "https://camping-lacivelle.com/#website",
  "name": "Camping La Civelle",
  "url": "https://camping-lacivelle.com",
  "inLanguage": "fr",
  "description": "Camping 3 étoiles à Capbreton, au cœur des Landes"
}
```

## Organization

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"Organization"` |
| `@id` | Obligatorio | site URL + `/#organization` | Referencia interna |
| `name` | Obligatorio | `site-config.general.siteName` | |
| `url` | Obligatorio | URL base del site | |
| `logo` | Recomendado | `site-config.general.logo` | URL de la imagen |
| `telephone` | Recomendado | `site-config.contact.phone` | Si existe |
| `email` | Recomendado | `site-config.contact.email` | Si existe |
| `address` | Recomendado | `site-config.contact.*` | Solo si hay dirección completa |
| `sameAs` | Opcional | `site-config.social.*` | Array con las URLs que existan |

### Ejemplo

```json
{
  "@type": "Organization",
  "@id": "https://camping-lacivelle.com/#organization",
  "name": "Camping La Civelle",
  "url": "https://camping-lacivelle.com",
  "logo": "https://camping-lacivelle.com/media/logo.png",
  "telephone": "+33 5 58 72 12 34",
  "email": "contact@camping-lacivelle.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Route de la Plage",
    "addressLocality": "Capbreton",
    "postalCode": "40130",
    "addressCountry": "FR"
  },
  "sameAs": [
    "https://facebook.com/campinglacivelle",
    "https://instagram.com/camping_lacivelle"
  ]
}
```

## Datos no incluidos si no existen

Si `site-config.contact.phone` está vacío → no aparece `telephone`.
Si `site-config.social` no tiene ninguna URL → no aparece `sameAs`.
Si no hay logo → no aparece `logo`.
