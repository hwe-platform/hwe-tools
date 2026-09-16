---
id: HU-005
titulo: Colecciones y globals de Payload derivadas de schemas Zod
estado: hecha
prioridad: 1
hito: 1
agente: code-builder
rama: main
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

- [x] Payload admin muestra todas las colecciones en el sidebar
- [x] Se puede crear un documento en cada colección desde el admin
- [x] Los campos localizados cambian de valor al cambiar idioma en el admin
- [x] El fallback al idioma principal funciona
- [x] Los slugs se auto-generan desde el título
- [x] Los hooks de validación Zod funcionan (rechazan datos inválidos)
- [x] Las migrations se ejecutan sin errores
- [x] Media upload funciona (subir imagen, genera los 4 tamaños)
- [x] Los blocks field de pages muestran los tipos de bloque disponibles
- [x] Access control: sin login se puede leer, con login se puede editar
- [x] Tests de hooks — cobertura >70%

## Retrospectiva

### Qué falló

Los schemas Zod de HU-004 no coincidían con lo que Payload produce de verdad.
No se vio en HU-004 porque los schemas se testearon contra objetos escritos a
mano, no contra el CMS. Salió al ejecutar las colecciones contra Postgres:

- `id: z.string()`, pero el adapter de Postgres usa columnas `serial` y
  devuelve números.
- Los campos opcionales vacíos llegan como `null`, y `.optional()` de Zod
  acepta `undefined`, no `null`.
- Los `group` sin rellenar llegan como `{}` en vez de ausentes, así que sus
  campos fallaban aunque el grupo entero fuese opcional.

Además, sacar `payloadIdSchema` a `common.schema.ts` cerró un ciclo de imports
con `collections/media.schema.ts` que `tsc` no detecta —es un fallo de
inicialización, no de tipos— y que solo apareció al arrancar el servidor.

### Causa raíz

Un schema escrito contra un modelo imaginado, no contra el sistema real. La
forma de lectura y la de escritura de Payload no son la misma, y ninguna de las
dos se había observado antes de darlas por buenas.

### Corrección aplicada

- `payloadIdSchema` acepta `string | number` y vive en su propio módulo sin
  imports, para que no pueda cerrar ciclos.
- `normalizeWriteData` traduce el payload de escritura a la forma que el schema
  describe, antes de validar.
- El test de paridad compara cada config de Payload con su schema en los dos
  sentidos, para que config y schema no puedan volver a divergir en silencio.

Pendiente de propagar: el test de paridad solo compara nombres de campo, no si
son obligatorios. Los desajustes de `required` entre Payload y Zod
(`description`, `schedule.periods`, `seo`) hubo que encontrarlos ejecutando.
