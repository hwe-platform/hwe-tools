# Estándar de herramientas

Prettier y ESLint: qué son, por qué las usamos, y configuración concreta para HWE.

---

## Qué problema resuelven

### Prettier — formato automático

Prettier es un formateador de código. Decide dónde van los espacios, las comillas, los saltos de línea y las comas. Cuando guardas un archivo, Prettier lo reformatea automáticamente para que todo el código del proyecto tenga el mismo aspecto visual, sin importar quién lo escribió (humano o agente IA).

**No opina sobre si tu código es bueno o malo.** Solo sobre cómo se ve.

### ESLint — detección de errores

ESLint es un analizador de código. Tiene cientos de reglas que detectan problemas antes de que lleguen a producción: variables sin usar, imports olvidados, patrones peligrosos, y errores específicos de React y Next.js.

**No cambia el formato.** Solo señala problemas de lógica y buenas prácticas.

### Por qué las dos juntas

Prettier se encarga del formato. ESLint se encarga de la calidad. Cada una hace lo suyo sin solaparse. El paquete `eslint-config-prettier` desactiva las reglas de formato de ESLint para que no choquen con Prettier.

---

## Configuración de Prettier

Un único archivo `.prettierrc` en la raíz del monorepo:

```json
{
  "semi": true,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "trailingComma": "all",
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Qué significa cada opción

| Opción | Valor | Qué hace |
|--------|-------|----------|
| `semi` | `true` | Pone punto y coma al final de cada línea — evita ambigüedades en TypeScript |
| `singleQuote` | `true` | Comillas simples en código: `'texto'` |
| `jsxSingleQuote` | `false` | Comillas dobles en JSX: `<div className="x">` (convención React) |
| `tabWidth` | `2` | Indentación de 2 espacios (estándar del ecosistema React/Next.js) |
| `useTabs` | `false` | Espacios, no tabuladores |
| `printWidth` | `100` | Línea máxima de 100 caracteres (80 es muy corto para TypeScript) |
| `trailingComma` | `"all"` | Coma final en todo — diffs de Git más limpios |
| `arrowParens` | `"always"` | Siempre paréntesis en arrow functions: `(x) => x`, no `x => x` |
| `plugins` | `tailwindcss` | Ordena automáticamente las clases de Tailwind |

---

## Configuración de ESLint

Hay dos variantes según el tipo de paquete o app — no según el repo: desde
que `apps/site-demo/` vive dentro de `hwe-core` (DEC-007), un mismo repo
puede tener ambas variantes en carpetas distintas, cada una con su propio
`eslint.config.mjs`. La base de reglas propias (TypeScript estricto,
complejidad, etc.) es idéntica en ambas — lo único que cambia es de dónde
vienen las reglas de React/Next.js.

### Apps Next.js (`apps/site-demo/` en hwe-core, `hwe-template`, sites de cliente)

Estos repos corren Next.js de verdad, así que usan `eslint-config-next`.

`eslint-config-next` (verificado en la 15.4.x, la que usa `apps/site-demo/`)
todavía exporta sus configs en formato legado (`.eslintrc`, con `extends`),
no como arrays de flat config — `...nextVitals` falla con
`TypeError: nextVitals is not iterable`. Hace falta el puente `FlatCompat`
de `@eslint/eslintrc` (el mismo patrón que genera `create-next-app`):

```javascript
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default defineConfig([
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  prettier,
  {
    rules: {
      // ver "Reglas propias (ambas variantes)" más abajo
    },
  },
])
```

Requiere `@eslint/eslintrc` como devDependency. Si una versión futura de
`eslint-config-next` publica flat config nativo, este puente deja de hacer
falta — revisar antes de copiar este patrón a un repo nuevo.

#### Qué incluye `eslint-config-next/core-web-vitals`

Este paquete oficial de Next.js trae reglas de tres áreas:

- **React** — Reglas generales de React (no usar índices como key, props correctas, etc.)
- **React Hooks** — Los hooks solo se llaman en el nivel superior, nunca dentro de condicionales o bucles
- **Next.js** — Usar `<Image>` en vez de `<img>`, usar `<Link>` en vez de `<a>`, no cargar scripts síncronos

#### Qué incluye `eslint-config-next/typescript`

Reglas específicas para TypeScript: no usar `any`, tipos consistentes, imports de tipo correctos.

### Paquetes de componentes (`packages/core-ui/` en hwe-core)

`packages/core-ui/` no es una app Next.js — es un paquete de componentes
que consumen otras apps. **No uses `eslint-config-next` aquí**: su parser
intenta cargar `next/dist/compiled/babel/eslint-parser`, que solo existe
si el paquete `next` está instalado de verdad. Añadirlo únicamente para
que el linter no falle sería una dependencia de varios cientos de MB sin
ningún uso real (viola la regla de "no añadir dependencias sin
justificación" de `codigo.md`). Esto aplica al paquete, no al repo entero
— `apps/site-demo/`, en el mismo `hwe-core`, sí es una app Next.js real
y usa la variante de arriba.

En su lugar, compón directamente los mismos plugins que
`eslint-config-next` trae por debajo, sin pasar por Next.js:

```javascript
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  prettier,
  {
    settings: {
      // Fija la versión de React que consumen los sites (Next 15 → React 19)
      // para que eslint-plugin-react no intente detectarla desde una
      // dependencia "react" que este paquete no instala.
      react: { version: '19.0.0' },
    },
    rules: {
      // ver "Reglas propias (ambas variantes)" más abajo
    },
  },
])
```

Cobertura equivalente a `eslint-config-next`:

| `eslint-config-next` trae... | Aquí lo da... |
|-------------------------------|---------------|
| Reglas de TypeScript | `typescript-eslint` (`tseslint.configs.recommended`) |
| Reglas de React | `eslint-plugin-react` (`configs.flat.recommended` + `jsx-runtime`) |
| Reglas de React Hooks | `eslint-plugin-react-hooks` (`configs.flat.recommended`) |
| Accesibilidad JSX | `eslint-plugin-jsx-a11y` (no viene en `eslint-config-next`, se añade aparte) |
| Reglas `<Image>`/`<Link>` de Next.js | No aplica — no hay páginas Next.js en una librería |

### Reglas propias (ambas variantes)

El bloque final de reglas es el mismo en las dos variantes:

```javascript
{
  rules: {
    // TypeScript estricto
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',

    // Variables sin usar (excepto las que empiezan con _)
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],

    // Prohibir @ts-ignore — usar @ts-expect-error con comentario
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-ignore': true,
      'ts-expect-error': 'allow-with-description',
    }],

    // Console: warning en dev, error en CI
    'no-console': process.env.CI ? 'error' : 'warn',

    // Complejidad
    'complexity': ['warn', { max: 10 }],
    'max-depth': ['warn', { max: 3 }],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 3 }],
  },
}
```

### Qué hace `eslint-config-prettier`

Desactiva todas las reglas de formato de ESLint que chocan con Prettier. Sin esto, ESLint y Prettier se pelean sobre dónde poner los espacios.

---

## Cómo se ejecutan

### En el editor (automático al guardar)

VS Code se configura para que al guardar un archivo:
1. Prettier formatea
2. ESLint corrige lo que pueda (imports sin usar, etc.)

Archivo `.vscode/settings.json` en la raíz del monorepo:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### En CI (GitHub Actions)

En cada PR, GitHub Actions ejecuta:
1. `prettier --check .` — verifica que todo esté formateado
2. `eslint .` — verifica que no hay errores de lint

Si alguno falla, la PR no se puede mergear.

---

## Resumen

| Herramienta | Qué hace | Archivo de config | Cuándo se ejecuta |
|-------------|----------|-------------------|-------------------|
| Prettier | Formateo automático | `.prettierrc` | Al guardar + CI |
| ESLint | Detección de errores | `eslint.config.mjs` | Al guardar + CI |
| `eslint-config-next` | Reglas React/Next.js — solo repos-app | (integrado en ESLint config) | — |
| `typescript-eslint` + `eslint-plugin-react/-react-hooks/-jsx-a11y` | Reglas React/TS equivalentes — solo repos-librería | (integrado en ESLint config) | — |
| `eslint-config-prettier` | Evita conflictos entre ambas | (integrado en ESLint config) | — |
| `prettier-plugin-tailwindcss` | Ordena clases de Tailwind | (integrado en Prettier config) | Al guardar + CI |
