---
id: HU-007
titulo: Layout components (TopBar, SecondaryNav, Footer, MobileMenu, Banner)
estado: spec-lista
prioridad: 2
hito: 1
agente: —
rama: —
dependencias: [HU-005, HU-006]
---

## Contexto

Los layout components son el "envoltorio" de todas las páginas.
TopBar, navegación, footer y banner aparecen en cada página del site.
Necesitan datos reales de los globals de Payload (header, footer, banner,
site-config) para funcionar.

## Qué hacer

1. Crear `@hwe/core-ui/src/layout/TopBar.tsx`:
   - Links utility configurables desde header.topBar
   - Selector de idioma (lee languages de site-config)
   - Botón de reservar con label configurable
   - Botón burger para mobile
   - Responsive: visible en desktop, colapsado en mobile

2. Crear `@hwe/core-ui/src/layout/SecondaryNav.tsx`:
   - Logo desde site-config
   - Items de navegación desde header.navigation
   - Dropdowns para items con children
   - Sticky on scroll
   - Responsive: horizontal en desktop, oculto en mobile (usa MobileMenu)

3. Crear `@hwe/core-ui/src/layout/MobileMenu.tsx`:
   - Drawer lateral derecho
   - Mismos items de navegación que SecondaryNav
   - Dropdowns expandibles (accordion)
   - Se abre con el botón burger del TopBar

4. Crear `@hwe/core-ui/src/layout/Footer.tsx`:
   - Virtual assistant section (si enabled)
   - Columnas configurables por tipo (links, text, schedule, newsletter)
   - Partners con logos
   - Redes sociales (lee de site-config.social)
   - Métodos de pago (lee de site-config.payments)
   - Links legales (lee de site-config.legal)
   - Copyright
   - Responsive: columnas apilan en mobile

5. Crear `@hwe/core-ui/src/layout/Banner.tsx`:
   - Mensaje con tipo (info, warning, promo)
   - Botón cerrar si dismissible
   - Link opcional
   - Oculto si enabled=false

6. Crear `@hwe/core-ui/src/layout/SiteLayout.tsx`:
   - Componente wrapper que compone: Banner + TopBar + SecondaryNav +
     {children} + Footer
   - Recibe los globals de Payload como props

7. Tests de cada componente:
   - Renderizado con datos reales del Figma de La Civelle
   - Accesibilidad (vitest-axe)
   - Responsive (viewport tests si aplica)

8. Exportar todo desde `@hwe/core-ui`

## Leer antes

- specs/payload/modelo-datos.md (sección globals)
- docs/arquitectura/bloques.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Criterios de aceptación

- [ ] TopBar renderiza links, idioma y botón reservar desde datos de Payload
- [ ] SecondaryNav renderiza navegación con dropdowns desde datos de Payload
- [ ] SecondaryNav es sticky al hacer scroll
- [ ] MobileMenu se abre/cierra correctamente
- [ ] Footer renderiza columnas, partners, redes, pagos, legal
- [ ] Footer muestra newsletter si hay columna tipo newsletter
- [ ] Banner se muestra/oculta según enabled
- [ ] Banner se puede cerrar si dismissible
- [ ] SiteLayout compone todos los layout components
- [ ] Todos los componentes pasan vitest-axe
- [ ] Tests — cobertura >70%
- [ ] Responsive: los componentes se adaptan a mobile

## Retrospectiva

_(se llena después si aplica)_
