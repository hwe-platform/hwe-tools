---
id: HU-013
titulo: Configurar storage adapter para media en producción
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-005]
---

## Contexto

La colección `media` de HU-005 guarda los archivos en el filesystem, que sirve
en local pero no en Vercel: el sistema de archivos de una función serverless es
efímero y las imágenes subidas por el editor desaparecerían en el siguiente
deploy.

Para que HU-012 pueda desplegar con contenido real, `media` necesita un storage
en la nube. La decisión es Vercel Blob, provisional a la espera de ver costes
(ver DEC-010).

## Qué hacer

1. Instalar `@payloadcms/storage-vercel-blob` en `apps/site-demo`
2. Configurar el adapter en `payload.config.ts` condicionado por entorno: solo
   en producción y staging, nunca en desarrollo local
3. Añadir `BLOB_READ_WRITE_TOKEN` a `.env.example`, documentado
4. Verificar que el upload, la generación de los cuatro tamaños y la lectura
   funcionan contra Vercel Blob
5. Documentar en el README de `apps/site-demo` cómo se configura Vercel Blob al
   crear el proyecto de un cliente nuevo

## Leer antes

- docs/decisiones/DEC-010-media-storage.md
- docs/decisiones/DEC-003-hosting.md
- specs/payload/modelo-datos.md (sección `media`)
- docs/estandares/codigo.md

## Criterios de aceptación

- [ ] En local (dev), media sigue usando filesystem sin cambios
- [ ] En producción, media se almacena en Vercel Blob
- [ ] Los 4 sizes (thumbnail, card, hero, og) se generan correctamente
- [ ] Las URLs de las imágenes resuelven desde el frontend
- [ ] `.env.example` documenta las variables necesarias
- [ ] El README explica cómo configurar Blob en un proyecto Vercel nuevo

## Notas

Los criterios que hablan de producción no se pueden comprobar sin un proyecto
Vercel desplegado. Lo natural es verificarlos en un preview deploy de la propia
rama, antes de HU-012 — o asumir que HU-013 se cierra durante HU-012. Conviene
decidirlo al planificar, no al revisar.

## Retrospectiva

_(vacía al crear — se llena si la historia necesitó correcciones significativas)_
