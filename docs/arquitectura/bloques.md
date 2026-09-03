# Arquitectura de bloques

Sistema de page builder propio construido en Next.js 16 + React 19 + TypeScript,
con Zod como fuente de verdad y Payload CMS como gestor de contenido.

---

## Estructura de carpetas

### En `@hwe-platform/core-ui` (bloques de plataforma)

```
@hwe-platform/core-ui/src/
├── blocks/
│   └── {name}/
│       ├── {Name}Block.tsx           — componente principal (resuelve variante)
│       ├── {Name}{Variant}.tsx       — variante estructural (si aplica)
│       ├── {name}.schema.ts          — schema Zod (content + config)
│       ├── {name}.types.ts           — tipos derivados (z.infer)
│       ├── {Name}Block.test.tsx      — tests
│       └── index.ts                  — export público
├── renderer/
│   ├── BlockRenderer.tsx             — el switcher
│   └── blockRegistry.ts             — registro de bloques disponibles
├── primitives/                       — Button, Image, Icon, Link
├── layout/                           — TopBar, SecondaryNav, Footer, MobileMenu, Banner
├── adapters/                         — conexión a servicios externos (booking)
└── theme/                            — token contract
```

### En el site del cliente (overrides y bloques custom)

```
hwe-client-{slug}/
└── src/
    ├── blocks/                       — solo bloques personalizados
    │   └── {name}/
    │       ├── {Name}Block.tsx
    │       ├── {Name}Block.test.tsx
    │       └── index.ts
    └── block-registry.ts            — extiende el registry de plataforma
```

---

## Flujo de datos

```
Payload blocks field
    ↓ Next.js Server Component (fetch via Local API)
    ↓ BlockRenderer
    ↓ busca en registry (cliente → plataforma)
    ↓ {Name}Block
    ↓ resuelve variante
    ↓ render
```

### Paso a paso

1. El editor monta los bloques en Payload admin: elige tipo, llena campos,
   ordena arrastrando.
2. Payload guarda un array de bloques con `blockType` y datos en la BD.
3. El Server Component de la página hace fetch via Local API de Payload
   (acceso directo a DB, sin HTTP).
4. BlockRenderer recorre el array. Para cada bloque, busca el componente
   en el registry.
5. El bloque recibe los datos como `unknown`, los valida con `safeParse`
   de su schema Zod, y renderiza.

---

## Schema Zod — Fuente de verdad

Cada bloque define su schema Zod. Los tipos TypeScript siempre se infieren
del schema, nunca se escriben a mano.

```typescript
// hero.schema.ts
import { z } from 'zod'

export const heroSchema = z.object({
  blockType: z.literal('hero'),
  variant: z.enum(['video', 'image']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  media: z.string(), // URL de la imagen o vídeo
  showBreadcrumbs: z.boolean().default(false),
})
```

```typescript
// hero.types.ts
import type { z } from 'zod'
import type { heroSchema } from './hero.schema'

export type HeroBlockData = z.infer<typeof heroSchema>
```

Payload deriva sus configs de estos schemas (DEC-004). No al revés.

### Stub en `pages.schema.ts` vs. schema completo del bloque

`pages.schema.ts` (en `@hwe-platform/core-ui/src/schemas/collections/`) define
la unión discriminada `pageBlockSchema` con los `blockType` de todos los
bloques disponibles, para que `pages.blocks` valide qué tipo de bloque es cada
entrada. Antes de que un bloque exista de verdad (HU-009 en adelante), su
entrada en esa unión es un stub — solo `z.object({ blockType: z.literal('hero') })`,
sin campos de contenido.

Cuando el bloque se construye, su schema completo (con todos los campos, como
el `heroSchema` de arriba) se define en `blocks/{name}/{name}.schema.ts` y
sustituye al stub dentro de la unión de `pages.schema.ts`. El schema del
bloque vive junto a su componente, no en `pages.schema.ts` — este último solo
compone la unión.

---

## Variantes

### Variantes estructurales — componentes separados

Cuando la diferencia entre variantes es la estructura del HTML
(layout diferente, elementos diferentes), son componentes separados:

```
blocks/hero/
├── HeroBlock.tsx         — resuelve qué variante renderizar
├── HeroVideo.tsx         — hero con vídeo de fondo
└── HeroImage.tsx         — hero con imagen + overlay
```

```typescript
// HeroBlock.tsx
import { HeroVideo } from './HeroVideo'
import { HeroImage } from './HeroImage'

const variants = {
  video: HeroVideo,
  image: HeroImage,
} as const

export function HeroBlock({ data }: { data: HeroBlockData }) {
  const Component = variants[data.variant]
  return <Component data={data} />
}
```

La resolución es siempre por mapa, nunca `if/switch`.

### Variantes de estilo — CVA o clases Tailwind

Cuando la diferencia es solo visual (colores, tamaños, spacing),
se resuelve con CVA (Class Variance Authority) o clases Tailwind
directamente. No se crean componentes separados para esto.

```typescript
// Ejemplo CVA para un botón con variantes de estilo
const buttonVariants = cva('inline-flex items-center font-bold rounded-2xl', {
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground',
      outline: 'border-2 border-secondary text-secondary',
    },
  },
})
```

---

## Registry de dos niveles

### Registry de plataforma (`@hwe-platform/core-ui`)

```typescript
// blockRegistry.ts
import { HeroBlock } from '../blocks/hero'
import { MediaTextBlock } from '../blocks/media-text'
import { IconGridBlock } from '../blocks/icon-grid'
// ...

export const blockRegistry: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  mediaText: MediaTextBlock,
  iconGrid: IconGridBlock,
  // ...
}
```

### Registry del cliente (override)

```typescript
// block-registry.ts del cliente
import { blockRegistry as baseRegistry } from '@hwe-platform/core-ui'
import { HeroBlock } from './blocks/hero'

export const blockRegistry = {
  ...baseRegistry,
  hero: HeroBlock, // Su Hero reemplaza el de plataforma
}
```

### Resolución

```typescript
// BlockRenderer.tsx
const Component = clientRegistry[block.blockType]
  ?? baseRegistry[block.blockType]

if (!Component) {
  console.warn(`Bloque desconocido: ${block.blockType}`)
  return null
}
```

Cliente tiene prioridad. Si no existe en el cliente, usa plataforma.
Si no existe en ninguno, warning y no renderiza.

---

## Tres niveles de uso por cliente

### Re-export directo (~80%)

El cliente usa el bloque de plataforma tal cual. La personalización
visual viene de los tokens (colores, tipografía, radios). No toca código.

### Override parcial (~15%)

El cliente registra su propia versión del bloque. Puede importar
piezas del bloque de plataforma (primitivas, schemas) y cambiar
solo lo que necesita.

Si la variante es reutilizable por otros clientes, se promueve
a `@hwe-platform/core-ui` como variante nueva en vez de dejarla en el cliente.

### Full custom (~5%)

El cliente crea un bloque nuevo que no existe en la plataforma.
Define su schema Zod, su componente, sus tests, y lo registra
en su registry. No toca `@hwe-platform/core-ui`.

Si con el tiempo otros clientes lo necesitan, se promueve
a la plataforma.

---

## Dos tipos de bloques

### Bloques de contenido propio

El editor configura los datos directamente en Payload. Los datos
viven dentro del bloque.

Ejemplos: Hero (título, media, variante), MediaText (imagen, texto,
orientación), FAQ (preguntas y respuestas).

### Bloques de referencia

No contienen datos sino una configuración de query a una colección.
El frontend consulta la colección y renderiza.

Ejemplos: AccommodationsGrid (muestra alojamientos destacados),
ServicesGrid (muestra entidades tipo service), Blog (muestra
últimos artículos).

```typescript
// Ejemplo: schema de un bloque de referencia
export const blogBlockSchema = z.object({
  blockType: z.literal('blog'),
  title: z.string().optional(),
  source: z.enum(['latest', 'featured', 'byCategory']),
  category: z.string().optional(),
  limit: z.number().default(3),
  showMoreLink: z.boolean().default(false),
  showMoreUrl: z.string().optional(),
})
```

---

## BlockRenderer

Componente central que recorre un array de bloques y renderiza
cada uno con su componente correspondiente.

```typescript
// BlockRenderer.tsx (simplificado)
import { blockRegistry } from './blockRegistry'

interface BlockInstance {
  blockType: string
  id: string
  [key: string]: unknown
}

interface BlockRendererProps {
  blocks: BlockInstance[]
  customRegistry?: Record<string, React.ComponentType<any>>
}

export function BlockRenderer({ blocks, customRegistry }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const Component = customRegistry?.[block.blockType]
          ?? blockRegistry[block.blockType]

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Bloque desconocido: ${block.blockType}`)
          }
          return null
        }

        return <Component key={block.id} data={block} />
      })}
    </>
  )
}
```

No valida schemas — cada bloque valida los suyos internamente.
El renderer pasa los datos como `unknown`, sin acoplarse a todos
los schemas.

---

## Validación

Cada bloque valida sus datos en desarrollo con `safeParse`:

```typescript
export function HeroBlock({ data }: { data: unknown }) {
  const result = heroSchema.safeParse(data)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error('HeroBlock: datos inválidos', result.error)
    }
    return null
  }

  const Component = variants[result.data.variant]
  return <Component data={result.data} />
}
```

En producción, los datos vienen de Payload que ya tiene los campos
tipados. La validación es una red de seguridad, no el flujo principal.

---

## Reglas

- Los bloques se construyen bajo demanda desde Figma, no como lista fija
- Cada bloque tiene schema Zod, componente, tests y export — sin excepciones
- Los tipos siempre se infieren del schema (`z.infer`), nunca se escriben a mano
- Las variantes estructurales son componentes separados, resueltas por mapa
- Las variantes de estilo se resuelven con CVA o clases Tailwind
- La personalización visual entre clientes viene de los tokens, no de código
- Nunca `if (client === 'nombre')` en `@hwe-platform/core-ui` — usar el registry del cliente
- La resolución del registry es: cliente → plataforma → warning
- Los bloques de referencia no duplican datos — configuran una query
