# Comandos y skills disponibles

Automatizaciones de Claude Code para el proyecto HWE. Cada comando tiene su
`.md` en esta carpeta; los skills viven en `../skills/`.

## Comandos

| Comando           | Qué hace                                                                     | Agente       |
| ----------------- | ---------------------------------------------------------------------------- | ------------ |
| `/import-figma`   | Clona y sella un repo Figma Make, y lanza su análisis                        | Code Builder |
| `/scaffold-block` | Crea la estructura de carpetas de un nuevo bloque en `@hwe-platform/core-ui` | Code Builder |

## Skills

| Skill            | Qué hace                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `analisis-figma` | Genera `analisis-figma.md` y `lenguaje-visual.md` de un cliente a partir de su export, con extractores deterministas que citan fichero y línea |

La diferencia: un comando es un procedimiento que se invoca; un skill se carga
cuando la tarea lo pide. `/import-figma` resuelve el repositorio y delega el
análisis en el skill, que también se usa por su cuenta al revisar un diseño.

## Uso

Desde Claude Code, ejecutar el comando con sus argumentos:

```
/import-figma https://github.com/org/figma-export.git
/scaffold-block HeroBlock --variants video,image
```

## Reglas

- Los comandos generan archivos, no los implementan. El Code Builder
  completa el contenido después.
- Nunca sobreescriben archivos existentes.
- Los edits en registries son manuales e intencionales.
- Los comandos leen los estándares de `docs/estandares/` antes de generar.
