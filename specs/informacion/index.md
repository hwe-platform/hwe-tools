# Dominio: Información

Especificaciones de los bloques de información: contenido editorial,
preguntas frecuentes, incrustaciones externas y llamadas a la acción.

## Principio: todo es base de conocimiento

Todo el contenido de Payload es base de conocimiento para la IA del
Hito 2. Los alojamientos responden a "¿Tenéis un cottage para 6
con AC?", las entidades a "¿La piscina tiene tobogán?", las FAQ a
"¿A qué hora puedo hacer check-in en diciembre?".

Las FAQ son el caso que necesita más metadatos de contexto porque una
misma pregunta puede tener respuestas distintas según temporada,
audiencia o período de validez. Las otras colecciones ya tienen sus
campos de dominio (specs, schedule, features) que la IA usará
directamente para retrieval.

## Bloques del dominio

| Bloque | Función | Estado |
|--------|---------|--------|
| CTA | Llamada a la acción con botones | ✅ Implementado |
| RichText | Contenido editorial Lexical | ✅ Implementado |
| [FAQ](bloques/index.md#faqblock) | Preguntas frecuentes con accordion | Placeholder |
| [Embed](bloques/index.md#embedblock) | Contenido externo incrustado (YouTube, etc.) | Placeholder |

## Datos

### Colección `faqs`

Las FAQ viven en una colección propia. Cada pregunta se crea una vez
y se puede mostrar en N páginas. Además de alimentar el bloque FAQ,
son la fuente primaria de retrieval para la IA conversacional.

**Campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `question` | text, required, localized | La pregunta |
| `answer` | richText, required, localized | La respuesta (Lexical) |
| `category` | relationship → faq-categories | Categoría para filtrado |
| `order` | number, default 0 | Orden dentro de su categoría |

**Campos de contexto (para IA — opcionales en Hito 1):**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `season` | text, opcional | — | Valor de `data-season` del cliente ("summer", "ski"...). Vacío = aplica siempre |
| `validFrom` | date, opcional | — | Desde cuándo aplica esta respuesta |
| `validTo` | date, opcional | — | Hasta cuándo aplica |
| `audience` | text, opcional | — | Segmento de audiencia del Hito 3. Vacío = aplica a todos |
| `tags` | text[], opcional | — | Etiquetas libres para retrieval ("horarios", "precios", "normativa") |

Los valores de `season` y `audience` no son enums fijos — cada cliente
define los suyos. Los mismos valores se usan en los tokens CSS
(`data-season`), en la personalización (`data-segment`, Hito 3) y
aquí para filtrar contenido. Un solo sistema, no tres.

Estos campos permiten que la misma pregunta tenga varias respuestas
según contexto:

| question | season | answer |
|----------|--------|--------|
| ¿Horario de check-in? | summer | 14h a 20h |
| ¿Horario de check-in? | winter | 16h a 18h |

La IA detecta la fecha actual, filtra por `season` o `validFrom/validTo`,
y da la respuesta correcta. El bloque FAQ en la web puede mostrar
ambas o solo la vigente.

En Hito 1 el editor no tiene que rellenar estos campos — tienen
defaults sensatos. La colección los tiene listos para cuando la IA
los necesite.

### Colección `faq-categories`

Categorías propias de FAQ, separadas de las categorías de alojamientos
y entidades.

**Campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | text, required, localized | Nombre: "Piscina", "Check-in" |
| `slug` | text, auto desde name | Para URLs y filtrado |
| `order` | number, default 0 | Orden de visualización |

### Patrón Blog

Es el mismo patrón que Blog: Blog consulta `articles`, FAQ consulta
`faqs` filtrable por `faq-categories`.