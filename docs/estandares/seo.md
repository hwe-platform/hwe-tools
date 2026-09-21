# Estándar de SEO

Reglas mínimas de SEO que todo el código debe cumplir desde el Hito 1.
Se ampliará antes del Hito 4 con sitemap dinámico, auditorías y Core Web Vitals.

---

## HTML semántico

- Un solo `<h1>` por página — nunca dos, nunca cero
- Headings en orden: h1 → h2 → h3, nunca saltar niveles
- Etiquetas semánticas obligatorias: `<main>`, `<nav>`, `<article>`,
  `<section>`, `<footer>` donde corresponda
- `<html lang="fr">` con el idioma activo de la página

## Imágenes

- `alt` obligatorio en toda imagen (la primitiva Image ya lo exige)
- Usar `next/image` siempre — nunca `<img>` directo
- Formatos optimizados (next/image los genera automáticamente)

## Meta tags

- Toda página tiene `title` y `description` (del grupo `seo` del modelo de Payload)
- `<link rel="canonical">` apuntando a la URL principal
- `hreflang` entre idiomas en todas las páginas localizadas
- Open Graph básico: `og:title`, `og:description`, `og:image`

## JSON-LD

- `Organization` + `WebSite` en el layout (todas las páginas)
- `LocalBusiness` en la home
- Los demás schemas (Accommodation, Restaurant, Event, Article)
  se añaden conforme se implementen sus bloques/fichas

## Links

- Usar `next/link` siempre — nunca `<a>` directo (la primitiva Link ya lo hace)
- Links externos con `rel="noopener noreferrer"` (la primitiva ya lo hace)
- No links rotos — se verifica con auditoría bajo demanda

## Rendimiento

- No bloquear el render con scripts síncronos
- Lazy loading en imágenes below the fold (next/image lo hace por defecto)

---

## Pendiente para Hito 4

- Sitemap dinámico generado desde Payload
- robots.txt y llms.txt
- Core Web Vitals como criterio de aceptación (LCP <2.5s, CLS <0.1)
- Auditoría SEO completa con skill `/audit-seo`
- Schemas JSON-LD por tipo de página (11 templates)