/**
 * Inventaría los assets del export y detecta los que necesitan más de una versión.
 *
 * Responde a la sección 5 de `specs/figma/analisis.md`. Dos cosas se escapan
 * siempre:
 *
 * 1. **La polaridad.** Un logo suele exportarse solo en blanco y el diseño le
 *    aplica `invert` cada vez que lo pone sobre fondo claro. Si solo se sube esa
 *    versión, el logo desaparece sobre el fondo claro del cliente.
 * 2. **Los iconos que no están en el set propio**, que son trabajo extra que de
 *    otro modo aparece a mitad de la implementación.
 *
 * Uso: node assets.mjs <carpeta-del-export> [ruta/a/Icon.tsx]
 */

import {
  ficheros,
  leer,
  clasesLiterales,
  clasesDinamicas,
  utilidades,
  numeroDeLinea,
  raizDelExport,
  titulo,
  tabla,
} from './lib.mjs';
import { readFile } from 'node:fs/promises';

/** Filtros CSS que cambian el color de un asset: delatan que falta una versión. */
const FILTROS = /^(invert|grayscale|sepia|brightness-|contrast-|hue-rotate-|saturate-)/;

const raiz = await raizDelExport(process.argv);
const rutaIcon = process.argv[3];
const rutas = await ficheros(raiz, ['.tsx', '.jsx']);

console.log('# Assets — inventario y polaridad');
console.log('\n> Generado por `scripts/assets.mjs`.');

/** @type {Map<string, {variable: string, usos: {origen: string, filtros: string[]}[]}>} */
const assets = new Map();
/** @type {Map<string, Set<string>>} */
const iconos = new Map();
const svgPropios = [];

for (const ruta of rutas) {
  const { texto, cita, lineas } = await leer(ruta, raiz);

  // Importaciones de ficheros de imagen o vídeo.
  const locales = new Map();
  for (const m of texto.matchAll(
    /import\s+(\w+)\s+from\s+["']([^"']+\.(?:png|jpe?g|svg|webp|avif|gif|mp4|webm))["']/g,
  )) {
    locales.set(m[1], m[2]);
    const clave = m[2].replace(/.*\//, '');
    if (!assets.has(clave)) assets.set(clave, { variable: m[1], usos: [] });
  }

  // Iconos de librería.
  for (const m of texto.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g)) {
    for (const nombre of m[1]
      .split(',')
      .map((s) => s.trim().split(/\s+as\s+/)[0])
      .filter(Boolean)) {
      if (!iconos.has(nombre)) iconos.set(nombre, new Set());
      iconos.get(nombre).add(cita);
    }
  }

  // Componentes de icono propios del cliente: SVG dibujados a mano.
  for (const m of texto.matchAll(/(?:function|const)\s+(\w*Icon\w*)\s*[=(]/g)) {
    svgPropios.push([m[1], `\`${cita}:${numeroDeLinea(texto, m.index)}\``]);
  }

  // Usos de cada asset, con los filtros aplicados en el mismo elemento.
  for (const { clases, linea } of [...clasesLiterales(texto), ...clasesDinamicas(texto)]) {
    // El `src` suele estar en la línea anterior o en la misma.
    const ventana = lineas.slice(Math.max(0, linea - 4), linea + 2).join(' ');
    const filtros = utilidades(clases)
      .map((u) => u.replace(/^(?:[\w-]+:)+/, ''))
      .filter((u) => FILTROS.test(u));

    for (const [variable, fichero] of locales) {
      if (!new RegExp(`src=\\{${variable}\\}`).test(ventana)) continue;
      const clave = fichero.replace(/.*\//, '');
      assets.get(clave)?.usos.push({ origen: `${cita}:${linea}`, filtros });
    }
  }
}

titulo('Assets y polaridad');
const filas = [];
for (const [fichero, datos] of assets) {
  const conFiltro = datos.usos.filter((u) => u.filtros.length > 0);
  const sinFiltro = datos.usos.filter((u) => u.filtros.length === 0);
  const necesitaDos = conFiltro.length > 0 && sinFiltro.length > 0;

  filas.push([
    `\`${fichero}\``,
    String(datos.usos.length),
    conFiltro.length > 0
      ? `\`${[...new Set(conFiltro.flatMap((u) => u.filtros))].join(' ')}\``
      : '—',
    necesitaDos
      ? `⚠️ **dos versiones** (con filtro: ${conFiltro[0].origen} · sin filtro: ${sinFiltro[0].origen})`
      : conFiltro.length > 0
        ? `⚠️ siempre con filtro — el fichero **no** trae el color final (${conFiltro[0].origen})`
        : datos.usos.length === 0
          ? '_sin usos detectados — comprobar a mano_'
          : 'una versión',
  ]);
}
tabla(['Fichero', 'Usos', 'Filtros', 'Veredicto'], filas);

console.log(
  '\n_Las versiones se generan **al importar** y se suben todas al CMS. El filtro no',
  'se deja en el componente: el color del logo es un dato del cliente, y `core-ui`',
  'no puede saber de qué color viene el de cada uno._',
);

titulo('Iconos de librería usados');
let conocidos = null;
if (rutaIcon) {
  try {
    const fuente = await readFile(rutaIcon, 'utf8');
    const bloque = /const ICONS\s*=\s*\{([\s\S]*?)\n\}/.exec(fuente);
    conocidos = new Set([...(bloque?.[1] ?? '').matchAll(/:\s*(\w+),/g)].map((m) => m[1]));
  } catch {
    console.log(`_No se pudo leer ${rutaIcon}; se listan todos sin comparar._\n`);
  }
}

tabla(
  ['Icono', conocidos ? '¿En el set propio?' : 'Usado en'],
  [...iconos.entries()]
    .sort()
    .map(([n, ficheros]) => [
      `\`${n}\``,
      conocidos
        ? conocidos.has(n)
          ? 'sí'
          : '⚠️ **falta — hay que añadirlo**'
        : [...ficheros].join(', '),
    ]),
);

titulo('Iconos propios del cliente (SVG dibujados a mano)');
console.log('_No existen en ninguna librería: hay que portarlos como componentes._\n');
tabla(['Componente', 'Origen'], svgPropios);
