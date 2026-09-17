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

### En el site del cliente

```
hwe-client-{slug}/
└── src/
    ├── blocks/                       — un fichero por bloque que usa el site
    │   └── {name}/
    │       ├── {Name}Block.tsx       — reexport, slots o JSX propio
    │       ├── {Name}Block.test.tsx  — solo si se desvía de plataforma
    │       └── index.ts
    └── block-registry.ts            — extiende el registry de plataforma
```

**Hay fichero incluso cuando no se personaliza nada** — un reexport de tres
líneas. Es lo que hace descubrible la personalización: quien abre el repo ve
qué bloques usa el site y dónde tocarlos, sin tener que conocer el registry ni
leer el código del paquete.

El coste es el reverso: si plataforma añade un bloque nuevo, el cliente no lo
tiene hasta que alguien cree su fichero. Es trabajo del scaffold de un site
nuevo y de la historia que añada el bloque, no algo que ocurra solo.

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

## Ejes de variación y slots

Un bloque sirve para muchos clientes por dos mecanismos distintos, y confundirlos
es lo que hace que un bloque acabe siendo inservible o inmantenible.

| | Para qué sirve | Cómo se expresa |
|---|---|---|
| **Eje de variación** | Lo que varía de forma **previsible y acotada** | Un prop |
| **Slot** | Lo que varía de forma **impredecible** | Una función que devuelve JSX |

Un eje se define porque **sabes** qué valores va a tomar. Un slot se define
porque sabes que **no** lo sabes.

### Ejes de variación

Un eje sale de mirar diseños reales, no de imaginar. Del análisis del Figma de
un cliente se extrae qué cambia de una sección a otra, y eso —y solo eso— se
convierte en prop.

**Se diseña por la dimensión que varía, no por los valores que toma el primer
cliente.** Un `split: '5/7' | '7/5' | '50/50'` cubre a quien lo inspiró y se
rompe con el siguiente que quiera 6/6, obligando a tocar `core-ui` o a hacer
override. Un `split: number` cuesta lo mismo y absorbe diseños aún no vistos.
Los valores observados son **ejemplos documentados, no el conjunto de lo
posible**.

Cada eje se implementa según la regla de "Variantes": si cambia la estructura
del HTML, componentes separados resueltos por mapa; si solo cambia el aspecto,
CVA.

### Slots

Un slot es un hueco que el bloque deja para que el cliente meta su propio JSX,
quedándose con todo lo demás compartido.

El caso que lo motiva: la home de un camping tiene un medallón circular con
«Depuis 30 Ans» superpuesto a la imagen de una sección de dos columnas. Eso lo
tiene ese cliente y nadie más. Sin slots hay dos malas salidas: añadir un prop
`medallon` al bloque de plataforma —y mañana otro querrá una cinta, y otro un
sello— o que el cliente reescriba el bloque entero, duplicando la retícula, el
responsive y los tests para añadir un círculo.

El bloque de plataforma deja el hueco:

```tsx
type MediaTextSlots = {
  /** Se pinta encima de la imagen. Si nadie lo rellena, no hay nada. */
  sobreLaImagen?: () => ReactNode
}

export function MediaTextBlock({ data, slots }: MediaTextProps) {
  return (
    <section className="grid gap-24 lg:grid-cols-12">
      <div className="relative lg:col-span-5">
        <Image src={data.image} alt={data.alt} aspectRatio="4/3" />
        {slots?.sobreLaImagen?.()}
      </div>
      <div className="lg:col-span-7">{/* ... */}</div>
    </section>
  )
}
```

Y el cliente lo rellena en su repo, sin tocar plataforma:

```tsx
export function MediaTextBlock(props: MediaTextProps) {
  return <BaseMediaText {...props} slots={{ sobreLaImagen: Medallon }} />
}
```

El cliente conserva las dos columnas, el responsive, la accesibilidad y los
tests de plataforma; si mañana se corrige un fallo ahí, lo recibe.

**Un slot se abre cuando un diseño real lo pide, nunca "por si acaso".** Poner
slots en todas partes es tan malo como no ponerlos: multiplica la superficie del
bloque sin que nadie los use. En la primera versión del proyecto se anunciaron
slots en los comentarios de todos los bloques y solo dos los tenían de verdad.

---

## Registry de dos niveles

### Registry de plataforma (`@hwe-platform/core-ui`)

```typescript
// blockRegistry.ts
import { HeroBlock } from '../blocks/hero'
import { MediaTextBlock } from '../blocks/media-text'
import { IconGridBlock } from '../blocks/icon-grid'
// ...

export const blockRegistry: Record<string, React.ComponentType<{ data: unknown }>> = {
  hero: HeroBlock,
  'media-text': MediaTextBlock,
  'icon-grid': IconGridBlock,
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

**La costura existe desde el primer día.** Cada bloque que el site usa tiene su
propio fichero en el repo del cliente, aunque solo sea un reexport. Así nadie
tiene que averiguar *cómo* se sobrescribe: abre el fichero y ahí está.

```
apps/site-demo/src/blocks/media-text/MediaTextBlock.tsx
```

### Nivel 1 — Reexport directo (~80%)

El cliente usa el bloque de plataforma tal cual. La personalización visual viene
de los tokens (colores, tipografía, radios). El fichero son tres líneas:

```tsx
// Nivel 1 — reexport. Para desviarse: slots (nivel 2) o JSX propio (nivel 3).
export { MediaTextBlock } from '@hwe-platform/core-ui'
```

### Nivel 2 — Slots (~15%)

El cliente conserva el bloque de plataforma y sustituye **una pieza concreta**:

```tsx
import { MediaTextBlock as Base } from '@hwe-platform/core-ui'

export function MediaTextBlock(props: MediaTextProps) {
  return <Base {...props} slots={{ sobreLaImagen: Medallon }} />
}
```

Es el nivel que evita el salto de "uso el de plataforma" a "lo reescribo
entero". Conserva retícula, responsive, accesibilidad y tests compartidos.

### Nivel 3 — Full custom (~5%)

El cliente escribe su propio componente, usando solo el schema Zod de
plataforma para que el editor siga viendo los mismos campos. Lo registra en su
registry, que manda sobre el de plataforma. No toca `@hwe-platform/core-ui`.

### Cuándo se promueve a plataforma

Un override puede significar dos cosas opuestas, y conviene distinguirlas:

- **Carencia de plataforma** — al bloque le falta un eje o un slot que debería
  tener. Se promueve: se arregla `core-ui`.
- **Singularidad del cliente** — ese diseño es suyo y de nadie más. El override
  es correcto y se queda donde está.

**Disparador:** el primer override es normal, el segundo igual avisa, **al
tercero se promueve**. Un umbral concreto en lugar de "si es reutilizable", que
no se dispara nunca porque quien hace el cliente siguiente va con fecha y su
override ya funciona.

**Regla de seguridad: la promoción añade una variante nueva, nunca cambia el
comportamiento por defecto.** Así no puede romper la web de un cliente ya en
producción — y si promover es barato y seguro, se hace.

El ratio 80/15/5 es el termómetro: si los overrides pasan del 15%, `core-ui` no
está cumpliendo y hay que mirar qué ejes o slots faltan. Con el primer cliente
el ratio no dice nada, porque se está construyendo el catálogo; empieza a medir
del segundo o tercero.

> Esto es una **regla, no un sistema**. No hay que construir maquinaria para
> contarlo: en la primera versión del proyecto se montó un validador de
> composición completo, con su schema y sus tests, y su tabla de reglas se quedó
> vacía para siempre. Un mecanismo que nadie alimenta es peor que una regla
> escrita.

---

## El layout no usa registry

Los componentes de `layout/` —barra superior, navegación, menú móvil, pie,
banner, widget de reservas, botones flotantes— siguen los mismos tres niveles
de personalización que los bloques: **contenido** desde los globals de Payload,
**aspecto** desde los tokens, y **estructura** reescribiéndolos en el site.

Pero **no hay un registry de layout**, y es deliberado.

El registry existe en los bloques porque **el editor los inserta dinámicamente**:
el código no sabe qué bloques traerá una página, así que necesita resolverlos
por nombre en tiempo de ejecución. El layout es lo contrario: se monta una vez
por site y el código sabe exactamente qué lleva.

Por eso `SiteLayout` es **una conveniencia, no una obligación**:

```tsx
// La mayoría de sites: usan el compositor tal cual
<SiteLayout globals={globals} locale={locale}>{children}</SiteLayout>
```

```tsx
// Un site con otro marco: importa las piezas que le sirven y escribe el resto
import { TopBar, Footer } from '@hwe-platform/core-ui'
import { MiNavegacion } from './layout/MiNavegacion'

export function MiLayout({ globals, children }) {
  return (
    <>
      <TopBar data={globals.header} />
      <MiNavegacion data={globals.header} />
      <main>{children}</main>
      <Footer data={globals.footer} config={globals.siteConfig} />
    </>
  )
}
```

Cada pieza se exporta por separado precisamente para esto. Añadir props de
sustitución a `SiteLayout` sería maquinaria para un caso que se resuelve con un
fichero.

**`SiteLayout` es el dueño del `<main>`.** Una página que lo use no debe añadir
el suyo, o quedarían dos anidados.

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
  customRegistry?: Record<string, React.ComponentType<{ data: unknown }>>
}

export function BlockRenderer({ blocks, customRegistry }: BlockRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const Component = customRegistry?.[block.blockType]
          ?? blockRegistry[block.blockType]

        if (!Component) {
          if (process.env.NODE_ENV === 'development') {
            // El guard de NODE_ENV no lo evalúa ESLint: sin la excepción,
            // `no-console` falla en CI (ver docs/estandares/codigo.md).
            // eslint-disable-next-line no-console
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
