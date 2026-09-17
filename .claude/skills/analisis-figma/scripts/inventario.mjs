/**
 * Extrae las listas de contenido literales del export, completas.
 *
 * Responde a "El inventario es literal y completo" de
 * `specs/figma/analisis.md`. Es lo que el importador escribe en el CMS, así que
 * una lista recortada aquí es contenido que falta en la web — y que se ve
 * exactamente igual que una maquetación rota.
 *
 * El caso que lo motivó: se sembraron seis entradas de menú de las ocho del
 * diseño y dos columnas de pie de las cinco. Se estuvo a punto de revisar
 * componentes que estaban bien.
 *
 * Detecta además el idioma del contenido, porque los rótulos fijos de la
 * interfaz se escriben sin querer en el idioma de la conversación.
 *
 * Uso: node inventario.mjs <carpeta-del-export>
 */

import { ficheros, leer, numeroDeLinea, raizDelExport, titulo, tabla } from './lib.mjs';

/** Palabras muy frecuentes de cada idioma, para identificar el del contenido. */
const MARCADORES = {
  francés: /\b(le|la|les|des|nos|votre|vous|pour|avec|sur|et|du|au|aux|une|dans)\b/gi,
  castellano: /\b(el|la|los|las|nuestro|nuestra|su|para|con|sobre|del|una|en)\b/gi,
  inglés: /\b(the|our|your|for|with|about|and|from|this|all)\b/gi,
  alemán: /\b(der|die|das|und|für|mit|unsere|ihre|von|auf)\b/gi,
  italiano: /\b(il|lo|gli|nostri|vostra|per|con|della|delle|negli)\b/gi,
};

/**
 * Encuentra el cierre del corchete abierto en `inicio`, respetando anidamiento
 * y cadenas. Devuelve -1 si no cierra.
 */
function cierre(texto, inicio) {
  let nivel = 0;
  let comilla = null;

  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (comilla) {
      if (c === '\\') i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') comilla = c;
    else if (c === '[' || c === '{' || c === '(') nivel++;
    else if (c === ']' || c === '}' || c === ')') {
      nivel--;
      if (nivel === 0) return i;
    }
  }
  return -1;
}

/**
 * Parte una región `[...]` en sus elementos de primer nivel.
 *
 * Contar las cadenas sueltas daría treinta para un menú de ocho entradas con
 * desplegables, que es justo el número que **no** hay que sembrar. Lo que se
 * inventaría es la lista de primer nivel, y aparte sus hijos.
 */
function elementosDeNivel1(region) {
  const dentro = region.slice(1, -1);
  const partes = [];
  let nivel = 0;
  let comilla = null;
  let desde = 0;

  for (let i = 0; i < dentro.length; i++) {
    const c = dentro[i];
    if (comilla) {
      if (c === '\\') i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') comilla = c;
    else if (c === '[' || c === '{' || c === '(') nivel++;
    else if (c === ']' || c === '}' || c === ')') nivel--;
    else if (c === ',' && nivel === 0) {
      partes.push(dentro.slice(desde, i));
      desde = i + 1;
    }
  }
  partes.push(dentro.slice(desde));
  return partes.map((p) => p.trim()).filter((p) => p.length > 0);
}

/**
 * El texto que de verdad ve el visitante: nodos JSX y cadenas con aspecto de
 * prosa. Analizar el fichero entero daría el idioma del **código**, que siempre
 * es inglés, y llevaría a poner los rótulos en el idioma equivocado.
 */
function textoVisible(texto) {
  const trozos = [];
  for (const m of texto.matchAll(/>([^<>{}\n]{3,})</g)) trozos.push(m[1]);
  for (const m of texto.matchAll(/(["'])((?:\\.|(?!\1)[^\\\r\n])*)\1/g)) {
    const t = m[2];
    if (/\s/.test(t) && /[a-zA-ZÀ-ÿ]/.test(t) && !/[<>{}#]|^https?:|\//.test(t)) trozos.push(t);
  }
  return trozos.join(' ');
}

/** Los textos entrecomillados de una región, en orden y sin repetir seguidos. */
function textosDe(region) {
  const salida = [];
  const re = /(["'])((?:\\.|(?!\1)[^\\\r\n])*)\1/g;
  let m;
  while ((m = re.exec(region)) !== null) {
    const t = m[2].trim();
    // Descarta rutas, clases y claves técnicas: no son contenido visible.
    if (t.length < 2) continue;
    if (/^[#/]/.test(t) || /^https?:/.test(t)) continue;
    if (/^[a-z-]+$/.test(t) && !/\s/.test(t)) continue;
    salida.push(t);
  }
  return salida;
}

const raiz = await raizDelExport(process.argv);
const rutas = await ficheros(raiz, ['.tsx', '.jsx']);

console.log('# Inventario literal de listas');
console.log(
  '\n> Generado por `scripts/inventario.mjs`. **Se siembran todas las entradas de',
  'cada lista, no una muestra.** Una lista a medias se ve igual que un fallo de maquetación.',
);

const listas = [];
let corpus = '';

for (const ruta of rutas) {
  const { texto, cita } = await leer(ruta, raiz);
  corpus += ` ${textoVisible(texto)}`;

  // Un array es "de contenido" si alimenta un .map() o tiene nombre propio.
  const re = /(?:const\s+([A-Za-z_]\w*)\s*(?::[^=]+)?=\s*|\{\s*)\[/g;
  let m;
  const vistos = new Set();

  while ((m = re.exec(texto)) !== null) {
    const inicio = texto.indexOf('[', m.index);
    if (vistos.has(inicio)) continue;
    const fin = cierre(texto, inicio);
    if (fin === -1) continue;

    const region = texto.slice(inicio, fin + 1);
    const cola = texto.slice(fin + 1, fin + 12);
    const nombre = m[1];
    if (!nombre && !cola.includes('.map(')) continue;

    const elementos = elementosDeNivel1(region);
    const items = elementos.map((e) => textosDe(e));
    if (items.flat().length < 2) continue;

    vistos.add(inicio);
    listas.push({
      origen: `${cita}:${numeroDeLinea(texto, inicio)}`,
      nombre: nombre ?? '(en línea, alimenta un .map)',
      total: elementos.length,
      items,
    });
  }
}

titulo('Listas encontradas');
tabla(
  ['Origen', 'Nombre', 'Entradas'],
  listas.map((l) => [`\`${l.origen}\``, l.nombre, String(l.total)]),
);

titulo('Contenido completo de cada lista');
for (const l of listas) {
  console.log(`\n**\`${l.origen}\`** — ${l.nombre} (**${l.total}** entradas de primer nivel)\n`);
  for (const elemento of l.items) {
    if (elemento.length === 0) continue;
    const [primero, ...hijos] = elemento;
    console.log(
      `- ${primero}${hijos.length > 0 ? ` — *${hijos.length} hijos:* ${hijos.join(', ')}` : ''}`,
    );
  }
}

titulo('Idioma del contenido');
const puntuaciones = Object.entries(MARCADORES)
  .map(([idioma, re]) => [idioma, (corpus.match(re) ?? []).length])
  .sort((a, b) => b[1] - a[1]);

tabla(
  ['Idioma', 'Coincidencias'],
  puntuaciones.map(([i, n]) => [i, String(n)]),
);
console.log(
  `\n**Los rótulos fijos de la interfaz van en ${puntuaciones[0][0]}**, no en el idioma`,
  'de quien construye el site. Aplica a textos que no salen del CMS: "Contacto",',
  '"Síguenos", "Pagos aceptados", etiquetas de accesibilidad.',
);
