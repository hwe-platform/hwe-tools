---
id: HU-006
titulo: Sistema de tokens y primitivas base
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-001]
---

## Contexto

Los tokens son lo que hace que los bloques se vean diferentes
en cada cliente sin tocar código. Las primitivas son los componentes
más básicos que todos los bloques usan. Sin estos dos, no se puede
construir ningún bloque.

## Qué hacer

### Tokens

1. Crear `@hwe-platform/core-ui/src/theme/token-contract.ts`:
   - Lista de todas las CSS variables que un theme.css debe definir
   - Valores por defecto como fallback
2. Crear un `theme.css` de referencia en `@hwe-platform/core-ui/src/theme/`
   basado en los tokens de La Civelle (primary, secondary, background, etc.)
3. Crear la configuración de `@theme inline` en `tailwind.css`
   que mapea CSS variables a clases de Tailwind
4. Crear `@layer base` con tipografía fluida (clamp) para h1-h6

### Primitivas

5. Crear `@hwe-platform/core-ui/src/primitives/Button.tsx`:
   - Variantes con CVA: primary, secondary, outline, ghost
   - Tamaños: sm, md, lg
   - Acepta como `<button>` o como `<a>` (con href)
   - Accesible: focus visible, aria-label si solo icono
6. Crear `@hwe-platform/core-ui/src/primitives/Image.tsx`:
   - Wrapper de `next/image` con srcSet basado en los sizes de media
   - `alt` obligatorio (error si no se pasa)
   - Aspect ratios predefinidos: 16/9, 4/3, 1/1, 3/4
   - Placeholder blur opcional
7. Crear `@hwe-platform/core-ui/src/primitives/Icon.tsx`:
   - Wrapper de `lucide-react`
   - Set de iconos predefinidos para el proyecto (utensils, bed, waves, etc.)
   - Tamaños consistentes con el sistema de tokens
8. Crear `@hwe-platform/core-ui/src/primitives/Link.tsx`:
   - Wrapper de `next/link`
   - Detecta enlaces internos vs externos automáticamente
   - Externos abren en nueva pestaña con `rel="noopener noreferrer"`
9. Tests de cada primitiva:
   - Renderizado correcto con props válidas
   - Accesibilidad (vitest-axe)
   - Variantes y tamaños
10. Exportar todo desde el entry point de `@hwe-platform/core-ui`

## Leer antes

- docs/arquitectura/tokens.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] Token contract define todas las CSS variables de la spec
- [ ] `@theme inline` mapea correctamente CSS variables a clases Tailwind
- [ ] Tipografía fluida funciona (h1 escala entre mobile y desktop)
- [ ] Button renderiza todas las variantes y tamaños
- [ ] Image obliga a pasar `alt` (error en TypeScript si falta)
- [ ] Icon renderiza iconos del set predefinido
- [ ] Link distingue internos de externos automáticamente
- [ ] Todas las primitivas pasan vitest-axe sin violaciones
- [ ] Tests de cada primitiva — cobertura >80%
- [ ] JSDoc en castellano en todos los componentes exportados
- [ ] Las primitivas son importables desde `@hwe-platform/core-ui`

## Retrospectiva

_(se llena después si aplica)_
