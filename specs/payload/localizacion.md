# Localización

Cómo funciona el contenido multilingüe internamente en Payload CMS
y cómo lo consume el frontend.

---

## Localización por campo, no por documento

Payload localiza a nivel de campo individual. No se duplican documentos
por idioma. Un alojamiento es UN documento con UN id. Los campos
marcados como `localized` tienen valores diferentes por idioma:

```
accommodation (id: abc123)
├── name
│   ├── fr: "Mobile Home Confort 3 chambres"
│   ├── en: "Comfort Mobile Home 3 bedrooms"
│   └── es: "Mobile Home Confort 3 habitaciones"
├── slug
│   ├── fr: "mobile-home-confort-3-chambres"
│   ├── en: "comfort-mobile-home-3-bedrooms"
│   └── es: "mobile-home-confort-3-habitaciones"
├── specs.capacity: 6          — NO localizado, es un número
├── specs.surface: 35          — NO localizado
└── specs.petFriendly: false   — NO localizado
```

Un cambio en la capacidad se hace una vez y afecta a todos los idiomas.
Un cambio en el nombre se hace idioma por idioma.

---

## Qué se localiza y qué no

**Regla:** si es texto que ve el visitante, se localiza.
Si es un dato estructural, no.

### Se localiza

- Nombres, títulos, subtítulos
- Slugs (URLs traducidas)
- Descripciones cortas y largas
- Contenido richText
- Textos de bloques (títulos de sección, subtítulos, CTAs labels)
- Labels de navegación (header, footer)
- Alt y caption de imágenes
- Labels de equipamiento
- Horarios y notas
- Meta SEO (metaTitle, metaDescription)
- Textos del banner
- Labels del virtual assistant
- Copyright del footer

### No se localiza

- Capacidad, superficie, número de habitaciones
- Precios y moneda
- Coordenadas (latitud, longitud)
- URLs de redes sociales
- Email, teléfono
- IDs de booking (externalId)
- Orden (number)
- Booleans (featured, petFriendly, hasAC, included, enabled)
- Iconos (select)
- Relaciones entre documentos
- Configuración de tracking (GTM, GA4, Pixel)
- Código custom de terceros

---

## Configuración en Payload

```typescript
// payload.config.ts
localization: {
  locales: [
    { label: 'Français', code: 'fr' },
    { label: 'English', code: 'en' },
    { label: 'Español', code: 'es' },
    { label: 'Deutsch', code: 'de' },
  ],
  defaultLocale: 'fr',
  fallback: true,
}
```

Los idiomas disponibles se definen aquí y se sincronizan con
`site-config.languages.available`. Cada cliente configura
los suyos según su mercado.

---

## Fallback

Si un campo localizado no tiene traducción para el idioma solicitado,
Payload devuelve el valor del idioma principal. Un visitante inglés
ve el texto en francés si no hay traducción al inglés.

Es mejor mostrar contenido en el idioma principal que un hueco vacío.
Un camping con 7 idiomas no va a tener todas las traducciones
el primer día.

El frontend no necesita gestionar el fallback — Payload lo hace
automáticamente en la query.

---

## Experiencia del editor

En Payload admin, el editor ve un selector de idioma en la parte
superior. Al cambiar de idioma:

- Los campos localizados muestran la versión de ese idioma
- Los campos no localizados se ven igual siempre
- Payload muestra un indicador visual en los campos sin traducción
- El editor puede ver el valor del idioma principal como referencia

El flujo típico:

1. El editor crea el contenido en el idioma principal (francés)
2. Cambia al siguiente idioma (inglés) y traduce los campos
3. Repite para cada idioma necesario
4. Los campos sin traducir muestran el fallback automáticamente

En el Hito 2, el Content Generator (agente IA) puede proponer
traducciones automáticas que el editor revisa y aprueba.

---

## Consumo en el frontend

El Server Component pasa el locale a la query de Payload:

```typescript
const page = await payload.findByID({
  collection: 'pages',
  id: pageId,
  locale: currentLocale,
  fallbackLocale: defaultLocale,
})
```

Payload devuelve los datos ya resueltos en el idioma correcto.
El frontend no gestiona idiomas en los datos — recibe datos
y los renderiza. La detección del idioma se hace en el middleware
de Next.js (por prefijo URL o por dominio, según la estrategia
configurada en `site-config`).

---

## Integración con next-intl

`next-intl` se encarga de:

- Detección del idioma en el middleware
- Routing (`/en/...`, `/es/...`)
- Traducciones de UI estáticas (labels de botones, textos del sistema)
- Formato de fechas, números, monedas según locale

Payload se encarga de:

- Contenido editorial localizado (textos, imágenes, bloques)
- Slugs traducidos
- Fallback de contenido

La separación es clara: `next-intl` gestiona la UI del framework,
Payload gestiona el contenido del CMS. No se solapan.

### Traducciones de UI

Los textos que no vienen de Payload (botones "Lire la suite",
labels "Chargement...", mensajes de error del formulario) viven
en archivos de mensajes de `next-intl`:

```
messages/
├── fr.json    — { "readMore": "Lire la suite", "loading": "Chargement..." }
├── en.json    — { "readMore": "Read more", "loading": "Loading..." }
└── es.json    — { "readMore": "Leer más", "loading": "Cargando..." }
```

Estos archivos son los mismos para todos los clientes (viven en
`@hwe-platform/core-ui` o en `hwe-template`). No son contenido editorial —
son la interfaz del sistema.

---

## Idiomas soportados

N idiomas configurables por cliente, sin tope técnico (DEC-009).
Los habituales en hospitality:

| Código | Idioma | Mercado típico |
|--------|--------|----------------|
| fr | Français | Francia, Bélgica, Suiza |
| en | English | Internacional |
| nl | Nederlands | Países Bajos, Bélgica |
| de | Deutsch | Alemania, Austria, Suiza |
| es | Español | España |
| it | Italiano | Italia |
| ca | Català | Cataluña |

Cada cliente activa solo los que necesita. Un camping en las
Landas probablemente use FR, EN, ES, DE. Un hotel en Barcelona
podría usar CA, ES, EN, FR.

---

## Resumen

| Aspecto | Cómo funciona |
|---------|---------------|
| Nivel de localización | Por campo, no por documento |
| Fallback | Idioma principal |
| Slugs | Traducidos por idioma |
| Quién gestiona contenido | Payload CMS |
| Quién gestiona UI | next-intl |
| Quién detecta idioma | Middleware Next.js |
| Límite de idiomas | Sin límite |
