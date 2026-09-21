# Primer día — Onboarding

Lo mínimo para entender dónde estás y poder trabajar. Una hora larga.

---

## Los repositorios

Son dos, y la relación confunde al principio:

| Repo | Qué lleva |
|---|---|
| **`hwe-tools`** | Documentación, decisiones, specs, historias, comandos y skills. **Nada de código de producción** |
| **`hwe-core`** | El monorepo: `packages/core-ui` (la plataforma) y `apps/site-demo` (el site de prueba) |

`hwe-core/docs` **es un submódulo que apunta a `hwe-tools`**. Así que la
documentación se ve desde dentro del código, pero se edita en `hwe-tools`: un
cambio hecho en `hwe-core/docs/` se edita en el sitio equivocado.

Aparte, `figma-makes/{cliente}/` guarda el export de Figma de cada cliente. Es
**referencia visual, no código**: no se instala, no se modifica y no se copia
(DEC-002).

---

## Qué se está construyendo

Una plataforma para hacer webs de hostelería. La idea es que el **80%** de cada
site nuevo salga de componentes de plataforma configurados con variantes, un
**15%** de personalizaciones del cliente y un **5%** de código a medida.

Si ese reparto se invierte, `core-ui` deja de tener sentido y acabas con N
copias divergentes. Por eso importa tanto cómo se parametriza un bloque.

Lee: [proyecto.md](../proyecto.md) y [arquitectura/bloques.md](../arquitectura/bloques.md).

---

## Las cuatro decisiones que más se notan

| | Qué dice | Dónde |
|---|---|---|
| **Zod es la fuente de verdad** | Los schemas mandan; los configs de Payload se escriben a mano y un test de paridad comprueba que no divergen | DEC-004 |
| **Figma Make es referencia, no código** | De cada export salen tres artefactos —tokens, análisis y lenguaje visual—, que viven en el repo del cliente | DEC-002 |
| **Las URLs son datos** | No hay carpetas por ruta: una ruta catch-all resuelve contra Payload | DEC-009 |
| **Todo en castellano** | Código, comentarios y documentación. El contenido del cliente va en su idioma | DEC-001 |

---

## Arrancar

[entorno-local.md](entorno-local.md) — Postgres, variables, el site y el
sembrado, con los fallos habituales.

---

## Las dos cosas que más se hacen mal

Salen de errores reales, no de precaución:

**1. Construir de memoria en vez de leer el diseño.** Es el fallo caro, porque
no lo detecta ningún test: el dato sale, los criterios se marcan, y el resultado
no se parece. Antes de escribir JSX se lee el `lenguaje-visual.md` del cliente,
y al terminar se compara contra el export.

Y el corolario, que es peor: **un documento con un dato mal es peor que no
tenerlo**, porque quien lo lee deja de mirar el diseño. Por eso cada afirmación
sobre un color o un tamaño lleva al lado el fichero y la línea de donde salió.

**2. Dar por bueno un verde de turbo.** La caché puede dar verde sobre código
que no se ha ejecutado. Cuando la verificación importa: `TURBO_FORCE=true` —
y si el resultado no cuadra, borrar `.turbo` y repetir, porque `TURBO_FORCE`
tampoco la invalida siempre.

---

## Cómo se trabaja

[flujo-diario.md](flujo-diario.md) — de la historia a la PR.

Los estándares se leen cuando hacen falta, no de corrido:
[estandares/](../estandares/index.md). El que más se usa es `codigo.md`.

---

## Si te pierdes

[docs/index.md](../index.md) es el mapa: dice qué documento responde a cada
necesidad. Y [glosario.md](glosario.md), para los términos propios del proyecto.
