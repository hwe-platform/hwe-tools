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

Un único archivo `eslint.config.mjs` en la raíz del monorepo:

```javascript
import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
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
  },
])
```

### Qué incluye `eslint-config-next/core-web-vitals`

Este paquete oficial de Next.js trae reglas de tres áreas:

- **React** — Reglas generales de React (no usar índices como key, props correctas, etc.)
- **React Hooks** — Los hooks solo se llaman en el nivel superior, nunca dentro de condicionales o bucles
- **Next.js** — Usar `<Image>` en vez de `<img>`, usar `<Link>` en vez de `<a>`, no cargar scripts síncronos

### Qué incluye `eslint-config-next/typescript`

Reglas específicas para TypeScript: no usar `any`, tipos consistentes, imports de tipo correctos.

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
| `eslint-config-prettier` | Evita conflictos entre ambas | (integrado en ESLint config) | — |
| `prettier-plugin-tailwindcss` | Ordena clases de Tailwind | (integrado en Prettier config) | Al guardar + CI |
