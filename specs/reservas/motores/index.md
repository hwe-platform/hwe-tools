# Motores de reservas

Integraciones con los distintos motores de reservas.

## Estado por motor

| Motor | Tipo | Search | Favorites | SimpleBlock | Estado |
|-------|------|--------|-----------|-------------|--------|
| [THR](thr/index.md) | Script injection (Web Components) | ✅ | ✅ | ✅ | Spec completa |
| [Mastercamping](mastercamping/index.md) | Script injection (constructor JS) | ✅ | ❌ | ❌ | Spec completa |
| [Witbooking](witbooking/index.md) | Por definir | — | — | — | Placeholder |
| Resalys | Por definir | — | — | — | Placeholder |

## Cómo añadir un motor nuevo

1. Investigar el método de integración del motor y documentarlo en
   `specs/reservas/motores/{engine}/index.md`
2. Clasificar: script injection / iframe / native
3. Añadir campos del motor al schema Zod (`bookingConfigSchema`) y
   al campo Payload (`bookingEngineGroup`) con `condition`
4. Crear adapter(s) en `@hwe-platform/core-ui/src/adapters/booking/`
5. Registrar en el registry correspondiente
6. Crear fichero de CSS overrides en el template del cliente
7. Documentar dominios CSP en la spec del motor
8. Actualizar la skill `/setup-booking`

## Patrón de config

Todos los motores comparten la misma estructura de config en Payload:

- Campo `engine` como discriminante (select en el admin)
- Campos específicos con `condition` que muestra/oculta según engine
- Validación Zod con `z.discriminatedUnion('engine', [...])`

Ver `specs/payload/modelo-datos.md` para los campos concretos.
