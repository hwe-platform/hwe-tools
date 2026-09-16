# Schemas base vs extensiones por tipo de web

**Estado:** pendiente de decidir — bloquea la extracción de colecciones a
`@hwe-platform/core-ui` (Hito 5).

---

## El problema

El modelo de datos actual (`specs/payload/modelo-datos.md`) está calcado del
primer cliente de referencia: un camping. Se implementó así en HU-005, dentro
de `apps/site-demo/src/collections/`, y para el Hito 1 es lo correcto — hay un
solo site y adelantar abstracción sería inventar requisitos.

El problema aparece al extraer `hwe-template` y montar el segundo cliente. Si
las seis colecciones se mueven a core-ui tal cual, **todos los clientes heredan
un modelo de camping**, usen o no la mitad de los campos.

## Qué es de dominio camping y qué no

Campos que hoy están en el núcleo y no son universales:

| Campo | Por qué no es universal |
|-------|-------------------------|
| `accommodations.type` | El enum es `emplacement, mobilhome, cottage, chalet, tente`. Un hotel necesita categorías de habitación. |
| `accommodations.specs.petFriendly` | Relevante en camping; en un hotel urbano es marginal. |
| `accommodations.specs.surface` | Un mobil-home se vende por m²; una habitación de hotel, no. |
| `entities.type` | `service, activity, restaurant, environment, event` es la taxonomía de un camping. |
| `site-config.booking.engine` | `thr, witbooking, mastercamping, resalys` mezcla motores de camping y de hotel. |
| `site-config.general.stars` | Clasificación por estrellas: aplica a hotel y camping, no a un albergue o un glamping. |

Y campos que un hotel necesitaría y no existen: régimen de pensión, horarios de
check-in/check-out, tipos de cama normalizados, política de cancelación.

## La decisión pendiente

Antes de mover nada a core-ui hay que responder:

1. **¿Qué es núcleo?** El conjunto mínimo que cualquier site de hospitality
   necesita: `media`, `categories`, `pages`, `articles` y la base de
   `accommodations`/`entities` (nombre, slug, descripciones, imágenes, SEO).
2. **¿Cómo se extiende?** Tres caminos posibles:
   - Campos opcionales en el núcleo, activados por configuración del cliente.
   - Un mecanismo de extensión que componga campos extra sobre la colección base.
   - Colecciones distintas por vertical (`accommodations-camping`,
     `accommodations-hotel`) que comparten el schema base.
3. **¿Dónde vive cada extensión?** En core-ui detrás de un flag, en un paquete
   por vertical, o en el repo del cliente.

Sin esta decisión, extraer las colecciones condena a cada cliente a arrastrar
campos que no le sirven — justo lo que DEC-007 quiere evitar.

## Seguimiento

- Issue: "Definir schemas base vs extensiones por tipo de web" (label `hito-5`)
- TODO en código: `apps/site-demo/src/collections/README.md` y
  `apps/site-demo/src/payload.config.ts` en hwe-core
