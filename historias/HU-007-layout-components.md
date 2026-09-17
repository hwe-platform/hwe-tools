---
id: HU-007
titulo: Layout components (TopBar, SecondaryNav, Footer, MobileMenu, Banner)
estado: en-revisión
prioridad: 2
hito: 1
agente: code-builder
rama: feat/HU-007-layout
dependencias: [HU-005, HU-006]
---

## Contexto

Los layout components son el "envoltorio" de todas las páginas.
TopBar, navegación, footer y banner aparecen en cada página del site.
Necesitan datos reales de los globals de Payload (header, footer, banner,
site-config) para funcionar.

## Qué hacer

1. Crear `@hwe-platform/core-ui/src/layout/TopBar.tsx`:
   - Links utility configurables desde header.topBar
   - Selector de idioma (lee languages de site-config)
   - Botón de reservar con label configurable
   - Botón burger para mobile
   - Responsive: visible en desktop, colapsado en mobile

2. Crear `@hwe-platform/core-ui/src/layout/SecondaryNav.tsx`:
   - Logo desde site-config
   - Items de navegación desde header.navigation
   - Dropdowns para items con children
   - Sticky on scroll
   - Responsive: horizontal en desktop, oculto en mobile (usa MobileMenu)

3. Crear `@hwe-platform/core-ui/src/layout/MobileMenu.tsx`:
   - Drawer lateral derecho
   - Mismos items de navegación que SecondaryNav
   - Dropdowns expandibles (accordion)
   - Se abre con el botón burger del TopBar

4. Crear `@hwe-platform/core-ui/src/layout/Footer.tsx`:
   - Virtual assistant section (si enabled)
   - Columnas configurables por tipo (links, text, schedule, newsletter)
   - Partners con logos
   - Redes sociales (lee de site-config.social)
   - Métodos de pago (lee de site-config.payments)
   - Links legales (lee de site-config.legal)
   - Copyright
   - Responsive: columnas apilan en mobile

5. Crear `@hwe-platform/core-ui/src/layout/Banner.tsx`:
   - Mensaje con tipo (info, warning, promo)
   - Botón cerrar si dismissible
   - Link opcional
   - Oculto si enabled=false

6. Crear `@hwe-platform/core-ui/src/layout/BottomBookingWidget.tsx`:
   - Panel fijo al fondo de la ventana, compartido por todas las páginas
   - Pestaña que lo despliega y repliega (`Réserver votre séjour` / `Fermer la recherche`)
   - Dentro: fechas del viaje, participantes y botón de buscar
   - **No confundir con el `BookingWidget` de la ficha de alojamiento** (la tabla de precios y
     disponibilidad), que es un bloque de contenido y va en HU-011

7. Crear `@hwe-platform/core-ui/src/layout/FloatingActions.tsx`:
   - Botón de chat fijo abajo a la derecha
   - Botón de volver arriba, que aparece al pasar cierto scroll
   - Ambos por encima del resto del contenido

8. Crear `@hwe-platform/core-ui/src/layout/SiteLayout.tsx`:
   - Componente wrapper que compone: Banner + TopBar + SecondaryNav +
     {children} + Footer + BottomBookingWidget + FloatingActions
   - Recibe los globals de Payload como props
   - **El breadcrumb no va aquí**: en el Figma vive dentro del hero de cada página, así que es
     responsabilidad del bloque hero (HU-009), no del layout

9. Tests de cada componente:
   - Renderizado con datos reales del Figma de La Civelle
   - Accesibilidad (vitest-axe)
   - Responsive (viewport tests si aplica)

10. Exportar todo desde `@hwe-platform/core-ui`

## Leer antes

- specs/payload/modelo-datos.md (sección globals)
- docs/arquitectura/bloques.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Criterios de aceptación

- [x] TopBar renderiza links, idioma y botón reservar desde datos de Payload
- [x] SecondaryNav renderiza navegación con dropdowns desde datos de Payload
- [x] SecondaryNav es sticky al hacer scroll
- [x] MobileMenu se abre/cierra correctamente
- [x] Footer renderiza columnas, partners, redes, pagos, legal
- [x] Footer muestra newsletter si hay columna tipo newsletter
- [x] Banner se muestra/oculta según enabled
- [x] Banner se puede cerrar si dismissible
- [x] BottomBookingWidget se despliega y repliega, y queda fijo al fondo
- [x] El botón de volver arriba aparece solo tras hacer scroll
- [x] SiteLayout compone todos los layout components
- [x] Todos los componentes pasan vitest-axe
- [x] Tests — cobertura >70%
- [ ] Responsive: los componentes se adaptan a mobile — **sin verificar**: las clases
      responsive están puestas, pero no hay tests de viewport ni comprobación visual

## Retrospectiva

_(se llena después si aplica)_
