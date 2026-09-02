# DEC-008 — Site demo

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
El site demo es el primer site construido con `hwe-template`.
Funciona como entorno de validación del sistema completo.

- Cliente ficticio (camping/hotel inventado) con contenido realista
- Datos reales en Payload, no hardcodeados
- Repo propio clonado desde `hwe-template`
- Vercel project propio con base de datos propia
- Todo bloque nuevo se valida primero aquí

Si funciona en el site demo, funciona para cualquier cliente.

## Por qué
Validar con datos reales en un entorno completo (Payload + Next.js
+ Vercel) detecta problemas que los tests unitarios no cubren.
Un cliente ficticio permite iterar sin presión de producción.
