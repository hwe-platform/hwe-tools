# DEC-003 — Plataforma de hosting y datos

**Fecha:** 2026-08-31 | **Estado:** Provisional

## Decisión
Un solo deploy por sitio cliente que contiene todo:
el sitio web público, Payload CMS (panel de administración
en /admin) y las rutas API. No hay servidor separado para el CMS.

Tres tipos de datos, cada uno en su sitio:

- **Contenido** (textos, páginas, bloques, configuración):
  Payload CMS conectado a una base de datos Postgres.
  Una base de datos por cliente.
- **Imágenes y media** (fotos, vídeos, documentos):
  Servicio de almacenamiento de archivos (Blob Storage o
  equivalente). El editor los sube a través de Payload.
- **Código y tokens** (componentes, CSS, configuración del sitio):
  Repositorio Git, desplegado en cada build. No cambia
  con el contenido.

Flujo: editor cambia contenido en Payload → Payload guarda
en Postgres + media en Blob Storage → Next.js lee los datos
vía Local API → renderiza con @hwe-platform/core-ui.

Plataforma por defecto para la fase de desarrollo y primeros
clientes: Vercel (hosting + Postgres + Blob Storage + Route
Handlers + Cron). GitHub Packages para el registro npm privado.

## Por qué
Payload v3 se instala dentro de Next.js — no necesita servidor
aparte. Un proyecto = un deploy = frontend + CMS + API.
Simplifica operación: un solo proveedor, un dashboard,
TypeScript end-to-end, sin PHP, sin Docker, sin SSH.
Preview deploys por PR. RGPD cubierto con aislamiento
por cliente (una DB por sitio, región EU).

## Pendiente
Evaluar alternativas (Railway, Coolify, Cloudflare) antes
de escalar a 50+ clientes. Modelar coste real con los
primeros 10 clientes en producción. La decisión de proveedor
puede cambiar; la arquitectura (un deploy con todo) no.