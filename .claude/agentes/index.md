# Agentes

Definición de los agentes IA que operan sobre el proyecto HWE.

## Documentos

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| [definiciones.md](definiciones.md) | Los 6 agentes: Planner, Code Builder, Reviewer, Content Generator, Bulk Operator, Content Editor | ✅ Definido |
| [code-builder.md](code-builder.md) | Instrucciones operativas del Code Builder | ✅ Definido |
| [../agents/reviewer.md](../agents/reviewer.md) | Instrucciones operativas del Reviewer | ✅ Definido |
| Researcher | Haiku (Claude Code subagente) | 1 | Busca en el repo sin inflar el contexto del Code Builder |
## Documentos frente a agentes

Esta carpeta describe **roles**. Un rol no se ejecuta: es prosa que alguien
lee. Los agentes que Claude Code puede lanzar viven en `agents/` —en inglés,
que es la carpeta que la herramienta escanea— con *frontmatter*. Hoy hay uno:
el Reviewer, el único de nivel 1 en DEC-006.

**Esta copia no se ejecuta.** Claude Code solo mira
`<proyecto>/.claude/agents/`, y dentro de `hwe-core` este repositorio cuelga
de `docs/`, así que lo que corre es la copia de `hwe-core/.claude/agents/`.
Esta es la canónica —la que se edita— y hay que espejarla a mano, igual que
los comandos y los skills. Sus rutas son relativas a `hwe-core`, que es desde
donde el agente ejecuta.

Los demás pasan a `agents/` cuando su skill madure, como manda la decisión —
no antes. Escribirlos como agentes sin skill detrás fue lo que hundió el modelo
anterior de once agentes.
