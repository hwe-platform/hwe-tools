---
id: HU-015
titulo: /scaffold-block como herramienta permanente — destino explícito, ejes por dominio y evitar duplicados
estado: idea
prioridad: 3
hito: —
agente: —
rama: —
dependencias: [HU-009, HU-010, HU-011]
---

## Contexto

> **Reasignada por el Planner.** Partes A+B se activan después de HU-011
> (cuando haya 11+ bloques). Partes C+E se activan en hitos posteriores
> (cuando haya clientes reales).

`/scaffold-block` genera siempre en `packages/core-ui`. Eso es correcto **ahora**,
mientras se construye el catálogo, y deja de serlo en cuanto haya clientes: según
el reparto 80/15/5 de `bloques.md`, un proyecto de cliente casi nunca debería
escribir en `core-ui`. Lo que hace es un **override** en su propio repo.

El comando lo menciona, y ahí está el problema: dice que para un override *"no se
necesita un comando — el desarrollador crea manualmente"*. Dos consecuencias:

1. **Desactiva el mecanismo de promoción.** `bloques.md` exige que un override
   registre **por qué** el bloque de plataforma no llegaba —carencia de
   plataforma, que se promueve, frente a singularidad del cliente, que se
   queda— y aplica la regla del tercero. Sin un sitio donde anotar la causa,
   nadie la anota, y la regla nunca se dispara. El mecanismo queda escrito y
   muerto.
2. **Empuja el trabajo al sitio equivocado.** Si el camino fácil genera en
   `core-ui` y el difícil es hacerlo a mano, acabará habiendo en plataforma
   bloques que son de un cliente. Justo lo contrario de lo que se busca.

Además arrastra dos errores que muerden antes, en el primer bloque que se genere.

**Esto no es andamiaje de una fase.** El comando es herramienta permanente: se
seguirán añadiendo bloques a `core-ui` mientras el proyecto viva, y el propio
mecanismo de promoción lo garantiza —un override que se repite tres veces acaba
siendo un bloque de plataforma nuevo—. Los dos destinos son legítimos para
siempre, no uno ahora y otro después. Se arregla cuando haya catálogo del que
aprender, pero se arregla para quedarse.

## Qué hacer

### A. Plantillas que compilan y pasan el lint

1. La plantilla sin variantes importa `{Name}Data` y **no lo usa**:
   `@typescript-eslint/no-unused-vars` está en `error`. Quitar el import.
2. Ajustar la estructura a la real. El comando promete cinco ficheros, pero
   `blocks/cta/` y `blocks/rich-text/` tienen dos, porque **sus schemas ya viven
   en `pages.schema.ts`** y HU-008 dice explícitamente que no se redefinen. El
   comando debe detectar si el bloque ya tiene schema y, si lo tiene, no generar
   `{name}.schema.ts` ni `{name}.types.ts`.
3. Generar el bloque y comprobar que `pnpm lint` y `pnpm test` pasan **sin tocar
   nada a mano**. Un andamio que nace en rojo enseña a ignorar el rojo.

### B. Ejes por dominio, no solo enums

4. Hoy `--variants a,b` siempre produce `z.enum([...])`. Eso solo vale para los
   ejes **estructurales**, los que cambian la anatomía del HTML y se resuelven
   por mapa de componentes.
5. Los ejes de **estilo** se diseñan por la dimensión que varía, no por los
   valores del primer cliente: `split: number`, no `'5/7' | '7/5' | '50/50'`.
   Un enum con lo visto en un Figma se rompe con el cliente siguiente y obliga a
   tocar `core-ui` o a hacer override — lo que se quería evitar.
6. Separar los dos conceptos en la interfaz del comando: las variantes
   estructurales generan ficheros y mapa; los ejes de estilo, campos del schema
   y variantes de clase. Que el resumen final diga cuál es cuál.

### C. Destino explícito — *lo que no puede esperar al cliente 2*

7. Añadir `--target platform|client`.
8. **`client` por defecto** en cuanto exista catálogo: es el caso mayoritario.
   Mientras se construye el Hito 1, el valor por defecto sigue siendo
   `platform`; cambiarlo es una línea y una nota en el comando.
9. En modo `client`, generar en `apps/{site}/src/blocks/{name}/` y **la entrada
   del registry** —que ahí no es una decisión discutible: un override sin
   registrar no hace nada—, dejando manual solo el registry de plataforma.
10. En modo `client`, pedir y registrar **la causa del override**, con las dos
    categorías de `bloques.md`, y anotarla en el inventario de overrides que ese
    documento sitúa en `hwe-tools`, no enterrado en el repo del cliente.

### D. ~~Lo que el comando no dice y debería~~ — **hecha**

El comando ya remite al lenguaje visual del cliente, al test de paridad, a los
slots y al mecanismo de promoción, y explica cómo se decide un eje. Era
documentación pura: no dependía de tener catálogo, así que se adelantó.

### E. Ayudar a **no** crear un bloque — *cuando el catálogo pase de ~10*

14. El riesgo que crece con el proyecto no es andamiar mal: es **reconstruir lo
    que ya existe**. Quien entre en el cliente cinco no se sabe el catálogo, y un
    comando que crea sin preguntar es un comando que invita a duplicar.
15. Antes de generar, listar los bloques del catálogo cuyo nombre o ejes se
    parezcan a lo pedido, y preguntar si alguno sirve con otras variantes. Un
    bloque nuevo debería costar una confirmación más que reutilizar uno.
16. Es el mismo razonamiento que sostiene el 80/15/5: si el camino fácil es
    crear, el ratio se invierte solo, y `core-ui` acaba siendo un almacén de
    bloques parecidos en vez de un catálogo.

## Leer antes

- docs/arquitectura/bloques.md — reparto 80/15/5, ejes de variación, slots y el
  mecanismo de promoción
- docs/estandares/codigo.md
- specs/figma/analisis.md — sección "Verificar contra el diseño"
- historias/HU-008-renderer-routing.md — por qué `cta` y `rich-text` no tienen
  schema propio

## Criterios de aceptación

- [ ] Un bloque generado pasa `pnpm lint` y `pnpm test` sin editar nada
- [ ] Si el bloque ya tiene schema en `pages.schema.ts`, no se genera uno nuevo
- [ ] El comando distingue ejes estructurales (mapa) de ejes de estilo (dominio),
      y el resumen dice cuál es cuál
- [ ] Un eje de estilo numérico se genera como número, no como enum de los
      valores observados
- [ ] `--target client` genera en el repo del cliente y **registra el bloque** en
      su `block-registry.ts`
- [ ] `--target client` recoge la causa del override y la deja anotada en el
      inventario de `hwe-tools`
- [ ] `--target platform` sigue sin tocar el registry automáticamente
- [x] El comando remite al lenguaje visual del cliente, al test de paridad y a
      los slots
- [ ] Pedir un bloque parecido a uno existente avisa y ofrece el que ya hay
- [ ] La versión de `hwe-core/.claude/` queda espejada desde `hwe-tools`

## Notas

**Por qué va después de los bloques y no antes.** La tentación es corregir el
andamio antes de usarlo. No compensa, por dos razones:

1. **El andamio no decide cómo nace un bloque; lo decide su historia.** HU-009
   ya especifica sus ejes con precisión —`split` es un número sobre 12, `media`
   es estructural y va por mapa, y los slots están enumerados—. Lo que genere el
   comando se reescribe en cinco minutos.
2. **Hoy se diseñaría a ciegas.** El catálogo tiene dos bloques. Con HU-009, 010
   y 011 serán once, y entonces se sabrá de verdad qué comparten, si la
   estructura de ficheros aguanta, y cómo se andamia un slot. Corregirlo antes
   es diseñar desde la suposición, que es el error que este proyecto ya ha
   pagado una vez.

Lo que sí hay que evitar es lo contrario: usar el comando tres veces, tragarse
el mismo arreglo manual tres veces y no anotarlo. Cada historia de bloques que
tropiece con una plantilla deja constancia aquí, y esta historia se escribe con
esos tres tropiezos delante en vez de con una suposición.

**Cada parte tiene su propio disparador**, porque no dependen de lo mismo:

| Parte | Cuándo |
|---|---|
| A — plantillas que compilan | Con los bloques hechos, para generalizar de once y no de dos |
| B — ejes por dominio | Igual |
| C — destino explícito | El segundo cliente o el mapeador, lo que llegue antes: es quien empieza a producir overrides |
| E — evitar duplicados | Cuando el catálogo pase de una decena y ya no quepa en la cabeza |

Ninguna caduca. El comando no es andamiaje de esta fase: es la puerta por la que
entrará cada bloque del proyecto, y lo que decida ahí se paga en cada cliente.

## Retrospectiva

_(vacía al crear — se llena si la historia necesitó correcciones significativas)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_
