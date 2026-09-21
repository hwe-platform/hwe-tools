# Reviewer

Las instrucciones operativas del Reviewer viven en
[`../agents/reviewer.md`](../agents/reviewer.md).

Están ahí y no aquí porque el Reviewer es **el único agente que se ejecuta**:
DEC-006 le da nivel 1 —actúa solo, porque su resultado es objetivo— y Claude
Code descubre los subagentes en `.claude/agents/`, con *frontmatter*. Un
documento en `agentes/` es una descripción de rol; uno en `agents/` es un
agente invocable.

Lo dispara la regla 7 de `CLAUDE.md` en `hwe-core`: ninguna historia se
presenta como terminada sin pasar por él.

Los demás roles siguen definidos en esta carpeta porque no se ejecutan como
subagentes: el Planner opera desde claude.ai, y el Code Builder es la propia
sesión de Claude Code.
