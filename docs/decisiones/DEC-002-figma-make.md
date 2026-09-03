# DEC-002 — Figma Make como referencia visual

**Fecha:** 2026-08-31 | **Estado:** Aceptada

## Decisión
Figma Make es referencia visual y de comportamiento, nunca código
de producción. De cada exportación se extraen:

- **Tokens:** colores, tipografía, espaciado, radios, sombras.
- **Lenguaje visual:** patrones de diseño, estilo de componentes,
  jerarquía visual, densidad.
- **Comportamiento:** menús en responsive, elementos fijos/sticky,
  animaciones, transiciones, interacciones.
- **Estructura de páginas:** qué secciones aparecen en cada tipo
  de página y en qué orden (blueprint de compositions).
- **Responsive layout:** cambios de grid por breakpoint,
  apilamiento, visibilidad, proporciones de imagen.
- **Dirección de imagen:** estilo fotográfico, ratios predominantes,
  uso de vídeo, tratamiento visual del contenido multimedia.

El código real se construye con @hwe-platform/core-ui a partir de estos datos.

Un repositorio git independiente por cliente en figma-makes/{slug}/.
Cada importación se sella con git tag import-YYYY-MM-DD.
Los artefactos generados (tokens, análisis, design-language)
viven en el repo del sitio cliente, no dentro del clon de Figma.

## Por qué
El output de Figma Make no cumple los estándares de producción
(accesibilidad, SEO, rendimiento, arquitectura de bloques).
Usarlo como referencia permite mantener la fidelidad visual
y de interacción sin heredar sus limitaciones técnicas.