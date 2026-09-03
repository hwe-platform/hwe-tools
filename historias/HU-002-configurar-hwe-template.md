---
id: HU-002
titulo: Configurar hwe-template con Next.js + Payload CMS
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
dependencias: [HU-001]
---

## Contexto

El template es la base de la que se clonan todos los sites de cliente.
Necesita Next.js, Payload CMS embebido, Tailwind, y conexión a los
paquetes de `hwe-core`. Sin esto no se puede construir ningún site.

## Qué hacer

1. Crear repo `hwe-template` como GitHub Template Repository
2. Inicializar Next.js 15 con App Router y TypeScript strict
3. Instalar Payload CMS v3 embebido en el directorio `/app`
   - Payload admin accesible en `/admin`
   - Configurar `payload.config.ts` base (sin colecciones todavía)
4. Conectar Vercel Postgres como base de datos
   - `@payloadcms/db-vercel-postgres` como adapter
   - Variables de entorno para conexión
5. Configurar Tailwind CSS v4 con `@theme inline`
   - Crear `src/styles/theme.css` con tokens base (usar los de La Civelle como referencia)
   - Crear `src/styles/globals.css` con `@layer base` para tipografía
   - Configurar fuentes (Bitter + Inter via next/font)
6. Configurar ESLint + Prettier según `docs/estandares/herramientas.md`
7. Añadir `@hwe-platform/core-ui` como dependencia npm desde GitHub Packages
8. Crear estructura de carpetas:
   - `src/app/(frontend)/` — rutas del sitio público
   - `src/app/(payload)/admin/` — admin panel de Payload
   - `src/styles/` — theme.css, globals.css
   - `src/blocks/` — bloques custom del cliente (vacío)
   - `src/block-registry.ts` — registry del cliente (extiende base)
9. Configurar `.env.example` con todas las variables necesarias
10. Crear `README.md` con instrucciones de setup
11. Documentar en `README.md` cómo usar `pnpm link` con `@hwe-platform/core-ui`
    durante desarrollo local para ver cambios de core-ui al instante sin
    publicar a npm

## Leer antes

- docs/estandares/herramientas.md
- docs/estandares/codigo.md
- docs/arquitectura/tokens.md
- docs/decisiones/DEC-003-hosting.md
- docs/decisiones/DEC-007-repos.md

## Criterios de aceptación

- [ ] `pnpm dev` arranca sin errores
- [ ] Payload admin accesible en `localhost:3000/admin`
- [ ] Base de datos Postgres conectada (migrations corren)
- [ ] TypeScript strict sin errores de compilación
- [ ] ESLint + Prettier configurados y sin errores
- [ ] Tailwind v4 con `@theme inline` renderizando tokens correctamente
- [ ] Fuentes Bitter y Inter cargando via `next/font`
- [ ] `@hwe-platform/core-ui` importable desde el proyecto (cuando se publique)
- [ ] `.env.example` documenta todas las variables necesarias
- [ ] El repo está marcado como Template en GitHub
- [ ] README documenta el flujo de pnpm link para desarrollo con core-ui

## Retrospectiva

_(se llena después si aplica)_
