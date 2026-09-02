# Registro de decisiones (DECs)

Decisiones arquitectónicas del proyecto HWE. Concisas e inamovibles salvo debate explícito (Nivel 3).

---

## DEC-001 — Idioma

- Documentación: castellano
- Código (nombres, variables, tipos, commits prefijo): inglés
- JSDoc: castellano
- Descripción de commits: castellano

## DEC-002 — Zod como fuente de verdad

- Zod define los schemas de datos
- Payload deriva de Zod, nunca al revés
- Validación en cada boundary (entrada de API, datos de Payload, props de componentes)

## DEC-003 — TypeScript estricto

- `strict: true` en tsconfig
- `noUncheckedIndexedAccess: true`
- Cero `any` — regla ESLint `no-explicit-any: error`
- `@ts-ignore` prohibido — solo `@ts-expect-error` con comentario obligatorio
- Si el tipo es difícil de definir, se define igualmente

## DEC-004 — Agentes

Seis agentes con tres niveles de autonomía:

| Agente | Modelo | Nivel | Qué hace |
|--------|--------|-------|----------|
| Planner | Opus (claude.ai) | 3 | Debate arquitectura, define specs, prioriza |
| Code Builder | Sonnet (Claude Code) | 2 | Implementa código siguiendo specs y skills |
| Reviewer | Sonnet (Claude Code) | 1 | Valida output contra estándares y checklist |
| Content Generator | Sonnet (API server-side) | 2 | Crea textos, descripciones, traducciones |
| Bulk Operator | Sonnet (API server-side) | 2 | Importación masiva de contenido |
| Content Editor | Haiku (API server-side) | 1-2 | Ediciones simples en contenido existente |

Niveles:
- **Nivel 1:** La IA actúa sola. Resultado verificable, riesgo bajo.
- **Nivel 2:** La IA propone, humano confirma antes de aplicar.
- **Nivel 3:** Humano inicia y dirige. Decisiones de producto.

Skills permiten automatización progresiva: nivel 3 → se crea skill → nivel 2 → skill maduro → nivel 1.

Retro obligatoria cuando una tarea necesita correcciones significativas. La corrección se propaga al skill o estándar correspondiente.

## DEC-005 — Flujo Figma → código

- Figma proporciona el diseño visual de referencia
- El output de Figma nunca es código de producción
- Los bloques se implementan con `@hwe/core-ui` y tokens de Tailwind
- El proceso concreto de análisis de Figma se define cuando llegue el primer diseño real
- Sin diseño Figma disponible, se construye con tokens genéricos y se adapta después

## DEC-006 — Tres repositorios

| Repo | Propósito | Ciclo de vida |
|------|-----------|---------------|
| `hwe-tools` | Documentación, specs, historias, estándares, skills, agentes | Cambia constantemente |
| `hwe-core` | Paquetes npm compartidos (`@hwe/core-ui`, `@hwe/config`) via GitHub Packages | Versiones npm cuando se añaden/mejoran bloques |
| `hwe-template` | Template GitHub para crear sites de clientes. Next.js + Payload CMS + Vercel Postgres | Se clona una vez por cliente, vive independiente |

`hwe-tools` es git submodule consumido por los otros dos.

## DEC-007 — Site demo

- Primer site construido con `hwe-template`
- Cliente ficticio (camping/hotel inventado) con contenido realista
- Datos reales en Payload, no hardcodeados
- Entorno de validación antes de usar bloques con clientes reales
- Repo propio clonado desde `hwe-template`, Vercel project propio, BD propia
- Si funciona en el site demo, funciona para cualquier cliente

## DEC-008 — Rutas y URLs

- Catch-all `[...slug]` en Next.js — una sola ruta dinámica
- URLs definidas como datos en Payload, completamente libres
- Slugs traducidos por idioma, contenido del slug libre (sin estructura forzada)
- Prefijo de idioma configurable por cliente en `site-config`: todos con prefijo o principal sin prefijo
- N idiomas configurables por cliente, sin tope técnico

---

## Regla general

El catálogo de bloques es un repertorio, no una lista de tareas. Cada cliente usa los bloques que su diseño y contenido necesitan. Los bloques se construyen bajo demanda cuando un Figma o una historia los requiere. No hay un número fijo de bloques que completar.
