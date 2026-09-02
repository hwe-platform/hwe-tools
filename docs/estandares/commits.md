# Estándar de Git

Commits, ramas, PRs y trazabilidad con historias de usuario.

---

## Commits

Formato: **Conventional Commits** con prefijo en inglés y descripción en castellano.

```
tipo(ámbito): descripción en castellano

Cuerpo opcional con más detalle.

Refs: HU-XXX
```

### Tipos válidos

| Tipo | Cuándo usarlo | Ejemplo |
|------|---------------|---------|
| `feat` | Funcionalidad nueva | `feat(blocks): añadir bloque hero con variante split` |
| `fix` | Corrección de error | `fix(booking): evitar carga duplicada del script THR` |
| `docs` | Solo documentación | `docs(specs): actualizar modelo de datos de Payload` |
| `refactor` | Reorganizar código sin cambiar comportamiento | `refactor(core-ui): extraer primitiva de imagen compartida` |
| `chore` | Mantenimiento | `chore(deps): actualizar Payload a 3.86` |
| `test` | Añadir o corregir tests | `test(blocks): añadir tests de accesibilidad al hero` |
| `style` | Solo formateo, sin cambio de lógica | `style: aplicar formateo Prettier` |

### Ámbitos comunes

`blocks`, `booking`, `core-ui`, `config`, `payload`, `seo`, `i18n`, `auth`, `deps`, `ci`

El ámbito es opcional pero recomendado. Indica qué zona del proyecto toca el cambio.

### Reglas

- Un commit por cambio lógico — no un commit gigante con 20 archivos de cosas diferentes
- Descripción corta (máximo ~72 caracteres en la primera línea)
- Si necesitas explicar más, usa el cuerpo del commit (segunda línea en blanco + texto)
- El footer `Refs: HU-XXX` va en el primer commit de la rama y en el commit más significativo

---

## Ramas

### Formato

```
tipo/HU-XXX-descripcion-corta
```

Todo en minúsculas, palabras separadas por guiones.

### Ejemplos

```
feat/HU-005-widget-personalizacion
fix/HU-012-corregir-filtro-idioma
refactor/HU-008-extraer-utils-seo
docs/HU-003-spec-contenido-ia
chore/actualizar-dependencias
```

Si no hay historia asociada (mantenimiento, limpieza), se omite el HU:

```
chore/actualizar-dependencias
fix/corregir-typo-readme
```

### Flujo

1. Crear rama desde `main`
2. Trabajar en la rama (commits según el estándar)
3. Crear PR hacia `main`
4. Revisar y aprobar
5. Mergear a `main`

**No usamos** `develop`, `staging` ni Git Flow. Cada rama se crea desde `main` y vuelve a `main`. Vercel genera preview automáticamente en cada PR.

---

## Pull Requests

### Título

Sigue la misma convención que los commits:

```
feat(blocks): añadir bloque hero con variante split
```

### Descripción

Breve, con tres secciones:

```markdown
## Qué
Implementa el bloque hero con variantes full, split y minimal.

## Por qué
Es el primer bloque del Hito 1 y establece el patrón para los demás.

## Historia
Refs: HU-005
```

### Revisión

- El equipo humano revisa PRs antes de mergear a `main`
- Los agentes IA de nivel 2 crean PRs que esperan aprobación
- Los agentes IA de nivel 1 pueden commitear directo en casos específicos (definidos en la metodología de agentes)

---

## Trazabilidad

La cadena completa de trazabilidad es:

```
HU-005 (historia) → feat/HU-005-widget-personalizacion (rama)
    → commits con Refs: HU-005 → PR con enlace a HU-005
    → merge a main
```

Esto permite buscar en cualquier dirección: desde una historia ver qué código se generó, o desde un commit saber qué historia lo motivó.

---

## Chuleta rápida

```
COMMITS
═══════
feat(blocks): añadir variante compacta del bloque hero
fix(booking): evitar carga duplicada del script THR
docs(specs): actualizar modelo de datos de Payload
refactor(core-ui): extraer primitiva de imagen compartida
chore(deps): actualizar Payload a 3.86
test(blocks): añadir tests de accesibilidad al hero

RAMAS
═════
feat/HU-005-widget-personalizacion
fix/HU-012-corregir-filtro-idioma
docs/HU-003-spec-contenido-ia
chore/actualizar-dependencias

FOOTER (en el commit)
══════════════════════
Refs: HU-005
```
