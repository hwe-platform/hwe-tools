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

### Tres asuntos aplazados que vencen aquí

Durante el Hito 1 se aplazaron tres decisiones a propósito, porque ninguna
bloquea el desarrollo en local. Las tres se cobran en esta historia, que es la
primera que despliega de verdad:

| Asunto | Qué falta | Dónde está el análisis |
|---|---|---|
| **Storage de media** | Elegir proveedor y montar el adapter. En local vale el filesystem; en Vercel las subidas del editor se evaporan en cada deploy | El paso 1 de esta historia, y «Análisis de storage» más abajo |
| **ISR** | La ruta renderiza en cada petición. Montar el cacheado exige `'use cache'` de Next 16 y una bandera experimental que afecta al admin de Payload | `docs/arquitectura/paginas-routing.md`, sección "Pendiente" |
| **Carpetas de media** | Payload las marca como experimentales; hay que comprobar que siguen funcionando en la versión que se despliegue | `specs/payload/modelo-datos.md`, sección `media` |
| **Migraciones sin aplicar** | `20260917_103556_carpetas_media` está pendiente. En local no se nota —el adapter sincroniza el esquema solo en desarrollo—, pero en producción no hay esa red | `docs/guias/entorno-local.md`, "Migraciones" |

Conviene resolverlas **antes** de cargar el contenido real, no después: las tres
afectan a cómo se comporta el site desplegado, y descubrirlas con contenido
dentro sale más caro.

## Qué hacer

### Desplegar el site

1. Configurar storage adapter para media en Vercel (Vercel Blob o
   equivalente, condicional por entorno: solo producción, no local). Añadir
   `BLOB_READ_WRITE_TOKEN` a `.env.example`
2. Configurar Vercel project para `apps/site-demo/` con dominio propio (ej: demo.hwe.dev)
3. Configurar Vercel Postgres (base de datos propia para el demo)
4. Configurar variables de entorno en Vercel

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

## Análisis de storage

> **Análisis previo escrito por el Code Builder. No es una decisión
> aprobada** — el Planner decidirá el proveedor cuando se ejecute esta
> historia.

Concreta la parte de media de [DEC-003](../docs/decisiones/DEC-003-hosting.md),
que dejaba el almacenamiento de archivos como «Blob Storage o equivalente».

Mientras el proyecto se trabaje en local no hace falta: Payload guarda en el
filesystem por defecto, sin adapter ni credenciales, y eso es lo que hay
configurado hoy. Esto existe para no rehacer el análisis el día que toque
decidir, que es el paso 1 de esta historia.

### Opción de partida

`@payloadcms/storage-vercel-blob` como adapter de almacenamiento de imágenes
en producción, manteniendo el filesystem en desarrollo local.

Así todo el stack queda en Vercel —app Next.js, Postgres y Blob— y cada site
de cliente tiene su propio proyecto Vercel con su Postgres y su Blob
aislados, en línea con el aislamiento por cliente de DEC-003.

La alternativa seria es Cloudflare R2 a través de `@payloadcms/storage-s3`:
API S3-compatible y sin coste de salida. En webs de hospitality las imágenes
son casi todo el tráfico, así que el egress —lo que Vercel cobra caro y R2 da
gratis— es lo que puede decantar la decisión.

### Por qué la opción de partida es Vercel Blob

Un solo proveedor mientras el proyecto es pequeño: un dashboard, una factura,
una sola integración que mantener. Vercel Blob se configura con una variable
de entorno y el adapter oficial de Payload, sin cuentas ni buckets aparte.

El coste de equivocarse es bajo, que es lo que permite decidir ya en lugar de
analizar. El egress de Vercel Blob es lo que puede doler con muchos sitios
con muchas fotos — por eso la revisión es de coste, no de funcionalidad.

### Qué cuesta cambiar de opinión

En código, poco: se sustituye el plugin en `payload.config.ts` y cambian las
variables de entorno. Las colecciones no se tocan, porque el adapter es
transparente para ellas.

En datos, algo más de lo que parece. Vercel Blob **no es S3-compatible** —
tiene su propio SDK—, así que no es cuestión de apuntar las mismas
credenciales a otro endpoint: hay que **copiar los ficheros existentes** al
bucket nuevo. Lo que no hay que migrar es la base de datos: Payload guarda
`filename` y deriva la URL a través del adapter, así que los documentos de
`media` siguen siendo válidos una vez movidos los archivos.

Conviene hacer el cambio, si se hace, antes de acumular muchos clientes: la
migración es por proyecto Vercel.

### Qué falta para decidir

- Medir coste real (almacenamiento + egress) con los primeros clientes en
  producción, junto a la evaluación de proveedor de DEC-003.
- Fijar un disparador concreto de revisión — «cuando haya volumen» no se
  dispara nunca. Algo como «al llegar a 5 clientes en producción o a X GB de
  egress al mes, lo que ocurra antes».
- Decidir si el bucket es uno por cliente (coherente con el aislamiento
  actual) o compartido con prefijos, cuando haya volumen.

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
- [ ] Media se almacena en Vercel Blob en producción y en filesystem en local
- [ ] `hwe-template` extraído como repo independiente a partir de `apps/site-demo/`

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_
