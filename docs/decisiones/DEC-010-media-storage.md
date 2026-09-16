# DEC-010 — Media storage: Vercel Blob (provisional)

**Fecha:** 2026-09-16 | **Estado:** Provisional

Concreta la parte de media de [DEC-003](DEC-003-hosting.md), que dejaba el
almacenamiento de archivos como "Blob Storage o equivalente". Aquí se elige
el servicio y el adapter.

## Decisión
`@payloadcms/storage-vercel-blob` como adapter de almacenamiento de imágenes
en producción. En desarrollo local no se usa adapter: Payload guarda en el
filesystem por defecto, que no necesita configuración ni credenciales.

Así todo el stack queda en Vercel — app Next.js, Postgres y Blob — y cada
site de cliente tiene su propio proyecto Vercel con su Postgres y su Blob
aislados, en línea con el aislamiento por cliente de DEC-003.

**Es provisional.** Se revisará el coste cuando haya volumen real de clientes.
Si Vercel Blob no escala bien en precio, la alternativa es Cloudflare R2 a
través de `@payloadcms/storage-s3`: API S3-compatible y sin coste de salida.

## Por qué
Un solo proveedor mientras el proyecto es pequeño: un dashboard, una factura,
una sola integración que mantener. Vercel Blob se configura con una variable
de entorno y el adapter oficial de Payload, sin cuentas ni buckets aparte.

El coste de equivocarse es bajo, que es lo que permite decidir ya en lugar de
analizar. El egress de Vercel Blob es lo que puede doler con muchos sitios
con muchas fotos — por eso la revisión es de coste, no de funcionalidad.

## Qué cuesta cambiar de opinión
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

## Pendiente
- Medir coste real (almacenamiento + egress) con los primeros clientes en
  producción, junto a la evaluación de proveedor de DEC-003.
- Decidir si el bucket es uno por cliente (coherente con el aislamiento
  actual) o compartido con prefijos, cuando haya volumen.

## Referencias
- [DEC-003](DEC-003-hosting.md) — plataforma de hosting y datos
- `specs/payload/modelo-datos.md`, sección `media`
- `historias/HU-013-storage-media.md` — la implementación
