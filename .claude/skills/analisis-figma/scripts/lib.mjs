/**
 * Utilidades compartidas por los extractores del análisis de Figma.
 *
 * Todos los extractores emiten hechos **con su cita** —fichero y línea del
 * export— porque un dato recordado y uno verificado son indistinguibles una vez
 * escritos, y el segundo es el único que sirve. Ver `specs/figma/analisis.md`,
 * sección "Cada afirmación cita de dónde sale".
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

/** Carpetas que nunca se recorren: no son diseño del cliente. */
const IGNORADAS = new Set(['node_modules', '.git', 'dist', 'build', '.next']);

/**
 * Recorre un directorio y devuelve los ficheros con las extensiones pedidas.
 *
 * @param {string} raiz
 * @param {string[]} extensiones p. ej. `['.tsx', '.ts']`
 * @returns {Promise<string[]>} rutas absolutas
 */
export async function ficheros(raiz, extensiones) {
  const salida = [];

  async function recorrer(dir) {
    let entradas;
    try {
      entradas = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      if (IGNORADAS.has(entrada.name)) continue;
      const ruta = join(dir, entrada.name);
      if (entrada.isDirectory()) await recorrer(ruta);
      else if (extensiones.includes(extname(entrada.name))) salida.push(ruta);
    }
  }

  await recorrer(raiz);
  return salida.sort();
}

/**
 * Lee un fichero y lo devuelve partido en líneas, junto a su ruta relativa.
 *
 * @param {string} ruta
 * @param {string} raiz base para la cita
 */
export async function leer(ruta, raiz) {
  const texto = await readFile(ruta, 'utf8');
  return { texto, lineas: texto.split('\n'), cita: relative(raiz, ruta).replace(/\\/g, '/') };
}

/**
 * Extrae todos los `className="..."` de un texto, con su número de línea.
 *
 * Solo recoge cadenas literales. Las plantillas con interpolación se recogen
 * aparte con {@link clasesDinamicas}, porque ahí las clases dependen del estado
 * y hay que leerlas con más cuidado.
 *
 * @returns {{clases: string, linea: number}[]}
 */
export function clasesLiterales(texto) {
  const salida = [];
  const re = /className="([^"]*)"/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    salida.push({ clases: m[1], linea: numeroDeLinea(texto, m.index) });
  }
  return salida;
}

/**
 * Extrae los `className={`...`}` con interpolación, con su número de línea.
 *
 * @returns {{clases: string, linea: number}[]}
 */
export function clasesDinamicas(texto) {
  const salida = [];
  const re = /className=\{`([^`]*)`\}/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    salida.push({ clases: m[1], linea: numeroDeLinea(texto, m.index) });
  }
  return salida;
}

/** Número de línea (1-based) de una posición dentro de un texto. */
export function numeroDeLinea(texto, indice) {
  let n = 1;
  for (let i = 0; i < indice; i++) if (texto[i] === '\n') n++;
  return n;
}

/**
 * Parte una cadena de clases en utilidades sueltas.
 *
 * Limpia los restos de sintaxis que deja un ternario dentro de una plantilla
 * —comillas, llaves, interrogantes—. No es cosmética: en un ternario van las
 * clases del **estado activo**, y sin esta limpieza `"bg-secondary"` se
 * descarta por empezar con comilla. Justo el subrayado que marca la sección
 * actual se perdía así.
 */
export function utilidades(clases) {
  return clases
    .split(/\s+/)
    .map((u) =>
      u
        .replace(/^[`"'({?:]+/, '')
        .replace(/[`"')}?:,;]+$/, '')
        .trim(),
    )
    .filter((u) => u.length > 0 && !u.includes('${') && !/^[?:&|]+$/.test(u));
}

/** Imprime una cabecera de sección en el informe. */
export function titulo(texto) {
  console.log(`\n## ${texto}\n`);
}

/** Imprime una tabla markdown. `filas` es una lista de listas de celdas. */
export function tabla(cabeceras, filas) {
  if (filas.length === 0) {
    console.log('_(nada encontrado)_');
    return;
  }
  console.log(`| ${cabeceras.join(' | ')} |`);
  console.log(`|${cabeceras.map(() => '---').join('|')}|`);
  for (const fila of filas) console.log(`| ${fila.join(' | ')} |`);
}

/**
 * Resuelve el directorio del export a partir de los argumentos.
 *
 * Acepta tanto la raíz del export como su `src/`, porque las dos son formas
 * naturales de invocarlo.
 */
export async function raizDelExport(argv) {
  const dado = argv[2];
  if (!dado) {
    console.error('Uso: node <script>.mjs <carpeta-del-export-de-figma>');
    process.exit(1);
  }
  try {
    const s = await stat(dado);
    if (!s.isDirectory()) throw new Error('no es un directorio');
  } catch {
    console.error(`No existe la carpeta: ${dado}`);
    process.exit(1);
  }
  return dado;
}
