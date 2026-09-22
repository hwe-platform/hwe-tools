# Dominio: Alojamientos

Especificaciones de la ficha de alojamiento y sus componentes.

## Visión general

La ficha de alojamiento es la página de detalle de un emplacement,
mobil-home, cottage, chalet o tente. Es donde el visitante decide
si reserva. Compone componentes fijos (SpecBar, EquipmentList, etc.)
con bloques dinámicos del editor.

## Datos disponibles

La colección `accommodations` de Payload ya tiene toda la estructura:

| Campo | Tipo | Uso |
|-------|------|-----|
| `specs.capacity` | number | SpecBar — personas |
| `specs.bedrooms` | number | SpecBar — habitaciones |
| `specs.surface` | number | SpecBar — m² |
| `specs.hasAC` | boolean | SpecBar — icono AC |
| `specs.petFriendly` | boolean | SpecBar — icono mascotas |
| `equipment[]` | array(label, icon, included) | EquipmentList |
| `bedroomDetails[]` | array(description) | BedroomList |
| `features[]` | array(icon, label) | FeatureBadges |
| `media.mainImage` | upload | Hero de la ficha |
| `media.gallery[]` | upload[] | Galería |
| `media.floorPlan` | upload | Plano (si tiene) |
| `media.video` | text (URL) | Vídeo embed |
| `documents[]` | array(label, file) | Documentos descargables |
| `comparison[]` | relationship | Alojamientos similares |
| `pricing.from` | number | "Desde X€" |
| `booking.bookable` | boolean | CTA de reserva visible |
| `blocks[]` | blocks | Bloques custom del editor |
| `description` | richText | Texto editorial |

## Componentes

### SpecBar

Barra horizontal con datos de la ficha técnica. No es un bloque del
page builder — es un componente fijo del template.

Muestra: capacidad (personas), dormitorios, superficie (m²),
aire acondicionado (si tiene), mascotas (si admite). Los booleanos
solo aparecen si son `true`.

Responsive: horizontal en desktop, 2 columnas en mobile.

### EquipmentList

Checklist de equipamiento incluido/no incluido. Cada item tiene icono
(del `iconRegistry`), label y estado (incluido verde ✓ / no incluido
gris ✗ tachado).

### BedroomList

Lista de dormitorios con descripción textual. Solo se renderiza si
el alojamiento tiene `bedroomDetails`. Icono de cama por dormitorio.

### FeatureBadges

Badges horizontales con icono + texto para features destacadas del
alojamiento. Solo se renderiza si tiene `features`. Usa `iconRegistry`
para los iconos.

### ComparisonCard

Tarjeta de alojamiento similar. Muestra imagen, nombre, tipo, precio
"desde" y link a la ficha. Si `comparison` está vacío, el resolver del
site-demo busca otros de la misma categoría.

## Template AccommodationDetail

Vive en `apps/site-demo/src/templates/` — es específico del site, no
de core-ui. Compone los componentes de arriba con bloques dinámicos.

Orden de secciones:

1. Hero (mainImage + nombre + tipo + subtype)
2. SpecBar
3. Description (richText)
4. BedroomList (si tiene)
5. EquipmentList (si tiene)
6. FeatureBadges (si tiene)
7. Gallery (media.gallery)
8. FloorPlan (si tiene)
9. Documents (si tiene)
10. blocks[] (bloques custom via BlockRenderer)
11. ComparisonCards (similares)
12. Pricing + CTA reserva (si bookable)

Secciones opcionales no renderizan si el dato está vacío — sin
placeholder "no hay datos".

## Estructura de ficheros

```
packages/core-ui/src/blocks/accommodation-detail/
├── SpecBar.tsx
├── SpecBar.test.tsx
├── EquipmentList.tsx
├── EquipmentList.test.tsx
├── BedroomList.tsx
├── BedroomList.test.tsx
├── FeatureBadges.tsx
├── FeatureBadges.test.tsx
├── ComparisonCard.tsx
├── ComparisonCard.test.tsx
└── index.ts

apps/site-demo/src/templates/
├── AccommodationDetail.tsx
└── AccommodationDetail.test.tsx
```
