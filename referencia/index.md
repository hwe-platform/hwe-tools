# Referencia

Checklists de auditoría que los agentes ejecutan bajo demanda.
No son tests automatizados — son revisiones manuales que generan
un informe con hallazgos.

---

## Auditorías disponibles

| Directorio | Qué audita | Estado |
|-----------|------------|--------|
| [seo/](seo/index.md) | Metadatos, JSON-LD, Core Web Vitals, sitemap | 🔲 Pendiente |
| [seguridad/](seguridad/index.md) | Headers CSP, inputs, cookies, secrets, RGPD | 🔲 Pendiente |
| [fleet/](fleet/index.md) | Estado de todos los sites de clientes | 🔲 Pendiente |

---

## Cuándo lanzar una auditoría

- **SEO** — antes de poner un site en producción, y periódicamente
- **Seguridad** — antes de producción, tras cambios en auth o headers
- **Fleet** — cuando se gestionen múltiples clientes, para verificar estado global

---

## Template de checklist

Todas las checklists siguen esta estructura:

```markdown
---
titulo: Nombre de la auditoría
dominio: seo | seguridad | fleet
ultima-ejecucion: —
resultado: — | ok | con-hallazgos
---

## Qué verifica

Descripción breve de qué cubre esta auditoría.

## Checklist

### Categoría 1

- [ ] Ítem a verificar — cómo verificarlo
- [ ] Ítem a verificar — cómo verificarlo

### Categoría 2

- [ ] Ítem a verificar — cómo verificarlo

## Hallazgos

_(se llena al ejecutar la auditoría)_

| Hallazgo | Severidad | Acción |
|----------|-----------|--------|
| — | alta/media/baja | — |
```

---

## Reglas

- Las checklists se crean cuando se necesitan, no antes
- Cada ejecución genera una copia con fecha (`audit-seo-2026-09-15.md`) o se registran los hallazgos en la propia checklist
- Los hallazgos con severidad alta se convierten en historias (HU-XXX)
- Las correcciones recurrentes se propagan a estándares o skills
