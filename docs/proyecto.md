# HWE — Mapa de producto

**Fecha:** 2026-09-01
**Estado:** Definido — pendiente de desglosar en tareas

---

## 1. Qué es HWE

HWE (Hospitality Web Engine) es una plataforma para construir sitios web de campings y hoteles de forma rápida y escalable, con importación automática de contenido, una capa de IA que personaliza la experiencia del visitante, y herramientas de gestión para la agencia.

No es un theme de WordPress ni un SaaS genérico. Es una plataforma propietaria de Septeo Hospitality que genera sitios optimizados, personalizados y conectados a motores de reservas.

---

## 2. Para quién

**La agencia (Septeo Hospitality):** crea y gestiona sitios para sus clientes. Necesita rapidez para onboardear clientes nuevos, herramientas visuales para gestionar contenido, y automatización para no escalar equipo linealmente.

**El cliente (camping/hotel):** quiere un sitio que convierta visitantes en reservas. No quiere tocar código. Quiere poder actualizar textos y fotos sin depender de la agencia para cada cambio.

**El visitante:** busca alojamiento, quiere ver fotos, precios, disponibilidad, y reservar. La experiencia tiene que ser rápida, clara, y adaptada a lo que busca.

---

## 3. Qué hace

**Sitios web optimizados:** bloques reutilizables, SEO nativo, rendimiento garantizado (Core Web Vitals), multilingüe (N idiomas configurables), diseño adaptado por cliente.

**Sistema de reservas:** integración con 4 motores (THR, Mastercamping, Witbooking, Resalys) via adapter pattern. Cada motor tiene sus propios widgets y productos — se definen conforme se implementen.

**Gestión de contenido con IA:** importar contenido de la web actual del cliente, procesar y estructurar con IA, cargar en Payload CMS, revisar y aprobar. Genera textos, descripciones, traducciones.

**Personalización por segmento:** la IA detecta el perfil del visitante (familia, pareja, grupo, origen geográfico, temporada) y adapta imágenes y colores en páginas indexables. Una página IA noindex permite personalización completa via chat.

**Gestión para la agencia:** dashboard operativo — crear/modificar/eliminar bloques y páginas visualmente, importar contenido, configurar personalización, fleet management. Los agentes IA trabajan por debajo, el implementador interactúa visualmente. Edición directa de contenido se mantiene en Payload admin. Portal cliente para cambios menores.

---

## 4. Dependencias

```
Payload CMS configurado + infraestructura de bloques
        ↓
Bloques construidos bajo demanda desde Figma
        ↓
Importación de contenido
        ↓
Personalización
        ↓
Dashboard operativo
```

Las reservas son independientes de esta cadena (adapters no dependen de Payload para su lógica, aunque la configuración del motor vivirá allí).

SEO, Geo/LLMs y Seguridad son transversales — requisitos de calidad de cada paso, no fases separadas.

---

## 5. Hitos de producto

### Hito 1 — Fundamento

Infraestructura completa del sistema lista para producción: Payload CMS configurado, sistema de tokens, BlockRenderer, catch-all de rutas, paquetes compartidos publicados, site demo desplegado en Vercel. Los bloques concretos se construyen bajo demanda a partir del Figma de cada cliente. El primer Figma determina qué bloques se construyen primero.

**Resultado:** un sitio demo que funciona con contenido real desde Payload.

**Requisitos transversales:** HTML semántico, schemas JSON-LD, Zod en cada boundary, tests.

### Hito 2 — Contenido

Pipeline de contenido-IA funcionando. Se puede importar una web existente, procesar con IA, cargar en Payload, y revisar.

**Resultado:** el contenido de un cliente real entra al sistema sin trabajo manual pesado.

**Requisitos transversales:** imágenes con alt texts, metadatos SEO importados/generados, contenido RGPD-compliant.

### Hito 3 — Personalización básica

Módulo de entrada (bloque en cualquier página), página IA noindex, personalización de colores e imágenes por segmento en páginas indexables.

**Resultado:** un visitante tiene una experiencia adaptada según su perfil.

**Requisitos transversales:** RGPD para perfilado definido, página IA noindex, textos indexables intactos.

### Hito 4 — Primer cliente en producción

Reservas conectadas con el motor del cliente. SEO completo. RGPD cumplido. Dominio propio configurado. Contenido real importado y aprobado.

**Resultado:** el primer camping/hotel está live con experiencia completa.

### Hito 5 — Escalado

Dashboard operativo (gestión visual de bloques, páginas, contenido, personalización). Fleet management. Template de cliente para crear sitios rápidamente.

**Resultado:** la agencia puede gestionar N clientes eficientemente sin depender de terminal ni Claude Code para operaciones del día a día.

---

## 6. Estado actual

**Decisión:** todo se replantea desde cero. El código existente del proyecto anterior sirve como referencia y aprendizaje, no como base.

**Existe como referencia (no se reutiliza directamente):**
- 8 bloques base, adapters de booking (THR completo, Mastercamping parcial), primitivas, layout, BlockRenderer, tokens, 115+ tests, site-demo con datos ficticios

**No existe todavía:**
- Payload CMS integrado
- Importación de contenido
- Personalización
- Dashboard
- Portal cliente
- Template de cliente (`hwe-template` vacío)
- Datos reales

---

## 7. Requisitos transversales

Cada hito y cada pieza construida debe cumplir:

| Requisito | Qué implica |
|-----------|-------------|
| **SEO** | HTML semántico, schemas JSON-LD, metadatos, Core Web Vitals |
| **Geo/LLMs** | Datos estructurados por tipo de página, ficheros para crawlers IA |
| **Seguridad** | Zod en boundaries, RGPD, CSP, secrets protegidos |

No son fases — son criterios de aceptación de cada pieza.

---

## 8. Stack técnico

| Componente | Tecnología |
|------------|------------|
| Framework | Next.js 15 + React 19 (App Router) |
| Estilos | Tailwind CSS v4 (CSS-first `@theme`) |
| CMS | Payload CMS v3 embebido en Next.js |
| Base de datos | Vercel Postgres (una por cliente) |
| Lenguaje | TypeScript strict |
| Monorepo | Turborepo + pnpm |
| Validación | Zod (fuente de verdad) |
| Testing | Vitest + testing-library + vitest-axe + Playwright |
| CI/CD | GitHub Actions + Vercel |
| Paquetes | GitHub Packages (`@hwe/*`) |
| IA | Claude API server-side via Route Handlers |

---

## 9. Repositorios

| Repo | Propósito |
|------|-----------|
| `hwe-tools` | Documentación, specs, historias, estándares, skills, agentes |
| `hwe-core` | Paquetes npm compartidos (`@hwe/core-ui`, `@hwe/config`) |
| `hwe-template` | Template para crear sites de cliente (Next.js + Payload + Vercel Postgres) |
