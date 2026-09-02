# DEC-007 — Tres repositorios

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
Tres repositorios con ciclos de vida distintos:

| Repo | Propósito |
|------|-----------|
| `hwe-tools` | Documentación, specs, historias, estándares, skills, agentes |
| `hwe-core` | Paquetes npm compartidos (`@hwe/core-ui`, `@hwe/config`) via GitHub Packages |
| `hwe-template` | Template GitHub para crear sites de cliente (Next.js + Payload + Vercel Postgres) |

`hwe-tools` es git submodule consumido por los otros dos.

Los sites de cliente se crean clonando `hwe-template` y viven
en repos independientes. Consumen `@hwe/core-ui` y `@hwe/config`
via npm con versiones fijadas.

## Por qué
Cada repo tiene un ritmo distinto: `hwe-tools` cambia
constantemente (documentación), `hwe-core` cambia cuando se
añaden bloques (versiones npm), `hwe-template` se clona una vez
por cliente y luego vive independiente con su propio contenido.
Separar permite versionar y desplegar cada pieza a su ritmo.
