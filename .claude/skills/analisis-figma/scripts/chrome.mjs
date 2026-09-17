/**
 * Extrae las clases exactas del marco: barras, navegación, pie y menú móvil.
 *
 * Responde a la sección 4c de `specs/figma/analisis.md`: el chrome tiene su
 * propia escala y **no se deduce del contenido**. Es el error más caro porque
 * se ve en todas las páginas a la vez, y el más fácil de cometer porque todo el
 * mundo cree saber qué aspecto tiene una barra de navegación.
 *
 * No interpreta: vuelca lo que hay, con fichero y línea, para que quien
 * escriba el lenguaje visual copie en lugar de recordar.
 *
 * Uso: node chrome.mjs <carpeta-del-export>
 */

import {
  ficheros,
  leer,
  clasesLiterales,
  clasesDinamicas,
  utilidades,
  raizDelExport,
  titulo,
  tabla,
} from './lib.mjs';

/** Nombres de componente que son marco, no contenido. */
const NOMBRES_CHROME =
  /^(top|secondary|main|site|sticky)?(bar|nav|navbar|navigation|header|footer|menu|mobilemenu|drawer|sidebar)$/i;

/** Etiquetas HTML que delimitan el marco por sí solas. */
const ETIQUETAS_CHROME = /<(header|nav|footer)[\s>]/i;

/** Utilidades que definen el aspecto de una barra y que hay que copiar tal cual. */
const RELEVANTES =
  /^(bg-|text-|border|tracking-|font-|h-|uppercase|lowercase|rounded|shadow|grid-cols-|w-\[|px-|py-|gap-|max-w-)/;

/**
 * Localiza los componentes de primer nivel de un fichero y su rango de líneas.
 *
 * Sirve para atribuir cada clase al componente que la contiene, que es lo que
 * permite decir "esto es la barra superior" en vez de "esto sale en App.tsx".
 */
function componentes(lineas) {
  const encontrados = [];
  const re = /^(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*[:=])/;

  lineas.forEach((linea, i) => {
    const m = re.exec(linea);
    if (m) encontrados.push({ nombre: m[1] ?? m[2], desde: i + 1 });
  });

  return encontrados.map((c, i) => ({
    ...c,
    hasta: encontrados[i + 1] ? encontrados[i + 1].desde - 1 : lineas.length,
  }));
}

/** El componente que contiene una línea dada. */
function componenteDe(comps, linea) {
  return comps.find((c) => linea >= c.desde && linea <= c.hasta)?.nombre ?? '(nivel superior)';
}

const raiz = await raizDelExport(process.argv);
const rutas = await ficheros(raiz, ['.tsx', '.jsx']);

console.log('# Chrome — clases literales del export');
console.log(
  '\n> Generado por `scripts/chrome.mjs`. Cada fila cita su origen.',
  '\n> **No se interpreta nada aquí**: se copia al lenguaje visual leyendo estas líneas.',
);

const filas = [];
const barras = [];

for (const ruta of rutas) {
  const { lineas, cita, texto } = await leer(ruta, raiz);
  const comps = componentes(lineas);
  const esFicheroChrome = NOMBRES_CHROME.test(ruta.replace(/.*[\\/]/, '').replace(/\.[jt]sx$/, ''));

  for (const { clases, linea } of [...clasesLiterales(texto), ...clasesDinamicas(texto)]) {
    const comp = componenteDe(comps, linea);
    const contexto = lineas[linea - 1] ?? '';
    const esChrome =
      esFicheroChrome || NOMBRES_CHROME.test(comp) || ETIQUETAS_CHROME.test(contexto);

    const us = utilidades(clases);
    if (!esChrome) {
      // Aunque el componente no se llame "nav", una barra fija es marco.
      if (us.some((u) => /^(fixed|sticky)$/.test(u)) && us.some((u) => /^(top|bottom)-/.test(u))) {
        barras.push([`\`${cita}:${linea}\``, comp, `\`${clases.slice(0, 110)}\``]);
      }
      continue;
    }

    // La relevancia se juzga sobre la utilidad sin sus prefijos de variante,
    // pero se emite entera: `md:h-[40px]` es justo la altura a la que la
    // navegación se queda fija, y perderla deja el marco sin medida.
    const utiles = us.filter((u) => RELEVANTES.test(u.replace(/^(?:[\w-]+:)+/, '')));
    if (utiles.length === 0) continue;
    filas.push([`\`${cita}:${linea}\``, comp, `\`${utiles.join(' ')}\``]);
  }
}

titulo('Elementos del marco');
tabla(['Origen', 'Componente', 'Clases'], filas);

titulo('Barras posicionadas fuera de componentes con nombre de marco');
console.log('_Una barra fija es marco aunque su componente no se llame así._\n');
tabla(['Origen', 'Componente', 'Clases'], barras);

titulo('Qué hay que responder con esto');
console.log(
  [
    '- Fondo de **cada** barra — no se asume el color de marca',
    '- Altura de cada barra, y a qué altura queda fija la segunda',
    '- Escala tipográfica del marco: tamaño, peso, versalitas y `tracking`',
    '- Cómo se marca la sección activa',
    '- Forma del desplegable: radio, sombra, cuántos hijos lo pasan a dos columnas',
  ].join('\n'),
);
