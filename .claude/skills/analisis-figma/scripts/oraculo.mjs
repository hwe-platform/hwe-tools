/**
 * Prueba de regresión de los extractores contra un caso de respuestas conocidas.
 *
 * El caso es La Civelle, cuyo marco se construyó mal y cuyos ocho errores están
 * catalogados en `apps/site-demo/docs/lenguaje-visual.md`. Sabemos la respuesta
 * correcta de cada uno **verificada contra el export**, así que sirven de
 * oráculo: si un extractor deja de sacar el hecho que habría evitado un error,
 * esta prueba falla.
 *
 * No comprueba que el análisis sea bonito. Comprueba que **el hecho esté
 * disponible** para quien lo escriba. Que luego se use es el paso 5 del SKILL.
 *
 * Uso: node oraculo.mjs <carpeta-del-export> [ruta/a/Icon.tsx]
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const exportDir = process.argv[2];
const iconTsx = process.argv[3];

if (!exportDir) {
  console.error('Uso: node oraculo.mjs <carpeta-del-export> [ruta/a/Icon.tsx]');
  process.exit(1);
}

/** Ejecuta un extractor y devuelve su salida. */
function correr(script, args = []) {
  return execFileSync('node', [join(AQUI, script), exportDir, ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
}

const salidas = {
  chrome: correr('chrome.mjs'),
  tokens: correr('tokens.mjs'),
  atomos: correr('atomos.mjs'),
  inventario: correr('inventario.mjs'),
  assets: correr('assets.mjs', iconTsx ? [iconTsx] : []),
};

/**
 * Los ocho errores conocidos, con el hecho que tendría que haberlos evitado.
 *
 * `comprueba` recibe las salidas y devuelve el fragmento encontrado, o null.
 */
const CASOS = [
  {
    error: '1. El pie usó encabezados blancos en vez de la etiqueta dorada',
    hecho: 'La etiqueta en versalitas y color de acento es el átomo más repetido',
    comprueba: (s) =>
      /\*\*1[0-9]\*\*.*text-secondary.*uppercase/.test(s.atomos) &&
      s.atomos.match(/\| \*\*\d+\*\* \| `[^`]*text-secondary[^`]*uppercase[^`]*`/)?.[0],
  },
  {
    error: '3. Redes y pagos salieron como texto plano',
    hecho: 'Sus listas están inventariadas con su contenido literal',
    comprueba: (s) =>
      /Mastercard/.test(s.inventario) && /Instagram/.test(s.inventario)
        ? 'listas de pagos y redes presentes'
        : null,
  },
  {
    error: '4. La barra superior se pintó verde',
    hecho: 'El export la declara sobre el fondo de página, con borde inferior',
    comprueba: (s) => s.chrome.match(/TopBar \| `bg-background border-b border-border[^`]*`/)?.[0],
  },
  {
    error: '5. El botón dorado salió con texto verde oscuro',
    hecho: 'El tema declara un par que el diseño no usa nunca sobre el dorado',
    comprueba: (s) => s.tokens.match(/`--secondary` \| `secondary-foreground`[^\n]*⚠️[^\n]*/)?.[0],
  },
  {
    error: '6. La navegación se construyó sin marca de sección activa',
    hecho: 'El subrayado de acento está en el chrome, dentro de un ternario',
    comprueba: (s) => s.chrome.match(/SecondaryNav \| `h-0\.5 bg-secondary[^`]*`/)?.[0],
  },
  {
    error: '7. Los rótulos fijos quedaron en el idioma de la conversación',
    hecho: 'El idioma del contenido visible se detecta y se nombra',
    // `\w` no casa con las tildes de "francés" o "alemán".
    comprueba: (s) =>
      s.inventario.match(/\*\*Los rótulos fijos de la interfaz van en [^*]+\*\*/)?.[0],
  },
  {
    error: '8. Se sembraron 6 entradas de menú de las 8 del diseño',
    hecho: 'El menú está inventariado con su número de entradas de primer nivel',
    comprueba: (s) => s.inventario.match(/mainNavLinks \(\*\*\d+\*\* entradas[^\n]*/)?.[0],
  },
  {
    error: '+ El logo no aparecía: se subió una sola versión',
    hecho: 'El export le aplica un filtro de color, luego hacen falta dos',
    comprueba: (s) => s.assets.match(/`site-logo\.png`[^\n]*⚠️[^\n]*/)?.[0],
  },
];

console.log('# Oráculo — ¿los extractores sacan los hechos que evitaban cada error?\n');

let fallos = 0;
for (const caso of CASOS) {
  const encontrado = caso.comprueba(salidas);
  if (encontrado) {
    console.log(`✅ ${caso.error}`);
    console.log(`   ${caso.hecho}`);
    console.log(`   → ${String(encontrado).trim().slice(0, 150)}\n`);
  } else {
    fallos++;
    console.log(`❌ ${caso.error}`);
    console.log(`   Falta: ${caso.hecho}\n`);
  }
}

console.log(`\n**${CASOS.length - fallos} de ${CASOS.length}**`);
if (fallos > 0) {
  console.log(
    '\nUn ❌ significa que el extractor no deja disponible el hecho, así que quien',
    'escriba el análisis volverá a tener que recordarlo. Es justo el fallo que esto evita.',
  );
}
process.exit(fallos > 0 ? 1 : 0);
