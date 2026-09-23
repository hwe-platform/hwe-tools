# Bloques de información

Especificaciones de los bloques del constructor de páginas para el
dominio de información.

## FAQBlock

**Función:** sección de preguntas frecuentes con comportamiento de
accordion. Bloque de referencia que consulta la colección `faqs`.
Genera automáticamente JSON-LD `FAQPage` para SEO (cuando HU-013
esté implementada).

**Patrón:** igual que Blog — el bloque configura qué preguntas
mostrar y cómo, pero los datos viven en la colección. Crear una
pregunta una vez, mostrarla en N páginas.

**Variantes:**

| Variante | Descripción | Eje |
|----------|-------------|-----|
| `accordion` | Lista vertical, una pregunta abierta a la vez | Estructural |
| `twoColumns` | Dos columnas de preguntas, todas visibles | Estructural |

Resolución por mapa (patrón estándar). Default: `accordion`.

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `blockType` | literal | `'faq'` | — |
| `variant` | enum | `accordion` | `accordion` o `twoColumns` |
| `title` | text, opcional, localized | — | Título de la sección |
| `subtitle` | text, opcional, localized | — | Subtítulo o descripción |
| `background` | enum | `default` | `default`, `muted`, `none` (patrón transversal) |
| `source` | enum | `all` | `all`, `byCategory`, `manual` |
| `category` | relationship → faq-categories | — | Solo si source = `byCategory` |
| `selectedFaqs` | relationship → faqs[] | — | Solo si source = `manual` |
| `limit` | number | 10 | Máximo de preguntas a mostrar |

**Resolución de source:**

- `all` → query a la colección `faqs` ordenada por `order`, limitada
  por `limit`
- `byCategory` → query con filtro `category === {category}`,
  ordenada por `order`
- `manual` → usa `selectedFaqs` directamente (el editor elige
  preguntas concretas del admin)

**El bloque no hace la query** — la hace el resolver del site-demo
(patrón de Blog: pre-fetch en server, inyectar items al bloque).

**Comportamiento del accordion:**

- Click en una pregunta la abre y cierra la anterior (un solo item
  abierto a la vez)
- Click en la pregunta abierta la cierra (todo cerrado)
- Primer item abierto por defecto al cargar
- Animación de apertura/cierre con `transition: max-height` o
  `grid-template-rows: 0fr → 1fr`
- Accesibilidad: `<details>/<summary>` nativo, o `aria-expanded` +
  `aria-controls` si el nativo no permite la animación
- Teclado: Enter/Space para abrir/cerrar, Tab para navegar

**Variante twoColumns:**

- CSS Grid: 2 columnas en desktop, 1 en mobile
- Todas las preguntas visibles (sin accordion)
- Pregunta como heading (`<h3>`), respuesta como párrafo debajo

**JSON-LD (futuro, HU-013):**

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuál es el horario de la piscina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La piscina está abierta de 9h a 20h..."
      }
    }
  ]
}
```

Se genera automáticamente desde los datos de la colección. No
requiere input del editor.

**Estructura de ficheros:**

```
packages/core-ui/src/blocks/faq/
├── faq.schema.ts
├── faq.types.ts
├── FaqBlock.tsx                ← resuelve variante por mapa
├── FaqAccordion.tsx            ← variante accordion
├── FaqTwoColumns.tsx           ← variante dos columnas
├── FaqItem.tsx                 ← item compartido (question + answer)
├── FaqBlock.test.tsx
└── index.ts
```

---

## EmbedBlock

**Función:** incrustar contenido externo (YouTube, Vimeo, Google Forms,
etc.) con compliance RGPD. Usa el mismo ConsentGate que MapBlock
(HU-018) para contenido que carga cookies.

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `blockType` | literal | `'embed'` | — |
| `title` | text, opcional, localized | — | Título de la sección |
| `embedType` | enum | `youtube` | `youtube`, `vimeo`, `iframe`, `html` |
| `url` | text | — | URL del contenido a incrustar |
| `aspectRatio` | enum | `16/9` | `16/9`, `4/3`, `1/1`, `auto` |
| `maxWidth` | enum | `full` | `narrow` (640px), `medium` (960px), `full` (100%) |
| `requiresConsent` | boolean | true | ¿Necesita consentimiento RGPD? |
| `consentCategory` | text | `marketing` | Categoría de Cookiebot |
| `caption` | text, opcional, localized | — | Texto debajo del embed |

**Comportamiento:**

- YouTube: URL normal → URL nocookie
  (`youtube.com/watch?v=X` → `youtube-nocookie.com/embed/X`)
- Vimeo: URL normal → URL embed
  (`vimeo.com/123` → `player.vimeo.com/video/123`)
- `iframe`: URL directa con `sandbox` restrictivo
- `html`: snippet pegado directamente. Siempre `requiresConsent: true`.
  Sanitizado con allowlist de tags

**RGPD:**

Envuelto en `ConsentGate` (HU-018):

- Sin consent → placeholder con thumbnail y texto
  "Acepta las cookies para ver este contenido"
- Con consent → carga el iframe/embed
- `requiresConsent: false` solo para contenido propio sin cookies

**Estructura de ficheros:**

```
packages/core-ui/src/blocks/embed/
├── embed.schema.ts
├── embed.types.ts
├── EmbedBlock.tsx
├── EmbedYouTube.tsx
├── EmbedVimeo.tsx
├── EmbedIframe.tsx
├── EmbedBlock.test.tsx
└── index.ts
```

---

## CTA (ya implementado)

Llamada a la acción con título, subtítulo y botones. Implementado en
HU-010. Schema: `title`, `subtitle`, `links[]` con variant de Button.

---

## RichText (ya implementado)

Contenido editorial Lexical. Implementado en HU-010. Payload gestiona
el editor; core-ui renderiza el HTML resultante.