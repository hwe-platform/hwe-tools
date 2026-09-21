# Levantar el entorno local

Qué hay que arrancar, en qué orden, y qué falla cuando algo no está.

Los comandos de esta guía están **verificados contra el entorno real**, no
escritos de memoria. Si alguno deja de funcionar, se corrige aquí antes que en
ningún otro sitio: una guía con un comando que no va cuesta más que no tenerla.

---

## Las tres piezas

| Pieza | Qué es | Se arranca |
|---|---|---|
| **Postgres** | La base de datos del site | Una vez, y se queda |
| **El site** | Next.js + el panel de Payload | `pnpm dev --filter site-demo` |
| **El contenido** | Los datos del cliente en Payload | Con el script de sembrado |

Las tres son independientes. Sin la primera, la segunda arranca y falla al
consultar; sin la tercera, el site se ve pero vacío.

---

## 1. Postgres

El proyecto usa el Postgres de Laragon, con **una base de datos propia**
(`site-demo`), no compartida con otros proyectos — lo pide DEC-003.

Comprobar si ya está corriendo:

```bash
"/c/laragon/bin/postgresql/postgresql/bin/pg_ctl.exe" -D "C:/laragon/data/postgresql" status
```

Arrancarlo si no lo está:

```bash
"/c/laragon/bin/postgresql/postgresql/bin/pg_ctl.exe" \
  -D "C:/laragon/data/postgresql" \
  -l "C:/laragon/data/postgresql/server.log" start
```

Los mensajes salen con los acentos rotos en la consola de Git Bash. Es cosa de
la codificación del terminal, no un error.

**Si el site da error de conexión**, mira el log que indica `-l`: casi siempre
es que el servidor no llegó a arrancar por un puerto ocupado.

---

## 2. Variables de entorno

El site necesita su `apps/site-demo/.env`. No está en git, así que en una
máquina nueva hay que crearlo.

| Variable | Para qué |
|---|---|
| `DATABASE_URI` | Conexión a Postgres: `postgres://<usuario>:<clave>@127.0.0.1:5432/site-demo` |
| `PAYLOAD_SECRET` | Firma los JWT de Payload. **Genera uno propio**; no reutilices el de otro entorno |
| `NEXT_PUBLIC_SERVER_URL` | URL pública del site (`http://localhost:3000` en local) |
| `PAYLOAD_SEED_EMAIL` | Usuario del panel con el que siembra el script |
| `PAYLOAD_SEED_PASSWORD` | Su contraseña |

Las dos últimas son opcionales: sin ellas el sembrado pide las credenciales por
argumento. Ponerlas es lo que permite que **lo lance un agente o la integración
continua** sin que nadie teclee una contraseña. Conviene que sean de un usuario
creado para eso, no el personal de nadie.

---

## 3. Arrancar el site

Desde la raíz de `hwe-core`:

```bash
pnpm install                    # solo la primera vez
pnpm dev --filter site-demo
```

- El site queda en `http://localhost:3000`
- El panel de Payload, en `http://localhost:3000/admin`

**La primera vez** hay que crear el usuario administrador: el panel lo pide solo
al entrar sin usuarios en la base.

### Migraciones

Payload lleva el esquema de la base de datos. Cuando cambia una colección:

```bash
cd apps/site-demo
pnpm migrate:status     # qué migraciones faltan
pnpm migrate:create     # genera una nueva a partir de los cambios
pnpm migrate            # la aplica
```

**Nunca canalices `pnpm migrate` a `tail`, `head` ni `grep`.** El comando puede
preguntar si aceptas una pérdida de datos, y con la salida canalizada la
pregunta no se ve: el proceso parece colgado y en realidad está esperando.

**En local el esquema puede estar bien con migraciones sin aplicar.** El adapter
de Postgres sincroniza el esquema solo en desarrollo, así que un cambio funciona
en cuanto se toca la colección, con o sin migración. En producción esa
sincronización no existe. Conviene mirar `migrate:status` de vez en cuando: una
migración pendiente aquí no se nota, y en el despliegue sí.

---

## 4. Sembrar el contenido

El sembrado escribe los globals y sube los assets de marca del export de Figma.

```bash
cd apps/site-demo
node scripts/seed-globals.mjs                          # usa el .env
node scripts/seed-globals.mjs <email> <contraseña>     # o credenciales sueltas
```

**Necesita el site arrancado**: escribe por la API HTTP, no por la API local de
Payload. Cargar `payload.config` fuera de Next deja el proceso colgado.

Es **idempotente**: se puede repetir. Los archivos ya subidos se saltan
comparando por nombre, y los globals se reescriben con los mismos valores.

**Sobrescribe.** Reescribe los globals enteros, así que no conserva ediciones
hechas a mano en el panel.

### Cuando la web no se parece al diseño

Antes de tocar un componente, **comprueba si el dato está puesto**. Un pie con
dos columnas de cinco y un menú con seis entradas de ocho se ven exactamente
igual que una maquetación rota:

```bash
curl -s "http://localhost:3000/api/globals/footer?locale=fr"
curl -s "http://localhost:3000/api/globals/header?locale=fr"
```

Cuesta una consulta y ahorra reescribir componentes que estaban bien. El
criterio completo está en `specs/figma/analisis.md`, sección *"Cuando el
resultado no se parece: contenido antes que código"*.

---

## 5. Analizar un export de Figma

Lo hace el skill `analisis-figma`, que genera los dos artefactos del cliente.
Sus extractores se pueden lanzar sueltos para consultar un dato:

```bash
node .claude/skills/analisis-figma/scripts/chrome.mjs     figma-makes/<cliente>/src
node .claude/skills/analisis-figma/scripts/tokens.mjs     figma-makes/<cliente>/src
node .claude/skills/analisis-figma/scripts/atomos.mjs     figma-makes/<cliente>/src
node .claude/skills/analisis-figma/scripts/inventario.mjs figma-makes/<cliente>/src
node .claude/skills/analisis-figma/scripts/assets.mjs     figma-makes/<cliente>/src \
  hwe-core/packages/core-ui/src/primitives/Icon.tsx
```

Y su prueba de regresión, que comprueba contra un caso de respuestas conocidas
que ningún extractor ha dejado de sacar su hecho:

```bash
node .claude/skills/analisis-figma/scripts/oraculo.mjs figma-makes/la-civelle/src \
  hwe-core/packages/core-ui/src/primitives/Icon.tsx
```

Para traer un export nuevo o actualizar uno existente, `/import-figma`.

---

## Verificar antes de dar algo por hecho

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm build
```

**Turbo cachea, y una caché puede dar verde sobre código que no se ha
ejecutado.** Cuando la verificación importa de verdad —antes de una PR, o al
comprobar que algo está arreglado— hay que saltarse la caché:

```bash
TURBO_FORCE=true CI=true pnpm test
```

Ojo con la forma: `pnpm lint -- --force` **no** vale, porque el flag le llega a
ESLint y no a turbo.

**Y `TURBO_FORCE` tampoco basta siempre.** En HU-009 dio 308 tests y la
cobertura al 55% mientras una ejecución directa daba 325 y los umbrales
pasaban. Cuando el resultado no cuadre con lo que esperas —menos tests de los
que hay, un umbral que falla sin motivo—, borra la caché a mano antes de
creerte el número:

```bash
rm -rf .turbo apps/*/.turbo packages/*/.turbo
TURBO_FORCE=true CI=true pnpm test
```

La señal a la que hay que reaccionar es esa: **un resultado que no cuadra no
se interpreta, se vuelve a medir sin caché.**

---

## Fallos habituales

| Síntoma | Causa |
|---|---|
| El site arranca y falla al consultar | Postgres parado. Ver el punto 1 |
| `pnpm migrate` parece colgado | Está preguntando por pérdida de datos y la salida está canalizada |
| El sembrado da `HTTP 401` | Credenciales del `.env` o del argumento incorrectas |
| El sembrado da `HTTP 400` con una lista de campos | El dato no cumple el schema Zod. El mensaje dice qué campo y qué valores admite |
| Los estilos no cargan | Falta la directiva `@source` apuntando al `dist` de core-ui. Ver `docs/arquitectura/tokens.md` |
| Un cambio en `core-ui` no se ve en el site | El site consume `dist`. Hay que reconstruir: `pnpm --filter @hwe-platform/core-ui build` |
| Los acentos llegan como `?` o `�` | `curl` en Git Bash destroza UTF-8. Usa `fetch` desde Node |
