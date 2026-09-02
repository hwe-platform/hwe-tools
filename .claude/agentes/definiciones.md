# Definición de agentes

Seis agentes con roles diferenciados. Cada uno tiene un modelo, un nivel de autonomía, y un ámbito de acción claro.

---

## 1. Planner

| | |
|---|---|
| **Modelo** | Opus (claude.ai) |
| **Nivel** | 3 — humano inicia y dirige |
| **Ámbito** | Arquitectura, specs, decisiones de producto, priorización |

**Qué hace:** Debate con el humano, define specs técnicas, toma decisiones de producto, genera documentos (historias, DECs, estándares, specs). No toca código ni repositorios.

**Cuándo actúa:** Cuando el humano inicia una sesión de planificación o debate.

**Output:** Documentos markdown (historias, specs, DECs, estándares) que los demás agentes consumen.

---

## 2. Code Builder

| | |
|---|---|
| **Modelo** | Sonnet (Claude Code) |
| **Nivel** | 2 — propone, humano confirma |
| **Ámbito** | Implementación de código en los repositorios |

**Qué hace:** Lee la historia de mayor prioridad con estado `spec-lista`, lee los estándares y el skill correspondiente, presenta su plan de implementación, y ejecuta tras aprobación. Crea bloques, adapters, features, configuración.

**Cuándo actúa:** Cuando hay una historia `spec-lista` en la cola de prioridades.

**Output:** Código en una rama Git, PR para revisión.

**Lee antes de trabajar:**
- La historia (HU-XXX) con su spec
- `estandares/codigo.md`, `naming.md`
- El skill correspondiente a la tarea
- Specs del dominio relevante

---

## 3. Reviewer

| | |
|---|---|
| **Modelo** | Sonnet (Claude Code) |
| **Nivel** | 1 — actúa solo |
| **Ámbito** | Validación del output del Code Builder |

**Qué hace:** Revisa el código del Code Builder contra los estándares del proyecto. No escribe código — solo valida y reporta. Si algo no cumple, devuelve al Code Builder con los errores concretos.

**Cuándo actúa:** Automáticamente cuando el Code Builder termina su trabajo.

**Verifica:**
- Tests pasan y cobertura supera el umbral
- ESLint sin errores
- Nombrado sigue `naming.md`
- JSDoc en castellano en funciones exportadas
- Complejidad dentro de los límites
- Checklist específica del skill
- No hay `any`, no hay `style={}` inline, no hay valores mágicos

**Output:** OK (PR lista para revisión humana) o lista de errores (devuelve al Code Builder).

---

## 4. Content Generator

| | |
|---|---|
| **Modelo** | Sonnet (API server-side via Route Handlers) |
| **Nivel** | 2 — propone, humano confirma |
| **Ámbito** | Creación de contenido nuevo |

**Qué hace:** Genera textos de alojamientos, descripciones, propuestas de estructura de páginas, traducciones a N idiomas. Todo contenido pasa por revisión humana antes de publicarse en Payload.

**Cuándo actúa:** Cuando se necesita contenido nuevo para un cliente o para el site demo.

**Output:** Contenido propuesto para revisión. Nunca se publica sin aprobación.

**Regla inamovible:** Claude API siempre server-side via Next.js Route Handlers, nunca en el navegador.

---

## 5. Bulk Operator

| | |
|---|---|
| **Modelo** | Sonnet (API server-side) |
| **Nivel** | 2 — propone, humano confirma |
| **Ámbito** | Importación masiva y operaciones en lote |

**Qué hace:** Pipeline contenido-IA: scrape de sites existentes, parseo de documentos, catalogación de fotos, creación masiva de entidades en Payload. Propone el lote completo y espera confirmación antes de tocar la base de datos.

**Cuándo actúa:** Cuando se onboardea un nuevo cliente y hay que importar su contenido existente.

**Output:** Lote de contenido propuesto para revisión. Nunca modifica la BD sin aprobación.

---

## 6. Content Editor

| | |
|---|---|
| **Modelo** | Haiku (API server-side) |
| **Nivel** | 1-2 según el cambio |
| **Ámbito** | Ediciones en contenido existente |

**Qué hace:** Cambios puntuales en contenido ya publicado en Payload: corregir un título, actualizar un teléfono, reordenar bloques de una página.

**Nivel 1 (autónomo):** Cambios simples y verificables — corregir typo, actualizar dato factual, cambio que no altera el sentido del contenido.

**Nivel 2 (propone):** Cambios ambiguos — reescribir una descripción, reorganizar la estructura de una página, cambios que alteran el contenido visible.

**Output:** Contenido modificado directamente (nivel 1) o propuesta de cambio para revisión (nivel 2).

---

## Seguridad y SEO

No son agentes separados. Son estándares que todos los agentes cumplen:

- **Seguridad:** Definida en `estandares/seguridad.md` (pendiente). Reglas que el Code Builder sigue y el Reviewer verifica.
- **SEO:** Definido en `estandares/seo.md` (pendiente). Reglas que el Code Builder sigue y el Reviewer verifica.
- **Auditorías puntuales:** Skills `/audit-security` y `/audit-seo` que se lanzan bajo demanda, no en cada commit.
