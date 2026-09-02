# DEC-004 — Zod como fuente de verdad

**Fecha:** 2026-09-01 | **Estado:** Aceptada

## Decisión
Zod define los schemas de datos. Payload CMS deriva sus colecciones
y campos de los schemas Zod, nunca al revés.

Validación en cada boundary: entrada de API, datos leídos de Payload,
props de componentes React. Si los datos cruzan una frontera,
se validan con Zod.

## Por qué
Una sola fuente de verdad para la estructura de datos evita
inconsistencias entre el CMS, la API y el frontend. Si Payload
fuera la fuente, los tipos dependerían de configuración de CMS
que puede cambiar sin control. Con Zod, el schema está en código,
versionado en Git, y cualquier cambio pasa por PR.
