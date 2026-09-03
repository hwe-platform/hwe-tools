---
id: HU-003
titulo: Conectar hwe-tools como submodule en hwe-core y hwe-template
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-001, HU-002]
---

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

- [ ] `git clone --recursive` de hwe-core trae hwe-tools
- [ ] `git clone --recursive` de hwe-template trae hwe-tools
- [ ] Los docs son accesibles desde ambos repos (ej: `docs/estandares/codigo.md`)
- [ ] GitHub Actions CI funciona con submodules
- [ ] README de ambos repos documenta cómo trabajar con submodules

## Retrospectiva

_(se llena después si aplica)_
