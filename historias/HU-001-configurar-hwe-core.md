---
id: HU-001
titulo: Configurar hwe-core como monorepo con paquetes publicables
estado: hecha
prioridad: 1
hito: 1
agente: code-builder
rama: main
dependencias: []
---

## Contexto

Sin `hwe-core` no hay paquetes compartidos. Es el repositorio que contiene
`@hwe-platform/core-ui`, que todos los sites de cliente consumen via npm.
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
   - `package.json` con nombre `@hwe-platform/core-ui`, entry points configurados
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

- [x] `pnpm install` funciona sin errores
- [x] `pnpm build` compila el paquete
- [x] `pnpm lint` ejecuta ESLint sin errores
- [x] `pnpm format:check` ejecuta Prettier sin errores
- [x] `pnpm test` ejecuta Vitest (aunque no haya tests, el runner arranca)
- [x] TypeScript strict activado en `@hwe-platform/core-ui`
- [ ] GitHub Actions CI pasa en una PR de prueba _(pendiente de verificar en GitHub — repo privado, no verificable desde el agente)_
- [ ] Los paquetes se publican a GitHub Packages en merge a main _(workflow configurado y pusheado a main; pendiente de confirmar en la pestaña Actions)_

## Retrospectiva

### Qué falló

`docs/estandares/herramientas.md` documentaba un único `eslint.config.mjs`
(con `eslint-config-next`) como el estándar para todo el monorepo. Al
aplicarlo tal cual en `hwe-core`, ESLint fallaba: el parser de
`eslint-config-next` intenta cargar `next/dist/compiled/babel/eslint-parser`,
que solo existe si el paquete `next` está instalado.

### Causa raíz

El estándar asumía implícitamente que todo repo del proyecto es una app
Next.js. `hwe-core` es una librería de componentes (consumida por apps
Next.js, pero no una app en sí misma), así que esa asunción no aplica.
Añadir `next` como dependencia solo para satisfacer al linter habría sido
una dependencia de cientos de MB sin ningún uso real.

### Corrección aplicada

- En `hwe-core`: se configuró ESLint con `typescript-eslint` +
  `eslint-plugin-react` + `eslint-plugin-react-hooks` +
  `eslint-plugin-jsx-a11y` directamente, sin pasar por
  `eslint-config-next`, cubriendo el mismo alcance de reglas.
- Se actualizó `docs/estandares/herramientas.md` para documentar ambas
  variantes: "repos-app" (`eslint-config-next`, como antes) y
  "repos-librería" (la config nueva), con una tabla de equivalencia y la
  nota sobre el import con extensión `.js` explícita
  (`eslint-config-next/core-web-vitals.js`), que también dejó de
  funcionar sin ella en la versión actual del paquete.
