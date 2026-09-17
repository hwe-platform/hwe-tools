/**
 * Censo de las combinaciones de clases que más se repiten en el contenido.
 *
 * Responde a la sección 4b de `specs/figma/analisis.md`: lo que sale arriba con
 * cuenta alta **es el sistema de diseño**. Un patrón que aparece más de tres
 * veces idéntico no es una casualidad: es un componente que alguien va a
 * reescribir a mano cada vez si no está catalogado.
 *
 * El caso que lo motivó: en La Civelle una misma etiqueta —versalitas, color de
 * acento, muy espaciada— aparecía **catorce veces**, no se catalogó, y el pie
 * se construyó con encabezados blancos en su lugar.
 *
 * Uso: node atomos.mjs <carpeta-del-export> [mínimo-de-repeticiones]
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

/** Utilidades que describen aspecto. El posicionamiento no define un átomo. */
const DE_ASPECTO =
  /^(text-|font-|tracking-|leading-|uppercase|lowercase|capitalize|italic|bg-|border|rounded|shadow|opacity-)/;

const raiz = await raizDelExport(process.argv);
const minimo = Number(process.argv[3] ?? 3);

/** @type {Map<string, {veces: number, origenes: string[]}>} */
const censo = new Map();

for (const ruta of await ficheros(raiz, ['.tsx', '.jsx'])) {
  const { texto, cita } = await leer(ruta, raiz);

  for (const { clases, linea } of [...clasesLiterales(texto), ...clasesDinamicas(texto)]) {
    // La firma de un átomo es su aspecto, ordenado, sin su posición: así
    // `text-sm font-bold` y `font-bold text-sm` cuentan como el mismo patrón.
    const firma = utilidades(clases)
      .filter((u) => DE_ASPECTO.test(u.replace(/^(?:[\w-]+:)+/, '')))
      .sort()
      .join(' ');

    if (firma.split(' ').length < 2) continue;

    const antes = censo.get(firma) ?? { veces: 0, origenes: [] };
    antes.veces++;
    if (antes.origenes.length < 3) antes.origenes.push(`${cita}:${linea}`);
    censo.set(firma, antes);
  }
}

console.log('# Átomos — combinaciones de clases repetidas');
console.log(
  `\n> Generado por \`scripts/atomos.mjs\` (mínimo ${minimo} repeticiones).`,
  '\n> **Lo que sale arriba es el sistema de diseño.** Lo que se repite más de tres',
  'veces va al lenguaje visual y probablemente merece ser una primitiva.',
);

const ordenado = [...censo.entries()]
  .filter(([, d]) => d.veces >= minimo)
  .sort((a, b) => b[1].veces - a[1].veces);

titulo('Patrones por número de apariciones');
tabla(
  ['Veces', 'Clases', 'Primeros usos'],
  ordenado.map(([firma, d]) => [
    `**${d.veces}**`,
    `\`${firma}\``,
    d.origenes.map((o) => `\`${o}\``).join(' '),
  ]),
);

console.log(
  `\n_${ordenado.length} patrones con ${minimo} o más repeticiones, de ${censo.size} distintos._`,
);
