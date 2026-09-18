---
id: HU-007
titulo: Layout components (TopBar, SecondaryNav, Footer, MobileMenu, Banner)
estado: hecha
prioridad: 2
hito: 1
agente: code-builder
rama: feat/HU-007-layout (mergeada)
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

- `docs/lenguaje-visual.md` del repo del cliente — **antes de escribir JSX**
- specs/payload/modelo-datos.md (sección globals)
- docs/arquitectura/bloques.md
- docs/estandares/codigo.md
- docs/estandares/naming.md
- docs/estandares/testing.md

## Verificar contra el diseño

Antes de marcar cualquier criterio, **comparar lo construido con la sección
correspondiente del export de Figma**, no de memoria. Los tests comprueban que
el dato sale; ninguno comprueba que salga como el diseño manda.

- Cada elemento usa el token que le asigna `docs/lenguaje-visual.md` del
  cliente — en particular las **etiquetas**, que van en color de acento y
  tipografía de cuerpo, no como encabezados
- Se respetan el ritmo vertical y el contenedor
- Las diferencias con el diseño están **listadas y justificadas**

Ver `specs/figma/analisis.md`, sección "Verificar contra el diseño".

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
- [x] Responsive: los componentes se adaptan a mobile — comprobado visualmente por
      la usuaria. **No hay tests de viewport**: la comprobación fue manual y no
      queda cubierta frente a regresiones (ver Notas)

## Notas

**El responsive no tiene red.** Se comprobó a ojo y está bien, pero no hay
tests de viewport, así que nada avisa si una clase responsive se rompe al tocar
otra cosa. El hueco lo cierra HU-012, que monta Playwright con pruebas de
mobile, tablet y escritorio; hasta entonces, cualquier cambio en el marco hay
que volver a mirarlo a mano.

Se deja dicho en vez de marcado y olvidado: un criterio verde por comprobación
manual y uno verde por test cubierto no valen lo mismo, y la diferencia se
pierde en cuanto pasan dos semanas.

## Retrospectiva

El marco quedó funcionalmente correcto y **visualmente distinto del diseño**.
Todos los criterios se podían marcar y la web no se parecía. Lo que falló y lo
que se ha cambiado para que no se repita:

**1. Se construyó desde el texto de la historia, no desde el export.** La barra
superior salió verde con texto blanco; el diseño la quiere crema con texto gris
de 11px. La navegación usó `--card` en vez de `--background`, perdió la escala
del chrome (11px, `tracking-[1.16px]`) y el subrayado dorado, que es lo único
que marca la sección activa.

**2. El artefacto que debía evitarlo tenía el dato mal.** `lenguaje-visual.md`
decía *"barra superior: `--primary` con texto `--primary-foreground`"*, escrito
de memoria. Un documento equivocado es peor que ninguno: quien lo lee deja de
mirar el diseño. De ahí la regla de trazabilidad —cada afirmación cita
fichero y línea del export— en `specs/figma/analisis.md`.

**3. Se copió un token que el diseño no usa.** El export declara
`--secondary-foreground` en verde oscuro y nunca lo pone sobre el dorado: usa
`text-primary-foreground` en cinco de siete botones. Copiar la declaración dejó
todos los botones de acento con texto verde. Ahora el método manda contar usos
reales (sección 4d).

**4. Tres de las cinco quejas eran contenido, no código.** El pie tenía dos
columnas de cinco, el menú seis entradas de ocho y el logo era un marcador de
7×5 píxeles. Se estuvo a punto de revisar componentes que estaban bien. Nueva
regla: comprobar el dato guardado **antes** de tocar código.

**5. Los rótulos fijos del pie quedaron en castellano** dentro de un site en
francés, escritos en el idioma de la conversación. Ahora son props con
valores por defecto en el idioma del cliente.

**Añadido al método** (`specs/figma/analisis.md`): secciones 4c (el chrome
tiene su propia escala), 4d (un token declarado puede no usarse), polaridad de
los assets, trazabilidad, inventario literal y completo, y "contenido antes que
código".
