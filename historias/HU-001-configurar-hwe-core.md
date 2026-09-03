---
id: HU-001
titulo: Configurar hwe-core como monorepo con paquetes publicables
estado: en-revisión
prioridad: 1
hito: 1
agente: code-builder
rama: main
dependencias: []
---

## Contexto

Sin `hwe-core` no hay paquetes compartidos. Es el repositorio que contiene
`@hwe/core-ui`, que todos los sites de cliente consumen via npm.
Es la primera pieza del Hito 1.

## Qué hacer

1. Inicializar hwe-core (repo ya existe en GitHub, vacío) con Turborepo + pnpm como monorepo
2. Crear paquete `packages/core-ui/` con estructura base:
   - `src/blocks/` (vacío, preparado para bloques)
   - `src/primitives/` (vacío, preparado para primitivas)
   - `src/renderer/` (vacío, preparado para BlockRenderer)
   - `src/layout/` (vacío, preparado para layout components)
   - `src/adapters/` (vacío, preparado para adapters)
   - `src/theme/` (vacío, preparado para token contract)
   - `package.json` con nombre `@hwe/core-ui`, entry points configurados
   - `tsconfig.json` con strict: true
3. Configurar GitHub Packages como npm registry privado
4. Configurar GitHub Actions para CI:
   - Lint (ESLint)
   - Format check (Prettier)
   - Tests (Vitest, aunque no hay tests aún, el runner debe funcionar)
   - Build
   - Publish a GitHub Packages en merge a main
5. Configurar ESLint + Prettier en la raíz del monorepo según
   `docs/estandares/herramientas.md`
6. Crear `README.md` con instrucciones de setup para desarrollo local
7. Crear CLAUDE.md en la raíz con referencia a hwe-tools como fuente de documentación y estándares

## Leer antes

- docs/estandares/herramientas.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/decisiones/DEC-007-repos.md

## Criterios de aceptación

- [ ] `pnpm install` funciona sin errores
- [ ] `pnpm build` compila el paquete
- [ ] `pnpm lint` ejecuta ESLint sin errores
- [ ] `pnpm format:check` ejecuta Prettier sin errores
- [ ] `pnpm test` ejecuta Vitest (aunque no haya tests, el runner arranca)
- [ ] TypeScript strict activado en `@hwe/core-ui`
- [ ] GitHub Actions CI pasa en una PR de prueba
- [ ] Los paquetes se publican a GitHub Packages en merge a main

## Retrospectiva

_(se llena después si aplica)_
