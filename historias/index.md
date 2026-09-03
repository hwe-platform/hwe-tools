# Historias de usuario

Cola de prioridades del proyecto. Los agentes de nivel 2 consultan
esta tabla para saber qué es lo siguiente.

---

## Cola de prioridades

| ID | Título | Hito | Prioridad | Estado | Agente | Rama | Dependencias |
|----|--------|------|-----------|--------|--------|------|--------------|
| HU-001 | Configurar hwe-core como monorepo con paquetes publicables | 1 | 1 | spec-lista | — | — | — |
| HU-002 | Configurar hwe-template con Next.js + Payload CMS | 1 | 1 | spec-lista | — | — | HU-001 |
| HU-003 | Conectar hwe-tools como submodule en hwe-core y hwe-template | 1 | 2 | spec-lista | — | — | HU-001, HU-002 |
| HU-004 | Schemas Zod de todas las colecciones y globals de Payload | 1 | 1 | spec-lista | — | — | HU-001 |
| HU-005 | Colecciones y globals de Payload derivadas de schemas Zod | 1 | 1 | spec-lista | — | — | HU-002, HU-004 |
| HU-006 | Sistema de tokens y primitivas base | 1 | 2 | spec-lista | — | — | HU-001 |
| HU-007 | Layout components (TopBar, SecondaryNav, Footer, MobileMenu, Banner) | 1 | 2 | spec-lista | — | — | HU-005, HU-006 |
| HU-008 | BlockRenderer, registry de bloques y catch-all routing | 1 | 1 | spec-lista | — | — | HU-005, HU-006 |
| HU-009 | Bloques Hero y MediaText | 1 | 2 | spec-lista | — | — | HU-008 |
| HU-010 | Bloques IconGrid, CardGrid y ReviewsGrid | 1 | 3 | spec-lista | — | — | HU-008 |
| HU-011 | Bloques Gallery, Map, SpecBar y EquipmentList | 1 | 3 | spec-lista | — | — | HU-008 |
| HU-012 | Crear site demo con contenido real y deploy en Vercel | 1 | 3 | spec-lista | — | — | HU-007, HU-009, HU-010, HU-011 |

### Orden de ejecución

1. **Prioridad 1 (en paralelo):** HU-001 (hwe-core) + HU-002 (hwe-template)
2. **Prioridad 1 (tras HU-001):** HU-004 (schemas Zod)
3. **Prioridad 1 (tras HU-002 + HU-004):** HU-005 (colecciones Payload)
4. **Prioridad 1 (tras HU-005 + HU-006):** HU-008 (renderer + routing)
5. **Prioridad 2 (tras HU-001):** HU-003 (submodule) + HU-006 (tokens + primitivas)
6. **Prioridad 2 (tras HU-005 + HU-006):** HU-007 (layout)
7. **Prioridad 2 (tras HU-008):** HU-009 (hero + mediatext)
8. **Prioridad 3 (tras HU-008):** HU-010 (grids) + HU-011 (gallery + map + detail)
9. **Prioridad 3 (tras todo):** HU-012 (site demo)

---

## Estados

```
idea → spec-pendiente → spec-lista → en-curso → en-revisión → hecha
                                         ↓            ↓
                                         └─── bloqueada
```

Ver `docs/arquitectura/metodologia.md` para el detalle de cada estado
y el ciclo de retroalimentación.

---

## Template de historia

Cada historia es un archivo `HU-XXX-descripcion-corta.md` en esta carpeta.
Todas siguen esta estructura:

```markdown
---
id: HU-XXX
titulo: Título corto y descriptivo
estado: idea | spec-pendiente | spec-lista | en-curso | en-revisión | hecha | bloqueada
prioridad: 1-5 (1 = máxima)
hito: 1
agente: — | code-builder | content-generator | bulk-operator
rama: — | feat/HU-XXX-descripcion
dependencias: [HU-YYY, HU-ZZZ]
---

## Contexto

Por qué existe esta historia. Una o dos frases de negocio, no técnicas.
Qué problema resuelve o qué habilita.

## Qué hacer

Pasos concretos. No prosa, no ambigüedades. El agente lee esto y sabe
exactamente qué archivos crear, qué modificar, qué estructura seguir.

1. Primer paso
2. Segundo paso
3. Tercer paso

## Leer antes

Lista de docs y specs que el agente debe leer antes de empezar:

- docs/estandares/codigo.md
- docs/arquitectura/bloques.md
- (los que apliquen a esta historia)

## Criterios de aceptación

Checklist verificable. Cada ítem se contesta sí o no.
Es lo que el Reviewer comprueba.

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## Retrospectiva

_(vacía al crear — se llena si la historia necesitó correcciones significativas)_

### Qué falló
### Causa raíz
### Corrección aplicada
```

---

## Reglas

- **Nombrado:** `HU-XXX-descripcion-corta.md` (ej: `HU-010-configurar-template.md`)
- **Prioridad:** 1 = máxima, 5 = mínima. Dentro del mismo valor, el orden lo decide el Planner.
- **Dependencias:** si una historia depende de otra, no puede pasar a `spec-lista` hasta que la dependencia esté `hecha`.
- **Un agente por historia:** una historia la ejecuta un solo agente. Si necesita trabajo de varios, se divide en historias separadas.
- **Tabla actualizada:** cada cambio de estado de una historia se refleja en la tabla de arriba. El agente que cambia el estado actualiza la tabla.
- **Retrospectiva obligatoria:** cuando una historia necesita correcciones significativas. La corrección se propaga al skill o estándar correspondiente (ver `docs/arquitectura/metodologia.md`).
