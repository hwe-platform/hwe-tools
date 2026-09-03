---
id: HU-012
titulo: Crear site demo con contenido real y deploy en Vercel
estado: spec-lista
prioridad: 3
hito: 1
agente: —
rama: —
dependencias: [HU-007, HU-009, HU-010, HU-011]
---

## Contexto

El site demo es la prueba final del Hito 1 — un site completo
funcionando con datos reales en Payload, todos los bloques renderizando,
multilingüe activo, desplegado en Vercel. `apps/site-demo/` ya existe
desde HU-002; esta historia carga contenido realista, lo verifica de
punta a punta y, si todo funciona, extrae el código como `hwe-template`.
Si funciona aquí, funciona para cualquier cliente.

## Qué hacer

### Desplegar el site

1. Configurar Vercel project para `apps/site-demo/` con dominio propio (ej: demo.hwe.dev)
2. Configurar Vercel Postgres (base de datos propia para el demo)
3. Configurar variables de entorno en Vercel

### Cargar contenido

4. Crear contenido en Payload admin basado en La Civelle:
   - site-config: nombre, contacto, coordenadas, idiomas (fr, en),
     redes sociales, pagos, horarios
   - header: topBar links + navegación con dropdowns
   - footer: columnas, partners, copyright
   - media: subir 20-30 imágenes representativas
   - accommodations: 3-4 alojamientos (emplacement, mobil-home, cottage)
     con specs, equipamiento, galería
   - entities: restaurante, piscina, 3-4 servicios, 3-4 entorno
   - categories: emplacements, locations
   - pages: home con todos los bloques, le-camping con bloques
   - articles: 2-3 artículos de blog

5. Cargar traducciones en inglés para los contenidos principales

### Verificar

6. Verificar todas las páginas en desktop y mobile
7. Verificar navegación completa (home → ficha → booking)
8. Verificar cambio de idioma (fr → en)
9. Verificar que las URLs traducidas funcionan
10. Verificar 404 para URLs inexistentes
11. Tests E2E con Playwright:
    - Navegación completa
    - Cambio de idioma
    - Responsive (mobile, tablet, desktop)
    - Todas las imágenes cargan (no rotas)
    - Todos los links internos resuelven (no 404)
12. Verificar HTML semántico en las páginas principales
13. Verificar que JSON-LD básico está presente (Organization, WebSite)
14. Verificar Core Web Vitals con Lighthouse

### Extraer hwe-template

15. Una vez que `apps/site-demo/` cumple todos los criterios de aceptación
    de esta historia, extraer su código como el repo `hwe-template`
    (ver DEC-007) — el template real que se clona para crear cada
    site de cliente

## Leer antes

- docs/decisiones/DEC-008-site-demo.md
- docs/decisiones/DEC-003-hosting.md
- specs/payload/modelo-datos.md
- docs/arquitectura/paginas-routing.md

## Criterios de aceptación

- [ ] Site accesible en URL pública (Vercel deploy)
- [ ] Home renderiza todos los bloques con datos reales
- [ ] Ficha de alojamiento muestra galería, specs, equipamiento
- [ ] Navegación con dropdowns funciona
- [ ] Footer muestra todas las secciones
- [ ] Cambio de idioma funciona (fr → en)
- [ ] URLs traducidas resuelven correctamente
- [ ] 404 para URLs inexistentes
- [ ] Responsive: se ve correctamente en mobile, tablet y desktop
- [ ] No hay imágenes rotas
- [ ] No hay links internos rotos
- [ ] HTML semántico (headings en orden, landmarks, alt en imágenes)
- [ ] JSON-LD básico presente
- [ ] Lighthouse performance score >80
- [ ] Tests E2E Playwright pasan
- [ ] `hwe-template` extraído como repo independiente a partir de `apps/site-demo/`

## Retrospectiva

_(se llena después si aplica)_
