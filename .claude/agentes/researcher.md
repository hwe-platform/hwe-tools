# Researcher

Las instrucciones operativas del Researcher viven en
[`../agents/researcher.md`](../agents/researcher.md).

Subagente de investigación en Haiku que busca en el repo sin inflar
el contexto del Code Builder. Solo lee, no modifica archivos.
Lo invoca el Code Builder cuando necesita localizar usos, callers,
o información en specs sin cargar archivos enteros en su contexto.