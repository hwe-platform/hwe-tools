---
id: HU-015
titulo: Corregir /scaffold-block — destino explícito, ejes por dominio y plantillas que compilan
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: []
---

## Contexto

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

## Qué hacer

### A. Plantillas que compilan y pasan el lint — *antes de HU-009*

1. La plantilla sin variantes importa `{Name}Data` y **no lo usa**:
   `@typescript-eslint/no-unused-vars` está en `error`. Quitar el import.
2. Ajustar la estructura a la real. El comando promete cinco ficheros, pero
   `blocks/cta/` y `blocks/rich-text/` tienen dos, porque **sus schemas ya viven
   en `pages.schema.ts`** y HU-008 dice explícitamente que no se redefinen. El
   comando debe detectar si el bloque ya tiene schema y, si lo tiene, no generar
   `{name}.schema.ts` ni `{name}.types.ts`.
3. Generar el bloque y comprobar que `pnpm lint` y `pnpm test` pasan **sin tocar
   nada a mano**. Un andamio que nace en rojo enseña a ignorar el rojo.

### B. Ejes por dominio, no solo enums — *antes de HU-009*

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

### C. Destino explícito — *antes del mapeador de bloques*

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

### D. Lo que el comando no dice y debería

11. Recordar que antes de escribir JSX se lee el `docs/lenguaje-visual.md` del
    cliente, y que al terminar se compara contra el export
    (`specs/figma/analisis.md`, "Verificar contra el diseño").
12. Recordar el test de paridad: si el bloque añade campos a Payload, el schema
    Zod tiene que seguirlos.
13. Mencionar los slots, que son la salida prevista para el adorno de un solo
    uso y evitan que un bloque se vuelva específico de un cliente.

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
- [ ] El comando remite al lenguaje visual del cliente, al test de paridad y a
      los slots
- [ ] La versión de `hwe-core/.claude/` queda espejada desde `hwe-tools`

## Notas

**Orden.** A y B bloquean HU-009: es la primera historia que usa el comando, y
`media-text` lleva justo un eje de estilo numérico (`split`). C puede esperar
hasta que exista un segundo cliente o hasta el mapeador de bloques, que produce
overrides y por tanto lo necesita.

**Por qué no se arregló al detectarlo.** Se detectó mientras se construía el
catálogo, donde `platform` es el destino correcto y el comando funciona. Dejarlo
escrito en vez de arreglarlo sobre la marcha es deliberado: la corrección cambia
cómo nacen todos los bloques siguientes y merece su propia revisión.

## Retrospectiva

_(vacía al crear — se llena si la historia necesitó correcciones significativas)_
