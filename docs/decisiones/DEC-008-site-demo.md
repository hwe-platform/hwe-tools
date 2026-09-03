# DEC-008 — Site demo

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
El site demo (`apps/site-demo/`, dentro del monorepo `hwe-core` — DEC-007)
es el primer site construido con el sistema. Funciona como entorno de
validación completo, y es la base de la que se extrae `hwe-template`
al final del Hito 1 — no al revés.

- Cliente ficticio (camping/hotel inventado) con contenido realista
- Datos reales en Payload, no hardcodeados
- Vercel project propio con base de datos propia
- Todo bloque nuevo se valida primero aquí

Si funciona en el site demo, funciona para cualquier cliente.

## Por qué
Validar con datos reales en un entorno completo (Payload + Next.js
+ Vercel) detecta problemas que los tests unitarios no cubren.
Un cliente ficticio permite iterar sin presión de producción.
