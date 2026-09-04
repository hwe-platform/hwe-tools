---
id: HU-002
titulo: Crear apps/site-demo con Next.js + Payload CMS en el monorepo
estado: hecha
prioridad: 1
hito: 1
agente: code-builder
rama: feat/HU-002-site-demo-monorepo
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
2. Inicializar Next.js 16 con App Router y TypeScript strict
3. Instalar Payload CMS v3 embebido en el directorio `/app`
   - Payload admin accesible en `/admin`
   - Configurar `payload.config.ts` base (sin colecciones todavía — vienen en HU-005)
4. Conectar base de datos Postgres para desarrollo local
   - `@payloadcms/db-postgres` como adapter (el genérico — ver retrospectiva:
     el de Vercel arrastra el SDK de `@vercel/postgres` y da problemas)
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

- [x] `pnpm dev --filter site-demo` arranca sin errores
- [x] Payload admin accesible en `localhost:3000/admin`
- [x] Base de datos Postgres conectada (migrations corren)
- [x] TypeScript strict sin errores de compilación
- [x] ESLint + Prettier configurados y sin errores
- [x] Tailwind v4 con `@theme inline` renderizando tokens de La Civelle
- [x] Fuentes Bitter y Inter cargando via `next/font`
- [x] `@hwe-platform/core-ui` importable via `workspace:*` (sin publicar a npm)
- [x] Cambios en `packages/core-ui/` se reflejan en site-demo al refrescar
- [x] `src/services/` existe como carpeta preparada
- [x] `.env.example` documenta todas las variables necesarias
- [ ] CI funciona con el app añadido al pipeline de Turborepo — verificado en
      local con los mismos comandos y env vars dummy de `ci.yml` (lint, format
      check, test y build pasan); falta confirmar el run real de GitHub Actions
      sobre el merge a `main`

## Retrospectiva

### Verificación real, más allá de lo previsto en el plan

Había una Postgres local real disponible (Laragon, credenciales encontradas
en el `.env` del proyecto hermano `hospitality-web-platform-payloadcms`).
Se creó una base `site-demo` propia (no compartida, DEC-003) y se verificó
de punta a punta: `next build`, `pnpm dev`, creación real de tablas
(`users`, `users_sessions`, `payload_migrations`, etc.) y la vista de
"crear primer usuario" en `/admin`. El único criterio no verificable desde
aquí es el pipeline de GitHub Actions — hace falta un push real para
confirmarlo (los env vars dummy ya están en `ci.yml`).

### Qué falló y causa raíz

- **Dev colgado indefinidamente en "Pulling schema from database":** con
  `@payloadcms/db-vercel-postgres`, la conexión de Payload sí funcionaba
  (pasándole `connectionString`), pero su CLI de introspección de esquema
  (drizzle-kit) usa el SDK de `@vercel/postgres` por debajo, que solo lee la
  variable `POSTGRES_URL` — sin ella falla en bucle, sin error visible.
  **Causa raíz:** ese adapter mete una capa (el SDK de Vercel, hoy además
  deprecado en favor de Neon) que no aporta nada contra una Postgres normal.
  **Corrección:** se cambió al adapter genérico `@payloadcms/db-postgres`
  (driver `pg`), que no impone el nombre de la variable — se recuperó
  `DATABASE_URI` — y sirve igual para Postgres local, Docker o gestionada.
  La spec (paso 4) pedía el de Vercel; se actualizó.
- **Versión de Next mal elegida:** `docs/proyecto.md` decía "Next.js 15", así
  que se instaló `next@^15`; al chocar con el peer dependency de
  `@payloadcms/next@3.88` se fijó `15.4.11`, el parche más alto de esa rama
  que encajaba. **Causa raíz:** el mismo rango
  (`>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0`)
  admite la banda 16 completa y solo tres ventanas mínimas de la 15 — señal de
  que Payload soporta la 16 de forma amplia. La decisión de stack estaba
  desactualizada y no se escaló a tiempo. **Corrección:** Next 16.2.6, y
  `docs/proyecto.md` + `arquitectura/bloques.md` actualizados.
- **`postgresAdapter` no existe en el adapter de Vercel:** su export real era
  `vercelPostgresAdapter`, y recibía `connectionString` en el nivel superior,
  no bajo `pool`. Con `@payloadcms/db-postgres` el export sí es
  `postgresAdapter` y la conexión va anidada en `pool` (como en la doc oficial).
- **`eslint-config-next`, dos veces:** la 15.4.x exportaba formato `.eslintrc`
  legado y `...nextVitals` rompía con "not iterable", así que se metió el
  puente `FlatCompat`. Al subir a la 16.2.6 el puente pasó a ser el problema
  (`TypeError: Converting circular structure to JSON`), porque esa versión ya
  exporta flat config nativo. **Corrección:** spread directo y fuera la
  devDependency `@eslint/eslintrc`. `estandares/herramientas.md` documenta
  ahora ambos casos y el síntoma de cada uno.

### Corrección aplicada

Todo lo anterior está en el código de esta misma PR. Tras el cambio de
adapter, el arranque en dev bajó de ~5 s a ~1,9 s y el log queda sin errores
(antes salía `VercelPostgresError` en bucle). Sigue pendiente confirmar el
build de CI con un push real.
