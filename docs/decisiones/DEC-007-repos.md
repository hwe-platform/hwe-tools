# DEC-007 — Tres repositorios

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
Tres repositorios con ciclos de vida distintos:

| Repo | Propósito |
|------|-----------|
| `hwe-tools` | Documentación, specs, historias, estándares, skills, agentes |
| `hwe-core` | Paquete npm compartido (`@hwe-platform/core-ui`) via GitHub Packages |
| `hwe-template` | Template GitHub para crear sites de cliente (Next.js + Payload + Vercel Postgres) |

`hwe-tools` es git submodule consumido por los otros dos.

Los sites de cliente se crean clonando `hwe-template` y viven
en repos independientes. Consumen `@hwe-platform/core-ui`
via npm con versiones fijadas.

## Por qué
Cada repo tiene un ritmo distinto: `hwe-tools` cambia
constantemente (documentación), `hwe-core` cambia cuando se
añaden bloques (versiones npm), `hwe-template` se clona una vez
por cliente y luego vive independiente con su propio contenido.
Separar permite versionar y desplegar cada pieza a su ritmo.

## Conexión entre repos

`hwe-tools` se monta como git submodule en `docs/` de los otros repos.
Los agentes y comandos de Claude Code viven en `hwe-tools/.claude/` pero
Claude Code busca comandos en `.claude/commands/` de la raíz del repo
donde trabaja.

Para que los comandos sean descubribles, cada repo consumidor crea
stubs en `.claude/commands/` con una línea que carga el comando real:

```
Load and follow docs/.claude/commands/nombre-comando.md exactly.
```

Cada comando nuevo en hwe-tools requiere crear un stub en los repos
que lo consuman. Se usa stubs en vez de symlinks por compatibilidad
con Windows.
