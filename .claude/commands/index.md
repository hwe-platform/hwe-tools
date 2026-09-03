# Comandos disponibles

Comandos de Claude Code para automatizar tareas del proyecto HWE.
Cada comando tiene su archivo `.md` en esta carpeta.

## Lista de comandos

| Comando | Qué hace | Agente |
|---------|----------|--------|
| `/import-figma` | Clona un repo Figma Make, extrae tokens y bloques, genera documentos de análisis | Code Builder |
| `/scaffold-block` | Crea la estructura de carpetas de un nuevo bloque en `@hwe/core-ui` | Code Builder |

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
