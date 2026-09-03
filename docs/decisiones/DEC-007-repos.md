# DEC-007 — Repositorios

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión

Durante el Hito 1 hay dos repos activos. Un tercero se extrae al final:

| Repo | Propósito |
|------|-----------|
| `hwe-tools` | Documentación, specs, historias, estándares, skills, agentes |
| `hwe-core` | Monorepo Turborepo: paquete npm compartido (`@hwe-platform/core-ui`) + `apps/site-demo/` (Next.js + Payload, entorno de desarrollo y validación) |
| `hwe-template` | Se extrae de `apps/site-demo/` al final del Hito 1 (HU-012) — template GitHub para crear sites de cliente |

`hwe-tools` es git submodule consumido únicamente por `hwe-core`.

`apps/site-demo/` vive dentro de `hwe-core`, en el mismo Turborepo que
`packages/core-ui/`. Ahí se construyen y prueban los bloques con datos
reales de Payload mientras dura el Hito 1.

Cuando `apps/site-demo/` cumple todos sus criterios de aceptación (HU-012),
su código se extrae como `hwe-template` — un repo independiente. A partir
de ahí, `hwe-template` y los repos de cliente (clonados de `hwe-template`)
consumen `@hwe-platform/core-ui` via npm (GitHub Packages) con versiones
fijadas, no via workspace, y no llevan submodule de `hwe-tools` — no
necesitan acceso a docs/skills.

## Por qué

Construir el site de validación (`apps/site-demo/`) dentro del mismo
monorepo que `packages/core-ui/` evita publicar a npm en cada cambio de
bloque mientras el sistema todavía se está construyendo — Turborepo conecta
los paquetes con `workspace:*` y los cambios se ven al instante. Separar
`hwe-template` como repo independiente solo tiene sentido una vez que el
site funciona de punta a punta: antes de eso, mantener dos repos casi
idénticos en paralelo sería trabajo duplicado sin nada que proteger.

`hwe-tools` cambia constantemente (documentación) y solo lo necesita
`hwe-core`, donde viven los agentes que la consultan mientras se construye
el sistema. `hwe-template` y los repos de cliente no editan `core-ui` ni
consultan specs — consumen el paquete publicado y no necesitan ese acceso.

## Conexión entre repos

`hwe-tools` se monta como git submodule en `docs/` de `hwe-core`
únicamente. `hwe-template` y los repos de cliente NO tienen submodule.

### Durante el Hito 1 — `workspace:*`

`apps/site-demo/` declara `"@hwe-platform/core-ui": "workspace:*"` en su
`package.json`. Turborepo resuelve el paquete directamente desde
`packages/core-ui/` dentro del mismo repo — sin publicar, sin `pnpm link`,
sin versión que fijar. Es el flujo por defecto mientras `core-ui` y el
site que lo prueba viven en el mismo monorepo.

### Tras la extracción — npm

Una vez extraído `hwe-template`, y para cada repo de cliente clonado de
él, `@hwe-platform/core-ui` se consume via npm (GitHub Packages) con
versión fijada — igual que cualquier otra dependencia externa. Si durante
el desarrollo de un cliente hace falta probar un cambio de `core-ui` que
todavía no se ha publicado, se usa `pnpm link` para apuntar temporalmente
al paquete local sin publicar. En producción, siempre npm.

### Comandos de Claude Code

Los agentes y comandos de Claude Code viven en `hwe-tools/.claude/` pero
Claude Code busca comandos en `.claude/commands/` de la raíz del repo
donde trabaja.

Para que los comandos sean descubribles, `hwe-core` crea stubs en
`.claude/commands/` con una línea que carga el comando real:

```
Load and follow docs/.claude/commands/nombre-comando.md exactly.
```

Cada comando nuevo en hwe-tools requiere crear un stub en `hwe-core`.
Se usa stubs en vez de symlinks por compatibilidad con Windows.
`hwe-template` y los repos de cliente no tienen `docs/`, así que no
llevan estos stubs.
