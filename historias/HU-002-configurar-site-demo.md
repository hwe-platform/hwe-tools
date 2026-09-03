---
id: HU-002
titulo: Crear apps/site-demo con Next.js + Payload CMS en el monorepo
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
dependencias: [HU-001, HU-004]
---

## Contexto

El site-demo es la aplicación web donde se construyen y prueban los bloques
con datos reales de Payload. Vive dentro del monorepo hwe-core como
`apps/site-demo/`. Al estar en el mismo monorepo que `packages/core-ui/`,
los cambios en bloques se ven al instante sin publicar a npm.

Cuando el Hito 1 esté completo, esta app se extraerá como `hwe-template`
(repo independiente) para clonar proyectos de cliente. Hasta entonces,
todo el desarrollo se hace aquí.

## Qué hacer

1. Crear `apps/site-demo/` dentro del monorepo hwe-core
2. Inicializar Next.js 15 con App Router y TypeScript strict
3. Instalar Payload CMS v3 embebido en el directorio `/app`
   - Payload admin accesible en `/admin`
   - Configurar `payload.config.ts` base (sin colecciones todavía — vienen en HU-005)
4. Conectar base de datos Postgres para desarrollo local
   - `@payloadcms/db-vercel-postgres` como adapter
   - Postgres local o Docker para desarrollo
   - Variables de entorno para conexión
5. Configurar Tailwind CSS v4 con `@theme inline`
   - Crear `src/styles/theme.css` con tokens de La Civelle como referencia
     (primary #0b665d, secondary #c9a87c, background #fffeed, radius 1rem)
   - Crear `src/styles/globals.css` con `@layer base` para tipografía fluida
   - Configurar fuentes (Bitter heading + Inter body via next/font)
6. Configurar ESLint + Prettier
   - Usar la variante "repos-app" (eslint-config-next)
7. Conectar con `packages/core-ui/` via workspace
   - En package.json: `"@hwe-platform/core-ui": "workspace:*"`
   - Turborepo conecta automáticamente — cambios instantáneos
8. Crear estructura de carpetas:
   - `src/app/(frontend)/` — rutas del sitio público
   - `src/app/(frontend)/[...slug]/page.tsx` — catch-all placeholder
   - `src/app/(payload)/admin/` — admin panel de Payload
   - `src/styles/` — theme.css, globals.css
   - `src/blocks/` — bloques custom del cliente (vacío, para overrides)
   - `src/block-registry.ts` — registry del cliente (extiende base de core-ui)
   - `src/services/` — capa de consultas a Payload (vacía, preparada)
9. Configurar Turborepo para incluir site-demo en el pipeline:
   - `turbo.json` con tasks para dev, build, lint del app
10. Configurar `.env.example` con todas las variables necesarias
11. Crear `README.md` con instrucciones de setup

## Leer antes

- docs/estandares/herramientas.md (variante repos-app)
- docs/estandares/codigo.md
- docs/arquitectura/tokens.md
- docs/arquitectura/paginas-routing.md
- docs/decisiones/DEC-003-hosting.md
- docs/decisiones/DEC-007-repos.md

## Criterios de aceptación

- [ ] `pnpm dev --filter site-demo` arranca sin errores
- [ ] Payload admin accesible en `localhost:3000/admin`
- [ ] Base de datos Postgres conectada (migrations corren)
- [ ] TypeScript strict sin errores de compilación
- [ ] ESLint + Prettier configurados y sin errores
- [ ] Tailwind v4 con `@theme inline` renderizando tokens de La Civelle
- [ ] Fuentes Bitter y Inter cargando via `next/font`
- [ ] `@hwe-platform/core-ui` importable via `workspace:*` (sin publicar a npm)
- [ ] Cambios en `packages/core-ui/` se reflejan en site-demo al refrescar
- [ ] `src/services/` existe como carpeta preparada
- [ ] `.env.example` documenta todas las variables necesarias
- [ ] CI funciona con el app añadido al pipeline de Turborepo

## Retrospectiva

_(se llena después si aplica)_
