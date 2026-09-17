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

### 4b. Lenguaje visual — **el paso que más se olvida**

Los tokens dicen *qué colores hay*. El lenguaje visual dice **qué papel juega
cada uno**, y sin él cualquiera —persona o skill— rellena los huecos a su
gusto y el resultado se parece al diseño solo por casualidad.

Es uno de los tres artefactos que DEC-002 exige extraer de cada Figma, junto a
los tokens y el análisis, y es el que se salta con más facilidad porque no
salta a la vista: el contenido aparece, la estructura es correcta, y aun así
"no se coloca bien".

Hay que registrar:

| Qué | Cómo se detecta |
|---|---|
| **Átomos repetidos** | Contar las clases exactas que más se repiten. El que aparece diez veces idéntico es un componente, no una casualidad |
| **Papel de cada token** | Qué token usa cada tipo de elemento: etiquetas, enlaces sobre fondo oscuro, botones, bordes |
| **Ritmo vertical** | El espaciado entre secciones, que suele ser el mismo en todas |
| **Contenedor** | Ancho máximo y márgenes laterales |
| **Jerarquía tipográfica** | Qué tipografía y tamaño lleva cada nivel, y con qué espaciado entre letras |

Un comando que lo saca en segundos:

```bash
grep -oE 'className="[^"]*"' App.tsx | sort | uniq -c | sort -rn | head -20
```

Lo que salga arriba con cuenta alta **es el sistema de diseño**. Si un patrón
aparece más de tres veces, va al lenguaje visual y probablemente merece ser una
primitiva.

**Caso real:** en el primer análisis de La Civelle se catalogaron las 24
secciones pero no los átomos. Se pasó por alto que una misma clase —etiqueta en
mayúsculas, color de acento, muy espaciada— aparecía **catorce veces**, y el
pie se construyó con encabezados blancos en lugar de esas etiquetas. El
contenido era correcto y el resultado no se parecía al diseño.

### 4c. El chrome tiene su propia escala

El punto 4b saca los átomos del **contenido**. El marco —barra superior,
navegación, pie— es un sistema aparte, más pequeño, y **no se deduce del
contenido**: hay que extraer sus clases exactas una por una.

Es el error más caro porque se ve en todas las páginas a la vez, y el más fácil
de cometer porque el chrome "se sabe": todo el mundo cree conocer el aspecto de
una barra de navegación.

Hay que anotar, leyendo el export y no de memoria:

| Qué | Por qué se escapa |
|---|---|
| **Fondo de cada barra** | Se asume el color de marca. Muchas veces es el de página |
| **Altura de cada barra**, y a qué altura se queda fija la segunda | Determina el hueco que hay que reservar |
| **Escala tipográfica del chrome** | Suele ir por debajo del `sm` del sistema: 10–12px con versalitas y espaciado entre letras propio |
| **Cómo se marca lo activo** | Subrayado, fondo, color. Si no se replica, el menú "funciona" y no orienta |
| **Forma del desplegable** | Radio, sombra, a partir de cuántos hijos pasa a dos columnas, a partir de qué entrada se alinea a la derecha |

**Caso real:** en La Civelle se construyó la barra superior en verde con texto
blanco. El diseño la quiere crema con texto gris de 11px: es una barra de
servicio y su peso tiene que quedar por debajo del de la navegación. El fallo
venía del propio `lenguaje-visual.md`, que decía "barra superior: `--primary`"
porque se escribió de memoria. De ahí la regla de la trazabilidad, más abajo.

### 4d. Un token declarado puede no usarse nunca

El fichero de tema del export **no es la verdad**: es lo que el generador dejó
escrito. Los exports arrastran la paleta por defecto de la librería de origen,
con pares de color que el diseño no usa en ningún sitio.

Por cada par `--x` / `--x-foreground`, contar sus usos reales antes de darlo por
bueno:

```bash
grep -rn 'bg-secondary' src/ | grep -oE 'text-[a-z-]+foreground' | sort | uniq -c
```

Si el diseño empareja el fondo con otro texto del que declara el tema, **manda
el uso**. Se corrige el token en el `theme.css` del cliente y se anota como
desviación deliberada, en lugar de meter casos especiales en cada componente.

**Caso real:** La Civelle declara `--secondary-foreground` en verde oscuro y
luego pone `text-primary-foreground` sobre el dorado en cinco de siete botones.
Copiar la declaración dejó todos los botones de acento con texto verde.

### 5. Assets

Imágenes, vídeos e iconos propios. **Los nombres de fichero de un export suelen
ser hashes sin significado**, así que el texto alternativo hay que deducirlo de
dónde se usa cada imagen en el código, no del nombre.

Conviene anotar qué iconos **no** están en el set de la primitiva `Icon`: son
trabajo extra que de otro modo aparece a mitad de la implementación.

**Los assets vienen en una sola polaridad.** Un logo suele exportarse solo en
blanco, y el diseño le aplica un filtro CSS cada vez que lo pone sobre fondo
claro. Hay que buscar esos filtros y anotar cuántas versiones hacen falta:

```bash
grep -rnE 'className="[^"]*(invert|brightness|grayscale)' src/
```

Las versiones se generan al importar y se suben **las dos al CMS**. El filtro no
se deja en el componente: el color del logo es un dato del cliente, y
`core-ui` no puede saber de qué color viene el de cada uno.

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

**Dos documentos** por cliente, en su repo:

`docs/analisis-figma.md` — el inventario:

1. Una tabla de patrones ordenada por número de usos
2. El inventario por página: secciones en orden, contenido literal, patrón
3. La lista de chrome
4. El mapeo sección → bloque + props, incluyendo las secciones sin bloque
5. Las decisiones de "qué no se copia" y por qué

`docs/lenguaje-visual.md` — las reglas transversales (punto 4b): átomos
repetidos, papel de cada token, ritmo, contenedor y jerarquía tipográfica.

El primero lo lee el importador. **El segundo lo lee quien construye cualquier
componente**, y es de consulta obligatoria: construir mirando solo la historia
de usuario produce código que cumple los criterios y no se parece al diseño.

### Cada afirmación cita de dónde sale

Los dos documentos se escriben **leyendo el export**, nunca de memoria ni del
recuerdo de haberlo leído. Para que eso sea comprobable y no un propósito, cada
afirmación sobre un color, un tamaño o un espaciado lleva al lado el fichero y
la línea del export de donde se sacó:

```markdown
| Barra superior | `--background` con borde `--border` | App.tsx:100 |
```

No es burocracia: es lo único que distingue un dato verificado de uno recordado,
y son indistinguibles una vez escritos. **Un artefacto con un dato mal es peor
que no tenerlo**, porque quien lo lee deja de mirar el diseño.

De ahí se sigue el criterio para revisarlo: no se lee el documento buscando
errores —ya parece correcto—, se coge cada fila y se abre la línea que cita.

### El inventario es literal y completo

El análisis recoge **todos** los elementos de cada lista, no una muestra: las
ocho entradas del menú, las cinco columnas del pie, los seis enlaces legales.
Es lo que el importador escribe en el CMS, así que una lista incompleta aquí es
contenido que falta en la web.

---

## Cuando el resultado no se parece: contenido antes que código

Al comparar la web con el diseño, la primera pregunta **no** es qué componente
está mal, sino **si el dato está puesto**. Un pie con dos columnas de cinco y
un menú con seis entradas de ocho se ven exactamente igual que una maquetación
rota, y llevan a reescribir componentes que estaban bien.

El orden barato:

1. Consultar el dato guardado en el CMS y contrastarlo con el inventario del
   análisis — ¿están las cinco columnas?, ¿el logo es el real o un marcador?
2. Solo si el dato está completo, comparar el componente con el export

**Caso real:** de las cinco quejas sobre la primera versión de La Civelle
—colores, columnas, iconos, cabecera y logo—, dos eran código y tres eran el
seed a medias, con un logo de 7×5 píxeles. Comprobarlo cuesta una consulta.

---

## Verificar contra el diseño

Los tests comprueban que el dato sale. **Ninguno comprueba que salga como el
diseño manda**, así que una historia puede tener todos sus criterios marcados y
un resultado que no se parece.

Antes de dar por hecho un componente o un bloque:

1. Comprobar primero que **el contenido está completo** (sección anterior).
   Media comparación se resuelve aquí
2. Abrir la sección correspondiente del export y **compararla con lo
   construido**, no de memoria
3. Comprobar que cada elemento usa el token que le asigna el lenguaje visual, y
   que ese token **se usa así en el export**, no solo que esté declarado (4d)
4. Comprobar que se respeta el ritmo vertical y el contenedor
5. En el marco, comprobar además fondo, altura, escala tipográfica y marca de
   activo (4c) — no se heredan de la escala del contenido
6. Comprobar que los **rótulos fijos de la interfaz** están en el idioma del
   cliente. Se escriben en el idioma de la conversación sin querer, y a nadie
   le chirría hasta que lo ve el cliente
7. Listar lo que se aparta del diseño y **por qué** — las diferencias
   deliberadas son legítimas, las no detectadas no

Es un paso manual, y por eso conviene que esté escrito: lo que no está en la
lista de comprobación no se comprueba.

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
