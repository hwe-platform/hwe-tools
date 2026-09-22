---
id: HU-018
titulo: Bloque Map con compliance RGPD
estado: spec-lista
prioridad: 3
hito: 1
agente: code-builder
rama: feat/HU-018-map-block
dependencias: [HU-008]
---

## Contexto

Todos los sites de hospitality necesitan un mapa que muestre la ubicación
del establecimiento y cómo llegar. Los datos ya existen en Payload
(global `site-config.location`: latitude, longitude, transport). El
problema es RGPD: un iframe de Google Maps carga cookies de tracking sin
consentimiento — eso es ilegal en la UE.

## Decisión: imagen estática + Leaflet tras consent

Dos capas:

1. **Sin consent (por defecto):** imagen estática del mapa generada con
   la API de Google Static Maps (o OpenStreetMap tiles renderizados como
   imagen en build time). Cero cookies, cero JavaScript, funcional desde
   el primer render. Click abre Google Maps en nueva pestaña.

2. **Con consent (tras aceptar cookies):** mapa interactivo con
   Leaflet + OpenStreetMap tiles. Sin cookies de Google, zoom y pan
   nativos, marker en la ubicación del camping. Se carga solo después
   de que el visitor acepte las cookies (bridge con Cookiebot/consent).

**Por qué no Google Maps iframe:** carga cookies de tracking, Font
Awesome, y scripts de Google sin consent. No cumple RGPD.

**Por qué no solo imagen estática:** la experiencia interactiva es
esperada por el visitante para explorar los alrededores.

**Por qué no Leaflet directo sin consent:** Leaflet carga tiles de
terceros (OpenStreetMap.org). Aunque los tiles de OSM son más
respetuosos que Google, el fetch cruzado puede interpretarse como
tracking según RGPD estricto. La imagen estática elimina la duda.

## Qué hacer

### 1. MapBlock component

Crear en `packages/core-ui/src/blocks/map/`:

**Schema:**

```typescript
mapBlockSchema = z.object({
  blockType: z.literal('map'),
  title: z.string().optional(),
  showAddress: z.boolean().default(true),
  showTransport: z.boolean().default(true),
})
```

El bloque NO almacena coordenadas ni dirección — las lee de
`siteConfig.location` (ya disponible en el contexto del layout).

**Componente:**

```
┌──────────────────────────────────┐
│ [Título]                         │
├────────────────┬─────────────────┤
│                │ Dirección        │
│   MAPA         │ CP, Ciudad      │
│   (imagen o    │                 │
│    Leaflet)    │ 🚗 2h de Paris  │
│                │ 🚂 Gare de...   │
│                │ ✈️ Aéroport...  │
│                │                 │
│                │ [Ver en Maps →] │
└────────────────┴─────────────────┘
```

- **Sin consent:** `<img>` con mapa estático + link "Ver en Google Maps"
- **Con consent:** `<div>` con Leaflet + marker + popup con nombre
- Sección transporte: iconos + labels de `site-config.location.transport`
- Dirección completa de `site-config.contact`
- Responsive: mapa arriba, info debajo en mobile

### 2. MapStatic — imagen sin cookies

`MapStatic.tsx`:

- Genera URL de imagen estática con coordenadas:
  `https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom=13&size=600x400&markers={lat},{lng}&key={API_KEY}`
- O alternativa sin API key: tiles de OpenStreetMap renderizados como
  imagen en el server (con `sharp` o `canvas`)
- La API key de Google Static Maps va en `.env` del site (no en Payload)
- Click en la imagen abre `https://www.google.com/maps?q={lat},{lng}`
  en nueva pestaña

**Decisión pendiente para Claude Code:** si Google Static Maps requiere
API key (billing), usar la alternativa OSM. Probar primero con OSM tiles
vía URL directa: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` —
componer una imagen de 4-6 tiles alrededor del centro.

### 3. MapInteractive — Leaflet tras consent

`MapInteractive.tsx` (client component, dynamic import):

- `import L from 'leaflet'` (o `react-leaflet` si simplifica)
- Tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Marker en `{lat, lng}` con popup del nombre del camping
- Zoom default: 13 (muestra el entorno inmediato)
- Solo se monta si `hasConsent('maps')` (bridge con el sistema de
  consent del site)

**Dependencia:** `leaflet` (~40KB). Justificación: no se resuelve en
50 líneas, es la librería estándar para mapas sin Google, MIT.

Si `react-leaflet` simplifica significativamente el código, es
aceptable como dependencia adicional. Si no, Leaflet vanilla con
`useRef` + `useEffect`.

### 4. ConsentGate — wrapper reutilizable

`ConsentGate.tsx` — componente que envuelve cualquier contenido que
requiera consentimiento:

```tsx
<ConsentGate
  category="maps"
  fallback={<MapStatic lat={lat} lng={lng} />}
  placeholder="Acceptez les cookies pour voir la carte interactive"
>
  <MapInteractive lat={lat} lng={lng} name={siteName} />
</ConsentGate>
```

- Si consent aceptado → renderiza children
- Si no → renderiza fallback + mensaje placeholder
- El check de consent usa `window.__cookiebot?.consent?.marketing`
  o el equivalente del sistema de consent configurado
- Reutilizable para futuros embeds (YouTube, iframes de terceros)

**Nota:** el sistema de consent (Cookiebot) no está implementado aún
(backlog post-Hito 1). Para Hito 1, `ConsentGate` puede empezar con
un prop `forceConsent: boolean` en `client.config` o `site-config`
que el site-demo fija a `false` (siempre muestra estático). Cuando
Cookiebot se integre, se conecta el check real.

### 5. Registro y seed

- Registrar MapBlock en `blockRegistry`
- Verificar que el seed de `site-config` ya tiene coordenadas y
  transport (La Civelle: lat 46.57, lng -1.97, car/train/plane)

## Leer antes

- `apps/site-demo/src/globals/SiteConfig.ts` — location fields
- `apps/site-demo/src/fields/site-config-groups.ts` — locationGroup
- `packages/core-ui/src/schemas/globals/site-config.schema.ts`
- `apps/site-demo/docs/lenguaje-visual.md`
- `docs/estandares/codigo.md`
- `docs/estandares/seguridad.md` — RGPD

## Criterios de aceptación

- [ ] MapBlock renderiza imagen estática sin cookies por defecto
- [ ] Click en imagen estática abre Google Maps en nueva pestaña
- [ ] Dirección completa visible junto al mapa
- [ ] Transportes con iconos visibles si showTransport=true
- [ ] Transportes ocultos si showTransport=false
- [ ] ConsentGate renderiza fallback cuando sin consent
- [ ] ConsentGate renderiza children cuando consent aceptado
- [ ] Leaflet se carga solo con consent (dynamic import)
- [ ] Marker en coordenadas correctas
- [ ] Responsive: mapa arriba, info debajo en mobile
- [ ] Pasa vitest-axe
- [ ] Tests — cobertura >80%
- [ ] MapBlock registrado en blockRegistry
- [ ] Zero cookies en carga inicial (verificar DevTools Network)

## Retrospectiva

_(se llena después si aplica)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|
