# DEC-006 — Agentes y niveles de autonomía

**Fecha:** 2026-09-02 | **Estado:** Aceptada

## Decisión
Seis agentes con tres niveles de autonomía:

| Agente | Modelo | Nivel | Rol |
|--------|--------|-------|-----|
| Planner | Opus (claude.ai) | 3 | Arquitectura, specs, decisiones |
| Code Builder | Sonnet (Claude Code) | 2 | Implementa código |
| Reviewer | Sonnet (Claude Code) | 1 | Valida contra estándares |
| Content Generator | Sonnet (API) | 2 | Textos, traducciones |
| Bulk Operator | Sonnet (API) | 2 | Importación masiva |
| Content Editor | Haiku (API) | 1-2 | Ediciones puntuales |

Niveles:
- **1:** IA actúa sola — resultado verificable, riesgo bajo
- **2:** IA propone, humano confirma
- **3:** Humano inicia y dirige

Skills permiten automatización progresiva: nivel 3 → skill →
nivel 2 → skill maduro → nivel 1.

Retro obligatoria cuando una tarea necesita correcciones
significativas. La corrección se propaga al skill o estándar.

Seguridad y SEO no son agentes — son estándares que todos
los agentes cumplen y el Reviewer verifica.

## Por qué
SPECBOOT original (11 agentes, 6 fases) nunca funcionó bien.
Este modelo parte de roles funcionales reales con autonomía
gradual basada en madurez de skills, no en complejidad teórica.
