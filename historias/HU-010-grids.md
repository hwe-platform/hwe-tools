---
id: HU-010
titulo: Bloques IconGrid, CardGrid y Blog
estado: spec-lista
prioridad: 3
hito: 1
agente: —
rama: —
dependencias: [HU-008]
---

## Contexto

Tres bloques que cubren la mayoría de los listados del site:
servicios con iconos, tarjetas con imagen, y artículos del blog.

IconGrid y CardGrid funcionan con datos manuales (el editor rellena
los items en Payload). Blog es el primer bloque de referencia real —
consulta la colección `articles` de Payload en vez de contener datos
propios. Esto valida el patrón de resolución de bloques de referencia
que después usarán accommodationsGrid y el resto.

## Cambios respecto a la spec original

| Cambio | Motivo |
|--------|--------|
| ReviewsGrid eliminado | Fuente de datos será externa (GuestApp, Google, etc.). Se define en HU-016 aparte |
| Blog añadido | Bloque propio de referencia definido en el modelo de datos. Primer bloque que conecta con una colección de Payload |
| columns como número (no enum 3\|4\|6) | El Figma usa 3, 5 y 6. Un enum cerrado dejaría fuera valores reales |
| iconRegistry como prop | Los SVG custom del cliente no pueden viajar por Payload. Mismo patrón que slotRegistry de HU-009 |
| CardGrid solo source: manual | core-ui no consulta Payload. La resolución de colecciones la hace el resolver de site-demo |

## Decisiones resueltas

| # | Decisión | Resolución | Justificación |
|---|----------|------------|---------------|
| 1 | ¿CardGrid consulta Payload? | No. core-ui solo pinta. El resolver de site-demo pre-resuelve los datos | core-ui es librería de UI pura — meter Payload rompe el modelo. Patrón ya establecido en HU-008/009 |
| 2 | ¿Blog es bloque propio o CardGrid con source? | Bloque propio | Tiene campos específicos (showMoreLink, showMoreUrl, source: byCategory) que no encajan en CardGrid genérico. Definido así en el modelo de datos |
| 3 | ¿Cómo se resuelven iconos custom del cliente? | iconRegistry prop, mismo patrón que slotRegistry | Los SVG del cliente viven en site-demo/src/icons/, nunca en core-ui. El schema almacena un string, el componente busca en registry → lucide → fallback |
| 4 | ¿columns como enum o número? | Número | El Figma de La Civelle usa 3, 5 y 6. Un enum cerrado excluye valores reales. La rampa responsive se deriva del número destino |

## Qué hacer

### IconGrid

1. Crear `@hwe-platform/core-ui/src/blocks/icon-grid/`:
   - `icon-grid.schema.ts` — title, subtitle, columns (number),
     variant (card | bare), items array (icon: string, title, description
     opcional)
   - `icon-grid.types.ts` — tipos derivados con z.infer
   - `IconGridBlock.tsx` — grid responsive, variant por mapa
   - `IconGridBare.tsx` — icono circular + texto, sin tarjeta
   - `IconGridCard.tsx` — icono + texto dentro de tarjeta con fondo
   - Tests y exports

**Ejes visuales** (4 apariciones en el Figma):

| Dónde | Columnas | Con tarjeta | Responsive desde |
|-------|----------|-------------|-----------------|
| Pourquoi La Civelle | 3 | no (bare) | 1 col |
| Activités & Services | 6 | sí (card) | 2 col |
| Nos Engagements | 5 | no (bare) | 2 col |
| Equipamiento mobile-home | 6 | sí (card) | 3 col |

La rampa responsive se deriva del número destino (no es un eje extra):
columnas ≤ 3 arrancan en 1; columnas > 3 arrancan en 2.

**iconRegistry:** el componente recibe `iconRegistry?: Record<string, ComponentType>`
como prop. Busca primero ahí, luego en lucide-react, luego renderiza
un fallback genérico (con warning en dev). Los SVG custom del cliente
van en `apps/site-demo/src/icons/`, nunca en core-ui.

### CardGrid

2. Crear `@hwe-platform/core-ui/src/blocks/card-grid/`:
   - `card-grid.schema.ts` — title, subtitle, card (overlay | stacked),
     columns (number o reparto asimétrico), items array
     (image, title, subtitle, tag, url, date?, readMoreLabel?)
   - `card-grid.types.ts`
   - `CardGridBlock.tsx` — resuelve card por mapa
   - `CardOverlay.tsx` — imagen de fondo, gradient, texto encima
   - `CardStacked.tsx` — imagen arriba, texto debajo
   - Tests y exports

**Ejes visuales** (5 apariciones en el Figma):

| Dónde | card | Columnas |
|-------|------|----------|
| Nos Hébergements | overlay | 2 asimétricas (5/7) |
| Les Alentours | overlay | 4 |
| Actualités | stacked | 3 |
| Découvrez aussi | stacked | 3 |
| Nos Locations (mobile-home) | stacked | 3 |

`card` es estructural (cambia anatomía de la tarjeta) → componentes
separados resueltos por mapa.

El reparto asimétrico reutiliza `columnasDe` de `ratio.ts` (HU-009).

**source y sourceConfig** se definen ya en el schema Zod aunque no se
usen todavía en el componente — el campo existe en Payload para que
el editor configure qué colección quiere. La resolución de colecciones
llega cuando el resolver de site-demo conecte todo (HU-012 o posterior).
CardGrid en core-ui solo recibe y renderiza items.

### Blog

3. Crear `@hwe-platform/core-ui/src/blocks/blog/`:
   - `blog.schema.ts` — title, subtitle, source (latest | featured |
     byCategory), category (text, si source=byCategory), limit (number),
     showMoreLink (boolean), showMoreUrl (text)
   - `blog.types.ts`
   - `BlogBlock.tsx` — recibe items ya resueltos (array de artículos),
     renderiza tarjetas stacked con fecha + readMore. Si showMoreLink
     es true, añade enlace al final
   - Tests y exports

**Primer bloque de referencia real:** Blog es un bloque de referencia
que no contiene datos — consulta la colección `articles` de Payload.
La resolución la hace el resolver de site-demo:

```
Payload detecta bloque blog → resolver lee source + sourceConfig
→ fetch a colección articles (latest 3, o featured, o por categoría)
→ inyecta items resueltos como prop del componente
→ BlogBlock pinta las tarjetas
```

**El blog no tiene diseño Figma** — usa la misma anatomía de tarjeta
stacked que CardGrid (CardStacked). Si la tarjeta de artículo necesita
campos extra (date, readMoreLabel), CardStacked los renderiza cuando
los recibe y los omite cuando no.

**Datos fake en Payload:** seedear 3-4 artículos en la colección
`articles` con datos realistas de La Civelle (FR):
- "Nouvelle saison 2026 : toutes les nouveautés du camping"
- "Surf à Capbreton : les meilleurs spots près du camping"
- "Gastronomie landaise : nos adresses préférées"
- "Journée en famille : activités pour petits et grands"

Cada uno con: title, slug, excerpt, content (richText corto), image
(de media existente), category, publishedAt, featured.

### Registro y costura

4. Registrar IconGrid, CardGrid y Blog en `blockRegistry.ts`
5. Crear sus ficheros en `apps/site-demo/src/blocks/`
6. En site-demo, implementar la resolución del bloque blog en el
   page resolver (primer bloque de referencia que conecta con Payload)

## Leer antes

- `docs/lenguaje-visual.md` del repo del cliente — **antes de escribir JSX**
- docs/arquitectura/bloques.md
- specs/payload/modelo-datos.md (para el bloque blog y la colección articles)
- docs/estandares/codigo.md
- docs/estandares/testing.md

## Verificar contra el diseño

Antes de marcar cualquier criterio, **comparar lo construido con la sección
correspondiente del export de Figma**, no de memoria.

- Cada elemento usa el token que le asigna `docs/lenguaje-visual.md`
- Se respetan el ritmo vertical y el contenedor
- Las diferencias con el diseño están listadas y justificadas
- Blog no tiene Figma → usa anatomía de CardStacked, verificar que
  la tarjeta de artículo se ve coherente con las demás stacked

Ver `specs/figma/analisis.md`, sección "Verificar contra el diseño".

## Criterios de aceptación

### IconGrid
- [ ] Renderiza N columnas según campo `columns` (number)
- [ ] variant bare: icono circular + texto sin tarjeta
- [ ] variant card: icono + texto dentro de tarjeta con fondo
- [ ] Rampa responsive correcta (≤3 desde 1 col, >3 desde 2 col)
- [ ] iconRegistry resuelve iconos custom del cliente
- [ ] Fallback cuando el icono no existe en registry ni en lucide

### CardGrid
- [ ] card: overlay renderiza texto sobre imagen con gradient
- [ ] card: stacked renderiza imagen arriba, texto debajo
- [ ] Reparto asimétrico (5/7) funciona
- [ ] Schema incluye campos source y sourceConfig (aunque no se usen aún)
- [ ] Campos opcionales (date, readMoreLabel) se renderizan si existen

### Blog
- [ ] BlogBlock recibe items resueltos y renderiza tarjetas stacked
- [ ] showMoreLink muestra enlace "Voir toutes les actualités"
- [ ] El resolver de site-demo resuelve blog → fetch articles → inyecta items
- [ ] 3-4 artículos fake seedeados en Payload con datos de La Civelle
- [ ] La resolución respeta source (latest/featured/byCategory) y limit

### Transversal
- [ ] Todos los bloques usan primitivas de @hwe-platform/core-ui
- [ ] Todos usan tokens de Tailwind
- [ ] Todos pasan vitest-axe
- [ ] Tests — cobertura >80%
- [ ] Schemas Zod validan correctamente
- [ ] Registrados en blockRegistry
- [ ] Verificados contra el Figma (excepto blog, que no tiene diseño)

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_