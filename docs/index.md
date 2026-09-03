# Documentación HWE

Mapa general. Busca lo que necesitas y ve directamente al documento.

---

## ¿Qué necesitas?

| Necesito... | Ve a |
|-------------|------|
| Entender el proyecto | [docs/proyecto.md](proyecto.md) |
| Ver las decisiones técnicas | [docs/decisiones/](decisiones/index.md) |
| Saber las reglas de código | [docs/estandares/](estandares/index.md) |
| Entender la arquitectura de bloques | [docs/arquitectura/bloques.md](arquitectura/bloques.md) |
| Entender cómo funcionan las rutas | [docs/arquitectura/paginas-routing.md](arquitectura/paginas-routing.md) |
| Entender el sistema de tokens | [docs/arquitectura/tokens.md](arquitectura/tokens.md) |
| Entender la metodología de trabajo | [docs/arquitectura/metodologia.md](arquitectura/metodologia.md) |
| Ver el modelo de datos de Payload | [specs/payload/modelo-datos.md](../specs/payload/modelo-datos.md) |
| Ver cómo funciona multilingüe | [specs/payload/localizacion.md](../specs/payload/localizacion.md) |
| Ver las specs de un dominio | [specs/](../specs/index.md) |
| Ver las historias y prioridades | [historias/](../historias/index.md) |
| Saber qué agentes existen | [.claude/agentes/definiciones.md](../.claude/agentes/definiciones.md) |
| Consultar checklists de auditoría | [referencia/](../referencia/index.md) |
| Onboarding (primer día) | [docs/guias/](guias/index.md) |
| Ver los comandos disponibles | [.claude/commands/](../.claude/commands/index.md) |

---

## Estructura del repositorio

```
hwe-tools/
├── docs/
│   ├── proyecto.md              — visión, stack, hitos
│   ├── arquitectura/            — cómo está construido el sistema
│   ├── decisiones/              — DECs individuales
│   ├── estandares/              — reglas de código, naming, git, testing
│   └── guias/                   — onboarding, glosario
├── specs/                       — specs técnicas por dominio
├── historias/                   — historias de usuario (HU-XXX)
├── referencia/                  — checklists de auditoría
└── .claude/
    └── agentes/                 — definiciones y archivos operativos
```

---

## Para agentes IA

No cargues todo. Lee solo lo que necesitas para tu tarea:

- **Implementar un bloque** — `estandares/codigo.md` + `estandares/naming.md` + `arquitectura/bloques.md` + la spec del bloque
- **Crear una colección Payload** — `specs/payload/modelo-datos.md` + `specs/payload/localizacion.md` + `decisiones/DEC-004-zod.md`
- **Revisar una PR** — `estandares/codigo.md` + `estandares/naming.md` + `estandares/testing.md`
- **Planificar** — `proyecto.md` + `historias/index.md` + la spec del dominio relevante
