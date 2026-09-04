---
id: HU-003
titulo: Conectar hwe-tools como submodule en hwe-core y hwe-template
estado: hecha
prioridad: 2
hito: 1
agente: code-builder
rama: main
dependencias: [HU-001, HU-002]
---

**Nota:** Completado parcialmente. Submodule en hwe-core funcional.
hwe-template se extrae del monorepo al final del Hito 1, no necesita
submodule propio.

## Contexto

Los agentes IA necesitan acceso a la documentación, specs y estándares
desde los repos donde trabajan. `hwe-tools` como git submodule permite
que Claude Code lea las specs y estándares directamente desde el repo
sin tener que copiarlos.

## Qué hacer

1. Añadir `hwe-tools` como git submodule en `hwe-core/`:
   - Ruta: `hwe-core/docs/` (o `hwe-core/hwe-tools/`)
   - Branch: `main`
2. Añadir `hwe-tools` como git submodule en `hwe-template/`:
   - Ruta: `hwe-template/docs/` (o `hwe-template/hwe-tools/`)
   - Branch: `main`
3. Actualizar `.gitmodules` en ambos repos
4. Configurar GitHub Actions para inicializar submodules en CI:
   - `git submodule update --init --recursive` en el step de checkout
5. Añadir instrucciones de submodule en el README de ambos repos:
   - `git clone --recursive` para clonar con submodules
   - `git submodule update --remote` para actualizar

## Leer antes

- docs/decisiones/DEC-007-repos.md

## Criterios de aceptación

- [x] `git clone --recursive` de hwe-core trae hwe-tools
- [~] ~~`git clone --recursive` de hwe-template trae hwe-tools~~ — no aplica:
      DEC-007 quita el submodule de hwe-template (no consulta specs)
- [x] Los docs son accesibles desde hwe-core (ej: `docs/estandares/codigo.md`)
- [~] ~~GitHub Actions CI funciona con submodules~~ — superado: CI usa
      `submodules: false` a propósito, el build no necesita `docs/` y el repo
      es privado (ver commit 2cf9e0e de hwe-core)
- [ ] README de hwe-core documenta cómo trabajar con submodules — **pendiente**:
      está en CLAUDE.md pero no en README.md, y el `git clone` del README no
      lleva `--recursive`

## Retrospectiva

_(se llena después si aplica)_
