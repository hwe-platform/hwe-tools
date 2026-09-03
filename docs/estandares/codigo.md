# Estándar de código

Reglas de código limpio, complejidad, documentación e imports para todo el proyecto HWE.

---

## Principios de código limpio

### Una función, una responsabilidad

Si necesitas la palabra "y" para describir lo que hace una función, son dos funciones.

```typescript
// ❌ Mal — hace dos cosas
function validateAndSaveBooking(data: BookingData) { ... }

// ✅ Bien — cada una hace una cosa
function validateBooking(data: BookingData): ValidationResult { ... }
function saveBooking(data: BookingData): Promise<Booking> { ... }
```

### Un componente, un propósito

Un componente React no debe buscar datos, transformarlos, validarlos y pintarlos. Buscar datos es responsabilidad de un Server Component o un hook. Transformar es una función pura aparte. Validar es Zod. El componente recibe props limpias y las renderiza.

### Retorno temprano, no anidación

```typescript
// ❌ Mal — anidación innecesaria
function getPrice(acc: Accommodation) {
  if (acc) {
    if (acc.pricing) {
      if (acc.pricing.perNight > 0) {
        return acc.pricing.perNight
      }
    }
  }
  return 0
}

// ✅ Bien — retorno temprano, flujo lineal
function getPrice(acc: Accommodation) {
  if (!acc?.pricing) return 0
  if (acc.pricing.perNight <= 0) return 0
  return acc.pricing.perNight
}
```

### Funciones puras siempre que sea posible

Una función pura recibe datos, devuelve datos, y no toca nada fuera de ella. Los mismos inputs siempre dan los mismos outputs. Las funciones con efectos secundarios (guardar en BD, llamar a API) se aíslan y se identifican claramente.

### Nombrar la intención, no la implementación

```typescript
// ❌ Mal — describe cómo, no qué
function loopAndCheck(items: Item[]) { ... }
function processData(data: unknown) { ... }

// ✅ Bien — describe qué resuelve
function filterActiveAccommodations(items: Accommodation[]) { ... }
function buildSeoMetadata(page: Page) { ... }
```

### Cero valores mágicos

```typescript
// ❌ Mal — ¿qué es 3?
if (status === 3) { ... }

// ✅ Bien — se entiende solo
if (status === BookingStatus.Confirmed) { ... }
```

Las constantes van con nombre descriptivo en UPPER_SNAKE_CASE y en un sitio centralizado.

### Composición sobre herencia

No crear componentes "dios" con 20 props y 15 variantes internas. Mejor componentes pequeños que se combinan.

```typescript
// ❌ Mal — un componente que hace todo
<AccommodationCard mode="compact" showPrice showGallery hideAmenities ... />

// ✅ Bien — componentes que se componen
<AccommodationCardCompact accommodation={data} />
<AccommodationCardFull accommodation={data} />
```

### Separación por capas

Cada capa habla solo con la inmediatamente adyacente, nunca salta niveles:
- Schemas de datos (Zod) no saben nada de React
- Adapters no saben nada de Payload
- Componentes no saben nada de la base de datos

### No abstraer prematuramente

- Aparece 1 vez — déjalo concreto
- Aparece 2 veces — vigílalo
- Aparece 3 veces — extráelo

Crear abstracciones "por si acaso" genera código muerto y complejidad innecesaria.

---

## Límites de complejidad (ESLint)

Estas reglas se aplican automáticamente. Si el código las supera, ESLint da error.

| Regla | Warning | Error | Qué significa |
|-------|---------|-------|---------------|
| `complexity` | 10 | 15 | Caminos posibles dentro de una función |
| `max-depth` | 3 | 4 | Niveles de `if` dentro de `if` dentro de `for`... |
| `max-lines` | 300 | 500 | Líneas por archivo |
| `max-lines-per-function` | 50 | 80 | Líneas por función |
| `max-params` | 3 | 4 | Parámetros de una función (si necesitas más, usa un objeto) |

Si una función o archivo supera estos límites, hay que dividirlo — no pedir una excepción.

---

## Documentación en código (JSDoc)

### Dónde poner JSDoc

- **Toda función exportada** — JSDoc obligatorio en castellano
- **Tipos y interfaces exportados** — JSDoc si el nombre no es suficiente
- **Código interno** (no exportado) — No JSDoc, el código se explica con buenos nombres
- **Comentarios `//`** — Solo para explicar el "por qué", nunca el "qué"

### Formato

```typescript
/**
 * Construye la URL del script del motor de reservas THR
 * a partir de las features contratadas por el cliente.
 *
 * @param features - Features activas del tenant
 * @returns URL completa del script THR
 *
 * @example
 * const url = buildThrScriptUrl({ search: true, favorites: true })
 * // "https://thelisresa.webcamp.fr/ilib4/..."
 */
export function buildThrScriptUrl(features: ThrFeatures): string {
```

- Descripción en castellano
- `@param` y `@returns` siempre
- `@example` cuando el uso no sea obvio
- No repetir lo que ya dicen los tipos — si el parámetro es `price: number`, no escribir `@param price - Número con el precio`

### Comentarios para el "por qué"

```typescript
// THR requiere categories como array stringificado, no array nativo.
// Ver: docs/specs/reservas/motores/thr-notes.md
const categories = JSON.stringify(['12'])
```

### Comentarios educativos (temporales)

Para patrones de Next.js/React no intuitivos, mientras el equipo aprende:

```typescript
// 'use client' — Este componente necesita interactividad del navegador
// (useState, eventos). Sin esta directiva, Next.js lo renderiza
// en el servidor donde useState no existe.
'use client'
```

Estos comentarios se reducirán a medida que el equipo gane experiencia.

### Mantenimiento del JSDoc

Es responsabilidad del agente desarrollador. Si modifica una función, actualiza su JSDoc. Un JSDoc desactualizado es peor que no tener JSDoc.

---

## Orden de imports

Orden fijo por grupos, separados por una línea en blanco. ESLint lo aplica automáticamente.

```typescript
// 1. React y Next.js (el framework)
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 2. Librerías externas (dependencias npm)
import { z } from 'zod'
import { cva } from 'class-variance-authority'

// 3. Paquetes internos del monorepo (@hwe-platform/*)
import { BlockRenderer } from '@hwe-platform/core-ui'

// 4. Código local del mismo proyecto (rutas relativas)
import { applyVAT } from '../utils/pricing'
import { AccommodationCard } from './AccommodationCard'

// 5. Tipos (siempre al final, con import type)
import type { Accommodation } from '@hwe-platform/core-ui'
import type { PageProps } from '../types'
```

### `import type` obligatorio

Cuando solo se importa un tipo (no código ejecutable), usar siempre `import type`. Reduce el tamaño del bundle y hace explícito qué es código y qué es tipado.

```typescript
// ❌ Mal — importa el tipo como si fuera código
import { Accommodation } from '@hwe-platform/core-ui'

// ✅ Bien — explícito: solo necesito el tipo
import type { Accommodation } from '@hwe-platform/core-ui'
```

---

## Dependencias externas

### No añadir dependencias sin justificación

Antes de instalar un paquete npm, preguntarse: ¿puedo resolver esto con código propio en menos de 50 líneas? Si sí, no instales la dependencia. Cada paquete nuevo es más peso en el bundle, más riesgo de seguridad, más mantenimiento de versiones, y más posibilidad de que quede abandonado.

### Dependencias justificadas

Las que resuelven problemas complejos que no tiene sentido reimplementar. Están en el stack por decisión explícita: Zod, Tailwind, Payload, Playwright, Swiper, next-intl, msw, class-variance-authority, lucide-react.

### Dependencias injustificadas

```typescript
// ❌ Mal — paquete para algo que el lenguaje ya hace
import { format } from 'date-fns'
format(date, 'dd/MM/yyyy')

// ✅ Bien — API nativa del navegador
new Intl.DateTimeFormat('es', { dateStyle: 'short' }).format(date)
```

```typescript
// ❌ Mal — paquete para 3 líneas de código
import slugify from 'slugify'

// ✅ Bien — función propia
const toSlug = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
```

### Regla para el agente

Si el Code Builder necesita una dependencia nueva, la justifica en la PR. Si no hay justificación, el Reviewer la rechaza.
