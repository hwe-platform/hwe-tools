# Sistema de tokens de diseño

Los tokens son lo que hace que el mismo bloque se vea diferente en cada cliente
sin tocar código. Variables CSS que controlan colores, tipografía y radios.

---

## Pipeline

```
Figma (diseño del cliente) → theme.css (CSS variables) → Tailwind v4 @theme inline → componentes
```

No hay JSON intermedio, no hay build step, no hay presets de JavaScript.
Tailwind v4 usa CSS nativo con `@theme inline` — las variables se declaran
en `:root` y Tailwind las consume directamente.

---

## Tres capas de theming

Las capas se apilan usando la cascada natural de CSS. Los componentes
no saben qué capa está activa — usan `text-primary`, `bg-secondary`,
y el valor correcto aparece.

### Capa 1 — Tema base del cliente (siempre presente)

La paleta de marca del cliente. Definida desde el Figma.
Es el default que se ve si no hay temporada ni personalización activa.

```css
/* theme.css */
:root {
  /* Paleta de marca */
  --primary: #0b665d;
  --primary-foreground: #fcfcf1;
  --secondary: #c9a87c;
  --secondary-foreground: #2e3c2e;
  --background: #fffeed;
  --foreground: #2e3c2e;
  --card: #ffffff;
  --card-foreground: #2e3c2e;
  --muted: #ecefee;
  --muted-foreground: #525252;
  --accent: #85a39c;
  --accent-foreground: #0b665d;
  --border: #ede5d8;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --ring: #0b665d;
  --footer: #393939;

  /* Tipografía */
  --heading-font: "Bitter", serif;
  --body-font: "Inter", sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Radios */
  --radius: 1rem;
}
```

### Capa 2 — Temporada (opcional, estática)

Override de tokens según la época del año. Igual para todos los visitantes.
Solo aplica si el cliente tiene `hasSeasons: true` en `site-config`.

```css
/* theme-summer.css */
:root[data-season="summer"] {
  --secondary: #e8a835;
  --accent: #f4a261;
  --background: #fffdf5;
}

/* theme-winter.css */
:root[data-season="winter"] {
  --secondary: #8b9dc3;
  --accent: #6b7a94;
  --background: #f5f7fa;
}
```

El frontend consulta `site-config` para saber qué temporadas existen
y sus rangos de fechas. Según la fecha actual, añade `data-season`
al elemento `<html>`.

### Capa 3 — Personalización IA (opcional, dinámica)

Override de tokens según el segmento del visitante detectado por la IA.
Diferente por visitante. Solo aplica cuando el módulo de personalización
está activo (Hito 3).

```css
/* personalization.css */
:root[data-segment="family"] {
  --secondary: #f4a261;
  --accent: #e76f51;
}

:root[data-segment="couple"] {
  --secondary: #d4a574;
  --accent: #b08968;
}
```

La IA no modifica componentes ni inventa colores. Selecciona qué
override activar añadiendo `data-segment` al `<html>`.
Las variantes de color por segmento se definen en Payload
(`personalization-config` global) y se generan como CSS.

### Cascada

```
Capa 1 (base)     — siempre activa
  ↓ override
Capa 2 (temporada) — si hasSeasons y estamos en rango de fechas
  ↓ override
Capa 3 (segmento)  — si personalización activa y segmento detectado
```

Un token solo necesita redefinirse en la capa superior si cambia.
Los que no se redefinen mantienen el valor de la capa inferior.

---

## Conexión con Tailwind v4

Tailwind v4 consume los tokens via `@theme inline` en el CSS:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-ring: var(--ring);
  --color-footer: var(--footer);
  --font-heading: var(--heading-font);
  --font-body: var(--body-font);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

Los componentes usan las clases de Tailwind (`bg-primary`, `text-muted-foreground`,
`rounded-lg`) y nunca acceden a las variables CSS directamente.

---

## Tipografía base

Definida en `@layer base` del CSS, usando los tokens:

```css
@layer base {
  body {
    @apply bg-background text-foreground font-body;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading font-bold;
  }

  h1 {
    font-size: clamp(3rem, 10vw, 5.5rem);
    line-height: 1.1;
  }

  h2 {
    font-size: clamp(2rem, 6vw, 3.5rem);
    line-height: 1.2;
  }

  h3 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    line-height: 1.3;
  }
}
```

Los tamaños de heading usan `clamp()` para ser fluidos entre
mobile y desktop sin breakpoints.

---

## Tokens por cliente

Cada cliente tiene sus propios valores. Mismas variables, diferentes valores.

| Token | La Civelle (camping) | Hotel ejemplo |
|-------|---------------------|---------------|
| `--primary` | `#0b665d` (verde teal) | `#1a1a2e` (azul oscuro) |
| `--secondary` | `#c9a87c` (dorado arena) | `#c4a35a` (dorado clásico) |
| `--background` | `#fffeed` (crema cálido) | `#fafafa` (blanco neutro) |
| `--heading-font` | Bitter (serif) | Playfair Display (serif) |
| `--body-font` | Inter (sans-serif) | Montserrat (sans-serif) |
| `--radius` | `1rem` (redondeado) | `0.5rem` (más anguloso) |

Los componentes son idénticos. Los tokens hacen todo el trabajo visual.

---

## Dónde vive cada cosa

| Qué | Dónde | Por qué |
|-----|-------|---------|
| `theme.css` (tema base) | Repo del cliente (`src/styles/`) | Cada cliente tiene su paleta |
| `theme-{season}.css` | Repo del cliente (`src/styles/`) | Temporadas son por cliente |
| `personalization.css` | Generado desde Payload config | Los segmentos se definen en Payload |
| `@theme inline` | Repo del cliente (`src/styles/`) | Conecta CSS vars con Tailwind |
| Tipografía base | `@hwe/core-ui` o repo cliente | Escalas tipográficas son estándar |

---

## Lo que Payload almacena

Payload nunca almacena colores, tipografía ni spacing directamente.
Solo metadatos de configuración:

```
site-config.theme
├── hasSeasons          (boolean)
└── seasons             (array, si hasSeasons)
    ├── name            (text — "summer", "winter")
    ├── startDate       (text — "06-15")
    └── endDate         (text — "09-15")
```

Los archivos CSS se generan desde el Figma del cliente
y se versionan en Git. No se editan en Payload.

---

## Lo que NO son tokens

- **Layout** (columnas, orden de bloques) — eso es Payload
- **Contenido** (textos, imágenes) — eso es Payload
- **Comportamiento** (sticky, animaciones) — eso es código del bloque
- **Imágenes por segmento** — eso es el array `personalization` en Payload

---

## Implementación por hito

| Hito | Qué se implementa |
|------|-------------------|
| Hito 1 | Capa 1 (tema base). Un `theme.css` por cliente. Pipeline Figma → CSS. |
| Hito 3 | Capa 3 (personalización). Generación de `personalization.css` desde config en Payload. |
| Cuando se necesite | Capa 2 (temporadas). Múltiples `theme-{season}.css` + lógica de fecha. |
