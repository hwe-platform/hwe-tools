# Claude Code — hwe-tools

Repositorio de documentación del proyecto HWE. Contiene estándares,
specs, historias de usuario, decisiones técnicas, definiciones de
agentes y comandos.

---

## Reglas inamovibles

1. **NUNCA crees historias (HU-XXX), skills ni decisiones (DEC-XXX) nuevas.**
   Solo el Planner (claude.ai) las crea. Tu trabajo es aplicar lo que
   el Planner genera.

2. **NUNCA llenes documentos vacíos por tu cuenta.** Los archivos vacíos
   (`seguridad.md`, `mejora-continua.md`, guías) están pendientes de
   definición por el Planner. Si te piden contenido que no existe,
   di que está pendiente — no lo inventes.

3. **NUNCA modifiques specs, estándares o decisiones sin instrucción
   explícita del humano.** Si detectas un error o inconsistencia,
   repórtalo — no lo corrijas por tu cuenta.

4. **Solo aplica cambios que el humano te pida explícitamente.**
   No reorganices, no renombres, no "mejores" documentos por iniciativa propia.

---

## Archivos que SIEMPRE se cargan

| Archivo | Qué es |
|---------|--------|
| Este `CLAUDE.md` | Reglas inamovibles y estructura del repo |
| `docs/estandares/index.md` | Mapa de estándares disponibles |
| `historias/index.md` | Cola de prioridades |

## Qué NO leer

- Documentos vacíos (solo tienen el título): `seguridad.md`, `mejora-continua.md`, la mayoría de specs de hitos futuros
- No cargues todo `docs/` a la vez — lee solo lo que la tarea pide

---

## Estructura

```
hwe-tools/
├── docs/
│   ├── proyecto.md              ← visión, stack, hitos
│   ├── arquitectura/            ← cómo funciona el sistema
│   ├── decisiones/              ← DECs individuales (DEC-001 a DEC-010)
│   ├── estandares/              ← reglas de código, naming, git, testing
│   └── guias/                   ← onboarding (algunas vacías)
├── specs/                       ← specs técnicas por dominio
│   ├── payload/                 ← modelo-datos.md, localizacion.md, servicios.md
│   ├── contenido-ia/            ← pipeline importación (Hito 2)
│   ├── personalizacion/         ← segmentos, señales (Hito 3)
│   └── ...
├── historias/                   ← HU-001 a HU-015 (Hito 1)
├── referencia/                  ← checklists de auditoría
└── .claude/
    ├── agentes/                 ← definiciones de los seis roles
    ├── agents/                  ← subagentes invocables (hoy: reviewer)
    ├── skills/                  ← skills (hoy: analisis-figma)
    └── commands/                ← /import-figma, /scaffold-block

---

## Convenciones

- Documentación en castellano (DEC-001)
- Archivos en kebab-case
- Cada carpeta tiene un `index.md` con la tabla de estado
- Las specs siguen el template de `specs/index.md`
- Las historias siguen el template de `historias/index.md`
- Las DECs siguen el formato `DEC-XXX-nombre.md`

---

## Cuando estés perdido

1. `docs/proyecto.md` — visión, stack, hitos
2. `docs/decisiones/` — decisiones ya tomadas (DEC-001 a DEC-010)
3. `historias/index.md` — cola de prioridades
4. `docs/estandares/index.md` — qué estándares existen
5. `specs/index.md` — qué specs existen por dominio