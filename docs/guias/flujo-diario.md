# Flujo de trabajo diario

Lo que se hace, en orden, para sacar adelante una historia.

---

## 1. Antes de escribir código

**Lee la historia entera**, incluida su sección *Leer antes*. Está ahí porque
construir mirando solo el enunciado produce código que cumple todos los
criterios y no se parece al diseño — ya ha pasado, está en la retrospectiva de
HU-007.

Si la historia produce algo visual, **el documento de consulta obligatoria es el
`docs/lenguaje-visual.md` del cliente**, no la historia.

Arranca el entorno: [entorno-local.md](entorno-local.md).

---

## 2. Rama

Una rama por historia, con su identificador:

```bash
git switch -c feat/HU-009-hero-mediatext
```

Formato de ramas y mensajes: `docs/estandares/commits.md`.

---

## 3. Construir

Las reglas que más se incumplen, de `docs/estandares/codigo.md`:

- **Nada de `any`.** La regla está en `error`, no en `warning`
- **Nada de `if`/`switch` por nombre de cliente.** Lo que cambia la estructura
  se resuelve por mapa; lo que cambia el aspecto, por variantes de estilo
- **Toda dependencia nueva se justifica.** Tres en `core-ui`, y así debería
  seguir

Lo transversal se comparte como **función pura** y la capa específica queda
fina. Es lo que se hizo con los hooks de Payload y con la resolución de rutas.

---

## 3b. Si lo que construyes es un bloque

La primera pregunta no es cómo hacerlo, sino **si hace falta**. Lo habitual
—el 80% según `bloques.md`— es que un bloque de plataforma ya sirva variando
un eje, y eso no es código: son datos en Payload.

Cuando sí hace falta, `/scaffold-block` crea la estructura. Lleva delante lo
que conviene tener en la cabeza: cuándo un eje va por mapa y cuándo por
variantes de estilo, por qué se diseña por dominio y no por los valores del
primer cliente, qué es un slot, y los tres pasos de un override —incluido el
tercero, anotar por qué el bloque de plataforma no llegaba, que es el que hace
que el catálogo mejore en vez de llenarse de copias.

Dos cosas que el comando **no** decide y tú sí:

- **Los ejes los fija la historia del bloque**, no el andamio. Si el comando
  genera un enum donde la historia pide un número, manda la historia
- **El aspecto lo fija el `lenguaje-visual.md` del cliente**, que se lee antes
  de escribir JSX, no después de que no se parezca

---

## 4. Verificar

Los tests comprueban que el dato sale. **Ninguno comprueba que salga como el
diseño manda**, así que hacen falta las dos cosas:

```bash
TURBO_FORCE=true CI=true pnpm lint && pnpm format:check && pnpm test && pnpm build
```

Si algún número no cuadra —menos tests de los que hay, un umbral que falla sin
motivo— borra la caché y repite: `TURBO_FORCE` no siempre la invalida. Ver
`docs/guias/entorno-local.md`.

Y, si la historia produce algo visual, la comparación contra el export descrita
en `specs/figma/analisis.md`, sección *Verificar contra el diseño*. Resumida:

1. Comprobar primero que **el contenido está completo** — media comparación se
   resuelve ahí
2. Abrir la sección del export y compararla con lo construido, **no de memoria**
3. Comprobar que cada elemento usa el token que le asigna el lenguaje visual
4. Listar lo que se aparta del diseño **y por qué**

---

## 5. Marcar los criterios

Un criterio se marca cuando está **comprobado**, no cuando parece hecho. Si uno
se queda sin cumplir, se deja sin marcar y se dice por qué: una historia con
todos los criterios marcados y un resultado que no funciona es peor que una
historia a medias y honesta.

---

## 6. PR

El repo queda listo y **la PR la abre la persona, en GitHub**. Deja preparados
el título y el cuerpo para pegar.

---

## 7. Retrospectiva

Si la historia necesitó correcciones que valga la pena recordar, se escriben en
su sección *Retrospectiva*, y **la regla que las evita va al documento que
correspondía haberla dicho**: un estándar, una spec o el lenguaje visual del
cliente.

Una retrospectiva que no cambia ningún documento no evita nada.
