/**
 * Contrasta los tokens **declarados** en el tema con los **usados** en el diseño.
 *
 * Responde a la sección 4d de `specs/figma/analisis.md`: el fichero de tema de
 * un export no es la verdad, es lo que el generador dejó escrito. Suele
 * arrastrar la paleta por defecto de la librería de origen, con pares de color
 * que el diseño no usa en ningún sitio.
 *
 * El caso que motivó este script: La Civelle declara `--secondary-foreground`
 * en verde oscuro y luego pone `text-primary-foreground` sobre el dorado en
 * cinco de siete botones. Copiar la declaración dejó todos los botones de
 * acento con texto verde.
 *
 * Uso: node tokens.mjs <carpeta-del-export>
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

/** Lee las variables CSS declaradas, con la línea en que se declaran. */
async function declarados(raiz) {
  const mapa = new Map();
  for (const ruta of await ficheros(raiz, ['.css'])) {
    const { lineas, cita } = await leer(ruta, raiz);
    lineas.forEach((linea, i) => {
      const m = /^\s*--([\w-]+)\s*:\s*([^;]+);/.exec(linea);
      if (!m) return;
      // Los alias de `@theme inline` (`--color-x: var(--x)`) no son tokens
      // nuevos: son la misma variable con otro nombre, y duplicarían cada fila.
      if (m[2].trim().startsWith('var(')) return;
      // Solo la primera declaración: las siguientes suelen ser el modo oscuro.
      if (!mapa.has(m[1])) mapa.set(m[1], { valor: m[2].trim(), origen: `${cita}:${i + 1}` });
    });
  }
  return mapa;
}

const raiz = await raizDelExport(process.argv);
const vars = await declarados(raiz);

// Cada fondo con su texto acompañante, tal y como aparece en el diseño.
/** @type {Map<string, Map<string, {veces: number, primera: string}>>} */
const parejas = new Map();
/** @type {Map<string, number>} */
const usos = new Map();

for (const ruta of await ficheros(raiz, ['.tsx', '.jsx'])) {
  const { texto, cita } = await leer(ruta, raiz);

  for (const { clases, linea } of [...clasesLiterales(texto), ...clasesDinamicas(texto)]) {
    const us = utilidades(clases).map((u) => u.replace(/^(?:[\w-]+:)+/, ''));

    for (const u of us) {
      const base = u.replace(/\/\d+$/, '');
      const m = /^(?:bg|text|border|stroke|fill)-(.+)$/.exec(base);
      if (m && vars.has(m[1])) usos.set(m[1], (usos.get(m[1]) ?? 0) + 1);
    }

    // El par que importa: un fondo de color y el texto que lleva encima.
    const fondos = us.filter((u) => /^bg-/.test(u)).map((u) => u.slice(3).replace(/\/\d+$/, ''));
    // Solo los `text-*` que son color: el resto —`text-sm`, `text-center`— no
    // forman par con un fondo y solo ensucian la comparación.
    const textos = us
      .filter((u) => /^text-/.test(u))
      .map((u) => u.slice(5).replace(/\/\d+$/, ''))
      .filter((t) => vars.has(t) || t.endsWith('-foreground'));

    for (const fondo of fondos) {
      if (!vars.has(fondo)) continue;
      if (!parejas.has(fondo)) parejas.set(fondo, new Map());
      const dest = parejas.get(fondo);
      for (const t of textos) {
        const antes = dest.get(t);
        dest.set(t, {
          veces: (antes?.veces ?? 0) + 1,
          primera: antes?.primera ?? `${cita}:${linea}`,
        });
      }
    }
  }
}

console.log('# Tokens — declarado frente a usado');
console.log('\n> Generado por `scripts/tokens.mjs`. **Manda el uso, no la declaración.**');

titulo('Pares fondo/texto: lo que declara el tema vs lo que hace el diseño');

const filas = [];
for (const [nombre] of vars) {
  if (nombre.endsWith('-foreground')) continue;
  const parDeclarado = `${nombre}-foreground`;
  if (!vars.has(parDeclarado)) continue;

  const observados = parejas.get(nombre);
  if (!observados || observados.size === 0) {
    filas.push([
      `\`--${nombre}\``,
      `\`${parDeclarado}\``,
      '_nunca se usa como fondo_',
      '⚠️ sin datos',
    ]);
    continue;
  }

  const orden = [...observados.entries()].sort((a, b) => b[1].veces - a[1].veces);
  const detalle = orden.map(([t, d]) => `\`text-${t}\` ×${d.veces}`).join(', ');
  const dominante = orden[0][0];
  const coincide = dominante === parDeclarado;

  filas.push([
    `\`--${nombre}\``,
    `\`${parDeclarado}\``,
    detalle,
    coincide ? 'coincide' : `⚠️ **manda \`text-${dominante}\`** (${orden[0][1].primera})`,
  ]);
}

tabla(['Fondo', 'Texto declarado', 'Texto observado en el diseño', 'Veredicto'], filas);

titulo('Tokens declarados que el diseño no usa nunca');
const huerfanos = [...vars.entries()]
  .filter(([n]) => !usos.has(n))
  .map(([n, d]) => [`\`--${n}\``, `\`${d.valor}\``, `\`${d.origen}\``]);
tabla(['Token', 'Valor', 'Declarado en'], huerfanos);
console.log(
  '\n_Un token sin usos no es necesariamente sobrante —puede llegar por `@theme` a',
  'utilidades que no se buscan aquí—, pero **no se puede dar por bueno su papel**',
  'sin abrir el diseño._',
);

titulo('Qué hacer con un ⚠️');
console.log(
  [
    'Corregir el token en el `theme.css` **del cliente** y anotarlo como desviación',
    'deliberada, con su cita. Es preferible a meter casos especiales en cada',
    'componente: una sola línea arregla todos los botones a la vez, y la primitiva',
    'sigue emparejando un color con su texto como en cualquier otro cliente.',
  ].join('\n'),
);
