---
id: HU-005
titulo: Colecciones y globals de Payload derivadas de schemas Zod
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
dependencias: [HU-002, HU-004]
---

## Contexto

Con los schemas Zod definidos y `apps/site-demo/` configurado, toca crear
las colecciones y globals de Payload que dan vida al modelo de datos.
Es lo que permite que el editor pueda crear contenido.

## Qué hacer

1. Crear colecciones en `apps/site-demo/src/collections/`:
   - `media.ts` — upload con sizes configurados (thumbnail, card, hero, og)
   - `accommodations.ts` — todos los campos de la spec
   - `entities.ts` — con condicionales por type
   - `pages.ts` — con blocks field y hero group
   - `articles.ts` — blog/actualités
   - `categories.ts` — categorías simples
2. Crear globals en `apps/site-demo/src/globals/`:
   - `site-config.ts` — con todas las secciones (general, contact, location,
     languages, social, payments, legal, tracking, customCode, booking)
   - `header.ts` — topBar + navigation con children
   - `footer.ts` — virtualAssistant, columns con types, partners, copyright
   - `banner.ts` — enabled, message, type, dismissible, url
3. Configurar localización en `payload.config.ts`:
   - Idiomas iniciales: fr, en, es (para el site demo)
   - Default locale: fr
   - Fallback: true
4. Configurar hooks básicos:
   - `beforeChange` en pages, accommodations, entities, articles:
     auto-generar slug desde título si no existe
   - `beforeChange` con validación Zod en boundaries
   - `afterChange` con `revalidateTag` para ISR
5. Access control básico:
   - Todos los contenidos legibles sin autenticación (sitio público)
   - Creación/edición requiere autenticación
6. Registrar todo en `payload.config.ts`
7. Ejecutar `payload migrate:create` y verificar que las migrations son correctas
8. Configurar los blocks field de pages con los block configs básicos
   (al menos mediaText, iconGrid, cardGrid, richText, cta)

## Leer antes

- specs/payload/modelo-datos.md
- specs/payload/localizacion.md
- docs/arquitectura/paginas-routing.md
- docs/estandares/codigo.md
- docs/decisiones/DEC-004-zod.md

## Criterios de aceptación

- [ ] Payload admin muestra todas las colecciones en el sidebar
- [ ] Se puede crear un documento en cada colección desde el admin
- [ ] Los campos localizados cambian de valor al cambiar idioma en el admin
- [ ] El fallback al idioma principal funciona
- [ ] Los slugs se auto-generan desde el título
- [ ] Los hooks de validación Zod funcionan (rechazan datos inválidos)
- [ ] Las migrations se ejecutan sin errores
- [ ] Media upload funciona (subir imagen, genera los 4 tamaños)
- [ ] Los blocks field de pages muestran los tipos de bloque disponibles
- [ ] Access control: sin login se puede leer, con login se puede editar
- [ ] Tests de hooks — cobertura >70%

## Retrospectiva

_(se llena después si aplica)_
