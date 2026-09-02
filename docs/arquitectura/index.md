# Arquitectura del sistema

Documentación técnica de cómo funciona HWE internamente.

## Documentos

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| [metodologia.md](metodologia.md) | Niveles de autonomía, ciclo de vida de historias, retroalimentación y skills | ✅ Definido |
| [bloques.md](bloques.md) | Arquitectura de bloques: page builder, schemas Zod, registry, variantes | ✅ Definido |
| [booking.md](booking.md) | Sistema de reservas | 🔲 Pendiente |
| [payload.md](payload.md) | Modelo de datos — Payload CMS | 🔲 Pendiente |
| [tokens.md](tokens.md) | Sistema de tokens de diseño: pipeline Figma → CSS, capas de theming | ✅ Definido |
| [despliegue.md](despliegue.md) | Despliegue e infraestructura | 🔲 Pendiente |
| [personalizacion.md](personalizacion.md) | Personalización por segmento | 🔲 Pendiente |
| [contenido-ia.md](contenido-ia.md) | Pipeline de gestión de contenido | 🔲 Pendiente |
| [paginas-routing.md](paginas-routing.md) | Páginas y routing: catch-all, resolución, multilingüe, breadcrumbs, ISR | ✅ Definido |

Las decisiones arquitectónicas (DECs) viven en [../decisiones/index.md](../decisiones/index.md), no aquí.

El modelo de dominio está cubierto por las specs de cada dominio en [../../specs/index.md](../../specs/index.md). La trazabilidad (commits, ramas, historias) está cubierta por [../estandares/commits.md](../estandares/commits.md) y [metodologia.md](metodologia.md).
