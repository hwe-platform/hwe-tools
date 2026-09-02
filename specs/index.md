# Specs técnicas

Especificaciones funcionales y técnicas organizadas por dominio.
Cada spec define cómo funciona una parte del sistema.

---

## Estado de specs por dominio

### payload/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| [modelo-datos.md](payload/modelo-datos.md) | Colecciones, globals, relaciones | ✅ Definido |
| [localizacion.md](payload/localizacion.md) | Multilingüe por campo, fallback, next-intl | ✅ Definido |

### alojamientos/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| bloques/ | Specs de bloques de alojamiento | 🔲 Pendiente |

### presentacion/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| bloques/ | Specs de bloques de presentación | 🔲 Pendiente |

### informacion/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| bloques/ | Specs de bloques informativos | 🔲 Pendiente |

### reservas/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| motores/ | THR, Witbooking, Mastercamping | 🔲 Pendiente |
| bloques/ | Specs de bloques de reservas | 🔲 Pendiente |

### contenido-ia/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| importacion-web.md | Scraping de webs existentes | 🔲 Pendiente |
| importacion-docs.md | Parseo de documentos del cliente | 🔲 Pendiente |
| catalogacion-media.md | Catalogación automática de fotos | 🔲 Pendiente |
| generacion.md | Generación de textos y traducciones | 🔲 Pendiente |
| revision.md | Flujo de revisión humana | 🔲 Pendiente |

### personalizacion/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| segmentos.md | Definición de segmentos de visitante | 🔲 Pendiente |
| señales.md | Señales de detección (época, IP, búsqueda) | 🔲 Pendiente |
| contenido-adaptado.md | Variantes de contenido por segmento | 🔲 Pendiente |
| pagina-ia.md | Página noindex con personalización completa | 🔲 Pendiente |

### geo/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| bloques/ | Map, PitchMap, Weather | 🔲 Pendiente |

### seo-geo/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| schemas/ | Templates JSON-LD | 🔲 Pendiente |
| llms/ | robots.txt, llms.txt | 🔲 Pendiente |

### seguridad/

| Archivo | Contenido | Estado |
|---------|-----------|--------|
| — | Reglas de seguridad técnica | 🔲 Pendiente |

---

## Template de spec

Todas las specs siguen esta estructura. No todas las secciones son
obligatorias — se incluyen las que apliquen.

```markdown
---
titulo: Nombre descriptivo de la spec
fecha: 2026-09-02
estado: borrador | definido | implementado | obsoleto
dominio: payload | bloques | reservas | personalizacion | contenido-ia | seo-geo | seguridad
hito: 1
relacionado:
  - docs/arquitectura/bloques.md
  - specs/payload/modelo-datos.md
---

## Contexto

Qué problema resuelve esta spec y para quién.
Una o dos frases que sitúan al lector.

## Decisiones

Las decisiones tomadas para esta spec.
Referencia a DECs si aplica.

## Modelo / Estructura

La definición técnica. Campos, relaciones, flujos, schemas.
El corazón de la spec.

## Ejemplos

Al menos un caso real basado en el Figma o en un cliente tipo.
Los ejemplos concretos eliminan ambigüedad.

## Qué NO cubre

Límites explícitos. Qué queda fuera de esta spec para que nadie
asuma más de lo que define.

## Notas de implementación

Detalles prácticos para el Code Builder.
Qué leer antes, qué tener en cuenta, qué trampas evitar.
```

---

## Reglas

- **Nombrado:** kebab-case, descriptivo (ej: `modelo-datos.md`, no `spec-001.md`)
- **Un tema por spec:** si una spec crece demasiado, se divide
- **Ejemplos obligatorios:** toda spec debe tener al menos un ejemplo concreto
- **Estado actualizado:** cuando se implementa o cambia, se actualiza el estado
- **Relacionado:** siempre listar las specs y docs que complementan esta
- **Las specs de bloques se crean bajo demanda** cuando un Figma o una historia las requiere, no como lista fija
