# Estándar de testing

Herramientas, niveles, cobertura y convenciones de testing para HWE.

---

## Herramientas

| Herramienta | Para qué |
|-------------|----------|
| **Vitest** | Test runner — ejecuta tests unitarios y de integración |
| **@testing-library/react** | Renderizar y consultar componentes React en tests |
| **vitest-axe** | Verificar accesibilidad WCAG automáticamente |
| **msw** (Mock Service Worker) | Simular respuestas de API y Payload en tests unitarios |
| **Playwright** | Tests E2E — flujos de usuario completos en navegador real |

---

## Tres niveles de testing

| Nivel | Herramienta | Qué verifica | Cuándo se ejecuta |
|-------|-------------|-------------|-------------------|
| Unitario | Vitest + testing-library | Componentes, schemas, funciones, hooks | Cada commit (CI) |
| E2E | Playwright | Flujos de usuario completos | Cada PR / deploy |
| Auditoría | Skills bajo demanda | Salud del site, SEO, seguridad, enlaces rotos | Cuando se necesite |

---

## Tests unitarios

### Qué testear

**Componentes React:**
- Renderiza correctamente con datos válidos
- No renderiza (o muestra fallback) con datos inválidos
- Cada variante muestra lo esperado
- No tiene violaciones de accesibilidad (vitest-axe)

**Schemas Zod:**
- Valida datos correctos
- Rechaza datos incorrectos
- Los mensajes de error son descriptivos

**Funciones puras (utils, helpers):**
- Inputs conocidos producen outputs conocidos
- Edge cases cubiertos (null, undefined, array vacío, string vacío)

**Hooks:**
- Devuelven el estado correcto
- Manejan errores sin romper

### Mocks

Para tests que necesitan datos de Payload o llamadas a API,
usar msw (Mock Service Worker). Nunca conectar a una base de
datos real en tests unitarios.

```typescript
// Ejemplo con msw
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/accommodations', () => {
    return HttpResponse.json([
      { name: 'Mobil-home Confort', capacity: 4 },
    ])
  })
)
```

---

## Tests E2E

### Flujos clave con Playwright

- **Navegación completa:** home → página de alojamientos → ficha → booking widget carga
- **Multilingüe:** cambio de idioma funciona, URLs traducidas resuelven correctamente
- **Responsive:** la página se ve correctamente en mobile, tablet, desktop
- **Booking:** el widget del motor de reservas monta y es interactuable

Los tests E2E se ejecutan contra el site real desplegado en la
preview de Vercel. No usan mocks.

---

## Auditorías (bajo demanda)

No son tests automatizados en CI. Son skills que un agente ejecuta
cuando se necesitan:

- `/audit-site-health` — enlaces rotos, imágenes rotas, páginas huérfanas
- `/audit-seo` — metadatos, schemas JSON-LD, Core Web Vitals
- `/audit-security` — headers CSP, cookies, secrets, inputs sin sanitizar

Generan un informe con lo encontrado. El humano decide qué corregir.

---

## Cobertura mínima

| Capa | Cobertura | Por qué |
|------|-----------|---------|
| Schemas Zod | >95% | Fuente de verdad — si falla, todo falla |
| Adapters booking | >90% | Impacto económico directo en el cliente |
| Utilidades compartidas | >90% | Funciones puras, efecto dominó si fallan |
| Bloques | >80% | Cara visible del producto |
| Payload hooks/access | >70% | Control de roles dentro de un mismo site |
| Layout | >70% | Estables una vez construidos |
| Routing/glue | >60% | Mejor cubierto con E2E |

Si la cobertura de una capa cae por debajo de su mínimo, el CI
da warning. El objetivo no es llegar al 100% — es cubrir lo que
importa.

---

## Convenciones

### Archivos co-localizados

El test siempre junto al archivo que testea:

```
hero-block/
  HeroBlock.tsx
  HeroBlock.test.tsx
```

### Nombrado de tests en castellano

```typescript
describe('AccommodationCard', () => {
  it('renderiza el nombre y la capacidad del alojamiento', () => { ... })
  it('muestra "desde X€" cuando tiene precio', () => { ... })
  it('no muestra precio cuando no está disponible', () => { ... })
  it('no tiene violaciones de accesibilidad', () => { ... })
})
```

El nombre del `describe` es el nombre del componente/función (en inglés,
porque es código). Los `it` describen en castellano qué se verifica.

### Código y tests siempre juntos

El Code Builder entrega código y tests en la misma PR. El Reviewer
no acepta código sin tests. Si no hay tests, devuelve al Code Builder.

No se exige escribir tests antes que el código (TDD estricto).
Se exige que nada se mergee sin tests.

---

## Lo que NO testeamos con tests unitarios

- Estilos visuales (cómo se ve exactamente un componente) — se verifica
  en la preview de Vercel durante la revisión de PR
- Integración con servicios externos reales (motores de reservas) — se
  cubren con mocks en unitarios y con el site demo en E2E
- Rendimiento — se verifica con Lighthouse CI en el pipeline de deploy
