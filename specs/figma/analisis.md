# Análisis de un export de Figma Make

Cómo se lee un export de Figma Make para convertirlo en trabajo: qué se extrae,
en qué formato, y cómo se mapea cada sección a un bloque.

Es el **método**, sin cliente. El resultado de aplicarlo a un cliente concreto
vive en el repo de ese site, no aquí (DEC-002: *"los artefactos generados
—tokens, análisis, design-language— viven en el repo del sitio cliente"*).

---

## Para qué sirve

El análisis es la entrada de tres cosas distintas:

1. **Los ejes de variación de cada bloque.** Un eje se define comparando las
   secciones reales que comparten patrón, no imaginando. Sin análisis, los
   bloques se parametrizan a ojo (ver `docs/arquitectura/bloques.md`).
2. **El importador de contenido.** Necesita saber qué secciones hay, en qué
   orden y con qué textos e imágenes.
3. **El alcance del trabajo.** Cuántos componentes hacen falta y cuáles
   desbloquean más página.

---

## Qué se extrae

### 1. Inventario de secciones, por página y en orden

Para cada sección, de arriba abajo:

| Campo | Qué es |
|---|---|
| **Nombre** | Descriptivo, no el del componente del export |
| **Contenido** | Textos **literales**, en su idioma. Imágenes y vídeos referenciados. Iconos |
| **Patrón visual** | Cómo se compone: columnas, retícula de N, carrusel, pantalla completa. Se deduce de las clases de utilidad (`grid-cols-*`, `col-span-*`, `aspect-*`, `min-h-screen`) |
| **Repeticiones** | Si el mismo patrón aparece más veces con distinto contenido |

Los textos se copian tal cual. Son el contenido que acabará en el CMS, y
reescribirlos «mejorándolos» rompe la correspondencia con el diseño aprobado.

### 2. Reducción a patrones

Dos secciones con la misma estructura y distinto contenido **son un solo
patrón**. Esta reducción es lo que convierte «23 secciones» en «10 componentes»
y la que revela cuál construir primero.

Se ordenan por número de usos: el patrón que cubre más secciones es el de mayor
impacto.

### 3. Separación de chrome y contenido

Qué es marco fijo compartido por todas las páginas (barra superior, navegación,
pie, menú móvil, elementos flotantes) frente a qué es contenido propio de cada
página. Lo primero es layout; lo segundo, bloques.

**Ojo con los elementos que parecen chrome y no lo son**, y al revés. Un
breadcrumb puede estar dentro del hero de cada página en lugar de en la barra de
navegación; un widget de reservas fijo abajo es chrome, pero una tabla de
disponibilidad dentro de una ficha es un bloque.

### 4. Tokens

Colores, tipografías, radios y pesos. Van a `theme.css` del cliente por el
pipeline de `docs/arquitectura/tokens.md`. Suelen venir ya en un fichero de
tema del export.

### 5. Assets

Imágenes, vídeos e iconos propios. **Los nombres de fichero de un export suelen
ser hashes sin significado**, así que el texto alternativo hay que deducirlo de
dónde se usa cada imagen en el código, no del nombre.

Conviene anotar qué iconos **no** están en el set de la primitiva `Icon`: son
trabajo extra que de otro modo aparece a mitad de la implementación.

---

## Mapeo sección → bloque

Por cada sección, una de tres salidas:

| Salida | Cuándo |
|---|---|
| **Bloque de plataforma + props** | El patrón encaja en un bloque existente y sus ejes lo cubren |
| **Bloque de plataforma + slot** | Encaja, pero tiene un elemento propio del cliente que ningún eje describe |
| **Sin bloque** | El patrón no existe todavía. **Se reporta, no se improvisa** |

La tercera no es un fallo: con el primer cliente es lo normal, porque el
catálogo se está construyendo. Lo que no vale es inventar un bloque sobre la
marcha sin pasar por su historia.

---

## Qué NO se copia

El export es referencia visual, no código de producción (DEC-002). Al
analizarlo aparecen cosas que **no** deben trasladarse, y conviene anotarlas
como decisiones conscientes:

- **Fallos de accesibilidad o SEO.** Un hero cuyo título es una imagen de logo
  deja la página sin encabezado legible. Se arregla, no se copia.
- **Clases de utilidad inexistentes.** Los generadores producen clases que no
  existen en el framework (`items-left`, `justify-left`); lo que se ve es el
  valor por defecto, no un diseño.
- **Residuos del export.** Capas superpuestas invisibles, contenedores vacíos
  con animación, controles que no hacen nada.
- **Dependencias del export.** Suele arrastrar librerías de componentes enteras
  que no están en el stack. Las composiciones se reescriben con las primitivas
  propias.

---

## Formato del resultado

Un documento por cliente en su repo, con:

1. Una tabla de patrones ordenada por número de usos
2. El inventario por página: secciones en orden, contenido literal, patrón
3. La lista de chrome
4. El mapeo sección → bloque + props, incluyendo las secciones sin bloque
5. Las decisiones de "qué no se copia" y por qué

Ese documento es lo que lee el importador y lo que consulta quien construye
cada bloque.

---

## Relación con el importador

El análisis produce la **representación intermedia**: páginas, secciones en
orden, patrón detectado, contenido y assets. El importador la consume y escribe
en el CMS.

La costura importa porque está previsto analizar también sitios en producción
a partir de un sitemap. El analizador cambia según la fuente; lo que va después
—mapear a bloques y escribir en Payload— es común.

De un sitio en producción el contenido, las URLs y los metadatos SEO se extraen
bien; **la composición no**, porque el patrón hay que inferirlo de un DOM
arbitrario en vez de leerlo de un componente.
