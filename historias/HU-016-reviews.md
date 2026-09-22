---
id: HU-016
titulo: Bloque ReviewsGrid con fuente externa
estado: idea
prioridad: —
hito: 2
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Las reseñas de clientes son contenido externo — vienen de Google Reviews,
GuestApp, TripAdvisor u otras plataformas que los campings ya usan. No
tiene sentido que el editor copie reseñas a mano en Payload.

Separada de HU-010 porque la fuente de datos (API externa vs manual)
define la arquitectura del bloque y necesita su propia investigación.

## Lo que se sabe del Figma

En La Civelle (App.tsx:700): 3 columnas con estrellas, cita en cursiva
y pie de autor. Lleva encima un resumen de valoración
("4.8 / 5 · 328 avis") que el componente debe contemplar.

## Por definir

- Qué plataformas de reseñas usan los clientes de Septeo (Google,
  GuestApp, TripAdvisor, otras)
- Si hay API disponible o si se importan por batch (scraping, CSV,
  pipeline IA del Hito 2)
- Modelo de datos: ¿colección `reviews` en Payload alimentada por
  importación, o fetch directo a API externa en cada render?
- RGPD: las reseñas contienen nombre del autor (dato personal).
  ¿Consentimiento implícito por publicación en plataforma pública?
- aggregateRating: ¿se calcula desde las reseñas importadas o viene
  de la API externa?
- JSON-LD: el schema ReviewsGrid alimentaría `aggregateRating` en
  el Campground schema (HU-013)

## Componente visual (ya claro)

- `ReviewsGridBlock.tsx` — grid de 3 columnas
- `ReviewCard.tsx` — estrellas, cita, autor, fecha, fuente (logo)
- `ReviewsSummary.tsx` — "4.8 / 5 · 328 avis" con barra o estrellas
- Accesible (vitest-axe), responsive (1 col mobile → 3 desktop)

El componente visual se puede construir antes de resolver la fuente
de datos — recibe items y los pinta, igual que cualquier otro bloque.

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_