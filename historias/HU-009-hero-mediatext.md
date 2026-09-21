---
id: HU-009
titulo: Bloques Hero y MediaText
estado: hecha
prioridad: 2
hito: 1
agente: code-builder
rama: main
dependencias: [HU-008]
---

## Contexto

Hero y MediaText son los primeros bloques reales. Hero es lo primero
que ve el visitante. MediaText es el patrón más reutilizado del Figma de
La Civelle: **aparece 7 veces** entre las tres páginas —cuatro en la home
(Intro, Restaurant, Piscine, Accès), dos en Le Camping y una en la ficha
de alojamiento—, así que es el bloque que más secciones desbloquea de
todo el catálogo.

**Ojo con el nombre "Hero":** no es un bloque del array `blocks`. En el
modelo de datos `hero` es un **grupo de campos de `pages`** (variant,
media, title, subtitle, showBreadcrumbs) y no está entre los 15 bloques.
Lo que se construye aquí es su renderizador, y por eso HU-008 deja el
hero sin pintar a propósito: para hacerlo una sola vez y aquí.


## Qué hacer

### Hero

1. Crear `@hwe-platform/core-ui/src/blocks/hero/`:
   - `hero.schema.ts` — **extraer** el schema del grupo `hero` que ya existe dentro de
     `schemas/collections/pages.schema.ts` y reutilizarlo desde ahí. **No escribirlo de nuevo**:
     duplicar esos campos reproduce la divergencia entre Zod y Payload que costó cara en HU-005,
     y el test de paridad no la detecta porque solo compara el primer nivel
   - `hero.types.ts` — tipo derivado con `z.infer`
   - `HeroBlock.tsx` — resuelve variante por mapa
   - `HeroVideo.tsx` — vídeo a pantalla completa con overlay oscuro
   - `HeroImage.tsx` — imagen con gradiente, breadcrumbs opcionales
   - `HeroBlock.test.tsx` — tests de renderizado y accesibilidad
   - `index.ts` — export público

**Ejes de variación**, extraídos de los tres heros del Figma (home con vídeo,
Le Camping y la ficha de alojamiento):

| Eje | Tipo | Dominio | Visto en el Figma |
|---|---|---|---|
| `variant` | **estructural** | `video` \| `image` | ambos |
| `title` | **estructural** | `logo` \| `text` | la home usa el logo; las interiores, texto |
| `align` | estilo | `center` \| `left` | home centrado, interiores a la izquierda |
| `breadcrumbs` | datos | lista de niveles | 0 en la home, 2 en Le Camping, 3 en la ficha |

**El breadcrumb vive aquí, no en el layout**: en el Figma está dentro del hero
de cada página, no en la barra de navegación.

**Decisión de accesibilidad y SEO que hay que tomar aquí:** el hero de la home
del Figma **no tiene `<h1>` de texto** — su título es la imagen del logo. Eso
deja la página sin encabezado principal legible. No se copia tal cual: hay que
decidir dónde vive el `<h1>` (un `<h1>` visualmente oculto con el nombre del
site es lo habitual) y dejarlo escrito.

### MediaText

**Es el bloque de mayor impacto de todo el catálogo: cubre 7 secciones** de las
tres páginas analizadas. Sus ejes salen de comparar esas 7, no de imaginar.

2. Crear `@hwe-platform/core-ui/src/blocks/media-text/`:
   - `media-text.schema.ts` — schema Zod: `title`, `subtitle`, `content`
     (richText), `media`, `ctas` (array opcional)
   - `media-text.types.ts`
   - `MediaTextBlock.tsx` — dos columnas responsivas
   - `MediaTextBlock.test.tsx`
   - `index.ts`

**Ejes de variación** (ver `docs/arquitectura/bloques.md`). Se diseñan por la
dimensión que varía, no por los valores que toma La Civelle — esos son ejemplos:

| Eje | Tipo | Dominio | Visto en el Figma |
|---|---|---|---|
| `media` | **estructural** | `image` \| `iframe` \| `carousel` | los tres: fotos, el mapa de Google, los carruseles de Le Camping |
| `split` | estilo | `number` — columnas del medio sobre 12 | 5, 7 y 6 |
| `reverse` | estilo | bool | Piscine y Services van invertidos |
| `align` | estilo | `center` \| `start` | Restaurant centrado, Accès arriba |
| `ctas` | datos | lista | de 0 a 2 |

`media` es estructural, así que va por mapa a componentes separados
(`MediaImage`, `MediaEmbed`, `MediaCarousel`), nunca con `if`. El resto, CVA.

**Slots.** Solo se abren los que un diseño real pide:

| Slot | Qué resuelve |
|---|---|
| `aside` | La caja que acompaña al texto: horarios del restaurante, mini-tarjetas de la piscina, barra de estadísticas de Le Camping. Son tres cosas distintas en el mismo hueco — el caso de libro para un slot, no para tres props |
| `sobreLaImagen` | El medallón «Depuis 30 Ans» de la intro. Es de La Civelle y de nadie más: va en su repo, no en plataforma |

No abrir más slots "por si acaso".

### Registro y costura del cliente

3. Registrar ambos bloques en `blockRegistry.ts` de plataforma
4. Crear su fichero en `apps/site-demo/src/blocks/`, aunque solo sea un
   reexport de tres líneas: es lo que hace descubrible la personalización
   (ver "Tres niveles de uso por cliente" en `bloques.md`)
5. Rellenar en el site el slot `sobreLaImagen` con el medallón «Depuis 30 Ans»
   — es el primer uso real de un slot y sirve para comprobar que el mecanismo
   funciona de punta a punta
6. Verificar que el BlockRenderer los renderiza con datos reales de Payload

## Leer antes

- `docs/lenguaje-visual.md` del repo del cliente — **antes de escribir JSX**
- docs/arquitectura/bloques.md — en particular "Ejes de variación y slots"
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Verificar contra el diseño

Antes de marcar cualquier criterio, **comparar lo construido con la sección
correspondiente del export de Figma**, no de memoria. Los tests comprueban que
el dato sale; ninguno comprueba que salga como el diseño manda.

- Cada elemento usa el token que le asigna `docs/lenguaje-visual.md` del
  cliente — en particular las **etiquetas**, que van en color de acento y
  tipografía de cuerpo, no como encabezados
- Se respetan el ritmo vertical y el contenedor
- Las diferencias con el diseño están **listadas y justificadas**

Ver `specs/figma/analisis.md`, sección "Verificar contra el diseño".

## Criterios de aceptación

- [x] HeroVideo renderiza vídeo fullscreen con overlay
- [x] HeroImage renderiza imagen con gradient y breadcrumbs
- [x] Hero resuelve variante por mapa, no if/switch
- [x] La página tiene un `<h1>` legible aunque el hero muestre el logo
- [x] MediaText renderiza en dos columnas con imagen izquierda o derecha
- [x] MediaText acepta imagen, iframe y carrusel como medio
- [x] MediaText admite cualquier reparto de columnas, no solo los del Figma
- [x] El slot `aside` acepta las tres cajas distintas del Figma (horarios,
      features y estadísticas) sin cambiar el bloque
- [x] El site rellena `sobreLaImagen` con la insignia por `slotId`, y el
      bloque de plataforma sigue sin saber nada de ella
- [x] MediaText es responsive (apila en mobile)
- [x] Ambos bloques usan primitivas de @hwe-platform/core-ui (Image, Button, Link)
- [x] Ambos bloques usan tokens de Tailwind, no estilos inline
- [x] Ambos pasan vitest-axe sin violaciones
- [x] Tests — cobertura >80%
- [x] Schema Zod valida datos correctos y rechaza incorrectos
- [x] Registrados en blockRegistry y renderizan desde BlockRenderer

## Diferencias con el diseño

Comparado contra el export (`App.tsx:466-503`, `522-566`, `831-880`;
`LeCampingPage.tsx:59-95`). Cada diferencia lleva su motivo; las no listadas
son fallos.

### Deliberadas — no se copian (DEC-002)

| Qué | Por qué |
|---|---|
| La home del export no tiene `<h1>`: el título es el logo | Se pinta un `<h1>` oculto con el nombre del site. Accesibilidad y SEO |
| El hero interior apila una imagen a `opacity-20` bajo otra capa de fondo | Residuo del export: dos técnicas para el mismo resultado. Se usa una imagen a `opacity-40` con el degradado de marca |
| El export usa `items-left` / `justify-left` | Clases inexistentes en Tailwind; lo que se ve es el valor por defecto |
| Primer nivel de migas | El export pone «Accueil»; se replica como rótulo del site, no como nombre del site |

### Resueltas por el Planner

| Qué | Decisión | Estado |
|---|---|---|
| Titular a dos líneas | Campo `titleAccent`, segunda línea en `text-secondary` | Implementado |
| Fondo de sección | Campo `background`: `default` \/ `muted` \/ `none` | Implementado |
| Slots por instancia | `slotId` en el bloque + `slotRegistry` que el site pasa al renderer | Implementado |
| Forma del botón | Sale de tokens del cliente (`--button-px`, `--button-py`, `--button-font-size`, `--button-font-weight`, `--button-shadow`), con respaldo. `sm` y `lg` siguen fijos | Implementado |
| Flecha del botón | Campo `icon` en los enlaces, a la derecha del texto | Implementado |
| Línea de acento del antetítulo | Campo `eyebrowRule`, que activa la `rule` de la primitiva `Eyebrow`. Es un eje, no un adorno constante: la llevan 2 de los 17 antetítulos del diseño (`App.tsx:548` y `LeCampingPage.tsx:111`) | Implementado |

### Pendiente del Planner

| Qué | Evidencia | Opciones |
|---|---|---|
| **El «párrafo destacado» no se puede marcar** | El editor es `lexicalEditor()` con su configuración por defecto, y su juego de formatos es negrita, cursiva, subrayado, tachado, encabezados, listas, citas y enlaces. **No existe «destacado»**: los formatos de texto de Lexical son una máscara de bits cerrada y los de párrafo son alineación e indentación. El diseño lo usa a tres tamaños distintos: 22px con peso medio en la intro (`App.tsx:560`), 20px en Piscine (`App.tsx:845`), 18px en Restaurant (`App.tsx:791`) | Añadir una *feature* al editor Lexical; o aceptar que el párrafo va en cuerpo normal; o que el bloque lo estile por convención, lo que ya se probó y acertaba en una de tres |

### Menores, aceptadas por la humana tras verlas en el navegador

| Qué | Export | Bloque |
|---|---|---|
| Color del `<h2>` | `text-primary` en las dos secciones | **Corregido**: `text-primary` |
| Imagen de Piscine a altura fija 340/520/680 sin degradado | Sí | `ratio: landscape` (4/3) con degradado suave. Misma proporción visual |
| `gap` de la retícula | `lg:gap-32` en Piscine | `lg:gap-24`, el del lenguaje visual. Menor |
| Ritmo vertical de la sección | `py-12 md:py-20 lg:py-32` en la intro, `py-16 md:py-24 lg:py-32` en Piscine | `py-16 md:py-24 lg:py-32` para las dos: el ritmo estándar del lenguaje visual. El export no es consistente consigo mismo, así que copiarlo literalmente sería copiar la inconsistencia |
| Margen bajo el `<h2>` | `mb-10` en la intro, `mb-8` en Piscine | `mb-6` en las dos. Misma razón: un valor de escala en lugar de dos medidas sueltas |
| Margen bajo el antetítulo | `mb-6` en la intro, `mb-4` en Piscine | `mb-4` en las dos |
| Margen bajo el supertítulo del hero | `mb-8` en la home, `mb-6` en las interiores | `mb-6 md:mb-8`: la diferencia del export coincide con el salto de tamaño de pantalla, así que va como escala y no como caso |
| El párrafo de entrada, más grande que el cuerpo | `text-[22px] font-medium` en la intro, 20px en Piscine, 18px en Restaurant | Cuerpo normal. **No es una diferencia aceptada sino una carencia**: falta el mecanismo para marcarlo. Ver «Pendiente del Planner» |
| Cuarto valor del eje `ratio` | — | Se retiró `auto`. El marco solo contiene elementos en posición absoluta, así que sin proporción se quedaba a cero de alto: un valor que no dibuja no es un valor del eje |
| Tamaño de los antetítulos con línea | 12px y `whitespace-nowrap` en los dos que la llevan | 14px, que es lo que prescribe `lenguaje-visual.md` para un antetítulo de sección. Se sigue el lenguaje visual, no la excepción del export |
| Ancho máximo del `<h2>` | `max-w-3xl` en la intro | Sin límite propio: el titular ocupa su columna. No replicado |
| Color de los `<strong>` del cuerpo | `text-primary` | Negrita a secas. `RichText` pinta el formato de Lexical, y «negrita en color de marca» no es un formato: sería estilar por convención lo que el editor no puede expresar |
| Variante `minimal` y ejes `ratio`, `eyebrow`, `titleMode` | No están en el export | Salen del modelo de datos existente y de comparar los tres heros. Justificados en JSDoc y en `modelo-datos.md` |

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|
| Payload devuelve null en opcionales vacíos, Zod espera undefined | specs/payload/modelo-datos.md | ⬜ |
| El export de Figma trae imágenes decorativas residuales | .claude/commands/import-figma.md | ⬜ |
| Un campo title único no puede expresar titular partido en dos colores | Resuelto con titleAccent (esta HU) | ✅ |
| Los slots documentados en bloques.md no tenían mecanismo en el renderer | Resuelto con slotRegistry (esta HU) | ✅ |
| Lexical no tiene formato "párrafo destacado" nativo | Pendiente futuro, no bloquea | ⬜ |
| `TURBO_FORCE=true` no siempre invalida la caché de turbo: hubo que borrar `.turbo` para obtener resultados fiables | docs/guias/entorno-local.md, «Verificar antes de dar algo por hecho», y los tres sitios que repetían el consejo incompleto: .claude/agents/reviewer.md (paso 2), docs/guias/flujo-diario.md, docs/guias/primer-dia.md | ✅ |
| El Reviewer lee docs/ (submodule) que puede estar desactualizado respecto a hwe-tools. Cada vez que se edita hwe-tools hay que actualizar el puntero en hwe-core o el Reviewer revisa documentación vieja. | docs/decisiones/DEC-007-repos.md, sección «La copia de docs/ va por detrás» | ✅ |
