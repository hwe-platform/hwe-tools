# Metodología de trabajo

Cómo se organiza el trabajo en HWE: niveles de autonomía, ciclo de vida de historias, y mejora continua.

---

## Niveles de autonomía

### Nivel 1 — La IA actúa sola

Tareas donde el resultado es verificable objetivamente y el riesgo es bajo. La IA ejecuta sin intervención humana.

**Ejemplos:** corregir un test que falla, aplicar formateo, ejecutar checklists de verificación contra estándares, actualizar una referencia en un documento.

**Requisito:** el resultado se puede validar automáticamente (tests pasan, ESLint sin errores, checklist cumplida).

### Nivel 2 — La IA propone, humano confirma

La IA analiza el estado del proyecto, decide qué es lo siguiente según las prioridades, prepara la propuesta y espera aprobación.

**Ejemplos:** implementar un bloque, importar contenido de un cliente, proponer estructura de una página, crear traducciones, generar textos.

**Flujo:** el agente presenta su plan (qué va a hacer, qué archivos toca, qué enfoque), el humano aprueba o corrige, el agente ejecuta.

### Nivel 3 — Humano inicia y dirige

Decisiones de producto, cambios de prioridad, definiciones nuevas, debates de arquitectura. La IA no puede tomar estas decisiones sola.

**Ejemplos:** definir specs de bloques, priorizar historias, decidir modelo de datos, debatir trade-offs técnicos.

**Dónde:** claude.ai (Planner). Los documentos resultantes alimentan los niveles 1 y 2.

### Automatización progresiva

Todo empieza en nivel 3. Cuando el patrón se estabiliza, se crea un skill. El skill permite que la siguiente tarea similar baje a nivel 2. Si el skill es fiable y el resultado verificable automáticamente, baja a nivel 1.

```
Nivel 3 (debatir y definir)
    ↓ se crea skill
        ↓ Nivel 2 (proponer y confirmar)
            ↓ skill maduro + resultado verificable
                ↓ Nivel 1 (autónomo)
```

---

## Ciclo de vida de una historia

Cada historia de usuario (HU-XXX) pasa por estos estados:

```
idea → spec-pendiente → spec-lista → en-curso → en-revisión → hecha
                                         ↓            ↓
                                         └─── bloqueada
```

| Estado | Qué significa | Quién actúa |
|--------|---------------|-------------|
| `idea` | Necesidad identificada, solo título y frase | — |
| `spec-pendiente` | Priorizada, falta definir la spec técnica | Planner (Nivel 3) |
| `spec-lista` | Spec aprobada, lista para implementar | — |
| `en-curso` | Un agente está trabajando en ella | Code Builder (Nivel 2) |
| `en-revisión` | PR abierta esperando aprobación humana | Humano |
| `hecha` | Mergeada a main, verificada, cerrada | — |
| `bloqueada` | Dependencia externa impide avanzar | — |

### Frontmatter de una historia

```yaml
---
id: HU-010
titulo: Bloque hero con variantes
estado: spec-lista
prioridad: 1
hito: 1
agente: —
rama: —
---
```

### Cola de prioridades

El agente de nivel 2 consulta las historias, ordena por prioridad, filtra por `spec-lista`, y propone la siguiente. El `index.md` de `historias/` contiene la tabla resumen.

---

## Flujo de implementación

```
1. Planner define spec (nivel 3, claude.ai)
2. Historia marcada spec-lista
3. Code Builder lee la historia, los estándares y el skill
4. Code Builder presenta plan → humano aprueba
5. Code Builder implementa → estado en-curso
6. Reviewer valida automáticamente (nivel 1)
     → si falla → devuelve al Code Builder con errores
     → si pasa → PR lista
7. Humano revisa la PR (producto, no código)
     → si OK → merge, estado hecha
     → si hay problemas → corrección + retro
```

---

## Retroalimentación

Cuando una tarea necesita correcciones significativas (no un typo, sino un error de enfoque):

### 1. Se corrige la tarea

La PR se ajusta y se vuelve a presentar.

### 2. Se documenta la retro

Al final de la historia, sección `## Retrospectiva`:

```markdown
## Retrospectiva

### Qué falló
El agente generó estilos inline en vez de usar clases Tailwind.

### Causa raíz
El skill /scaffold-block no mencionaba explícitamente que los estilos
van siempre con clases Tailwind, nunca con style={}.

### Corrección aplicada
Actualizado el skill /scaffold-block: añadida regla "nunca usar
estilos inline, siempre clases Tailwind v4".
```

### 3. Se propaga la corrección

El error se corrige en su origen:

- Si es automatizable — nueva regla de ESLint o test
- Si no es automatizable — nuevo paso en la checklist del skill
- Si es un estándar — se actualiza el documento en `estandares/`

### 4. Se verifica en la siguiente tarea

La siguiente tarea del mismo tipo valida que la corrección funcionó. Si el mismo error reaparece, se escala a test automático o regla ESLint.

---

## Skills

Un skill es una receta paso a paso que un agente sigue para ejecutar un tipo de tarea. Viven en `.claude/skills/`.

### Estructura de un skill

```markdown
# Nombre del skill

## Cuándo se usa
Descripción de qué tareas resuelve.

## Pasos
1. Leer X
2. Crear Y
3. Verificar Z

## Checklist de entrega
- [ ] Tests pasan
- [ ] ESLint sin errores
- [ ] Nombrado sigue naming.md
- [ ] JSDoc en castellano en funciones exportadas
- [ ] (ítems específicos del skill, crecen con las retros)
```

### Ciclo de vida de un skill

1. No existe — la tarea se hace en nivel 3 (debatir y definir)
2. Se crea el skill con el primer caso real
3. Se usa en nivel 2 en las siguientes tareas
4. Se mejora con cada retro
5. Cuando es fiable y verificable — la tarea baja a nivel 1
