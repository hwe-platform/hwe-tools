---
titulo: Schema FAQPage
capa: 2 (específica)
schema-types: FAQPage
datos-de: bloque FAQ de la página
---

## Cuándo se genera

Cuando una página contiene un bloque de tipo `faq`. Se genera
desde las preguntas y respuestas del bloque, no de una colección.

Google muestra las preguntas directamente en los resultados de
búsqueda como desplegables — es uno de los rich results más
visibles.

## Campos

| Campo | Nivel | Dato de Payload | Notas |
|-------|-------|----------------|-------|
| `@type` | Obligatorio | — | Siempre `"FAQPage"` |
| `mainEntity` | Obligatorio | Array de preguntas del bloque FAQ | |

Cada pregunta:

| Campo | Nivel | Notas |
|-------|-------|-------|
| `@type` | Obligatorio | `"Question"` |
| `name` | Obligatorio | La pregunta (texto) |
| `acceptedAnswer.@type` | Obligatorio | `"Answer"` |
| `acceptedAnswer.text` | Obligatorio | La respuesta (texto plano del richText) |

## Ejemplo

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Le camping accepte-t-il les animaux ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, les animaux de compagnie sont acceptés dans certains emplacements et mobil-homes. Un supplément de 5€ par nuit s'applique."
      }
    },
    {
      "@type": "Question",
      "name": "Quelles sont les dates d'ouverture ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le camping est ouvert du 1er avril au 30 septembre. La réception est ouverte de 8h à 20h en haute saison."
      }
    },
    {
      "@type": "Question",
      "name": "Y a-t-il un accès direct à la plage ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, un chemin piéton de 800 mètres mène directement à la plage de Capbreton depuis le camping."
      }
    }
  ]
}
```

## Campos condicionales

- Si el bloque FAQ no tiene preguntas, no generar el schema
- `acceptedAnswer.text` debe ser texto plano — convertir el richText de Lexical a string sin HTML
- Si una pregunta no tiene respuesta, no incluirla en el array
- Cada página puede tener un solo FAQPage — si hay varios bloques FAQ, se combinan en uno
