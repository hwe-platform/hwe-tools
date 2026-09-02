# DEC-005 — TypeScript estricto

**Fecha:** 2026-09-01 | **Estado:** Aceptada

## Decisión
TypeScript en modo estricto en todo el proyecto:

- `strict: true` en tsconfig
- `noUncheckedIndexedAccess: true`
- Cero `any` — regla ESLint `no-explicit-any: error`
- `@ts-ignore` prohibido — solo `@ts-expect-error` con comentario
  obligatorio que explique por qué
- Si el tipo es difícil de definir, se define igualmente

## Por qué
`any` anula las protecciones de TypeScript — si se permite,
se propaga. El modo estricto fuerza a pensar en los tipos
desde el inicio, lo que reduce errores en runtime y hace
el código más legible. `@ts-expect-error` con comentario
deja constancia de por qué se hace la excepción.
