# DEC-009 — Rutas y URLs

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
Una sola ruta dinámica catch-all `[...slug]` en Next.js resuelve
todas las páginas. Las URLs se definen como datos en Payload,
completamente libres — no hay estructura obligatoria de slugs.

- Slugs traducidos por idioma, contenido del slug libre
- Prefijo de idioma configurable por cliente en `site-config`:
  todos los idiomas con prefijo, o el principal sin prefijo
- N idiomas configurables por cliente, sin tope técnico
- Los slugs se generan automáticamente desde el título
  y se pueden ajustar manualmente

## Por qué
URLs como datos en Payload permite crear páginas nuevas sin
tocar código. El catch-all resuelve cualquier estructura
de URL sin crear carpetas en Next.js. La flexibilidad de
slugs y prefijos de idioma permite adaptarse a las convenciones
SEO de cada mercado.
