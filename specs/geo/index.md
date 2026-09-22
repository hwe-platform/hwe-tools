# Dominio: Geo

Especificaciones del dominio geográfico: mapa, ubicación y accesos.

## Visión general

Cada site de hospitality necesita mostrar su ubicación en un mapa y
cómo llegar. Los datos vienen del global `site-config.location`
(coordenadas, transportes) y `site-config.contact` (dirección).

## RGPD y mapas

**Principio:** zero cookies en carga inicial. Un iframe de Google Maps
carga tracking sin consentimiento — no cumple RGPD.

**Estrategia de dos capas:**

| Capa | Cuándo | Tecnología | Cookies |
|------|--------|-----------|---------|
| Estática | Sin consent (defecto) | Imagen de mapa + link | Zero |
| Interactiva | Con consent aceptado | Leaflet + OpenStreetMap | Zero* |

*OpenStreetMap tiles son servidos por terceros pero no incluyen
tracking cookies. El fetch cruzado es técnicamente "procesamiento
de datos" bajo RGPD estricto, de ahí la capa estática como default.

## ConsentGate

Componente reutilizable que envuelve contenido que requiere consent:

- Sin consent → renderiza `fallback` (imagen estática, placeholder)
- Con consent → renderiza `children` (mapa interactivo, YouTube embed)
- Conecta con el sistema de consent del site (Cookiebot, Axeptio, etc.)
- Para Hito 1: prop `forceConsent` en la config del site hasta que
  el sistema de consent se integre

Reutilizable para: mapas, YouTube embeds, Instagram embeds, cualquier
script de terceros que cargue cookies.

## MapBlock

Bloque del page builder que muestra la ubicación + accesos.

**Schema:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| title | text, opcional | — | Título de la sección |
| showAddress | boolean | true | Mostrar dirección completa |
| showTransport | boolean | true | Mostrar medios de transporte |

**No almacena coordenadas** — las lee de `siteConfig.location`.

**Layout:**

Desktop: mapa a la izquierda (60%), info a la derecha (40%).
Mobile: mapa arriba, info debajo.

Info lateral: dirección completa, transportes con icono (car/train/plane),
link "Ver en Google Maps".

## Dependencias

- `leaflet` (~40KB) — librería de mapas interactivos, MIT
- `react-leaflet` (opcional) — si simplifica el código React

## Estructura de ficheros

```
packages/core-ui/src/blocks/map/
├── map.schema.ts
├── MapBlock.tsx
├── MapBlock.test.tsx
├── MapStatic.tsx          ← imagen sin cookies
├── MapInteractive.tsx     ← Leaflet, dynamic import
├── ConsentGate.tsx        ← wrapper reutilizable
├── ConsentGate.test.tsx
└── index.ts
```
