# Estándar de seguridad

Reglas mínimas de seguridad que todo el código debe cumplir desde el Hito 1.
Se ampliará antes del Hito 4 (producción) con CSP, RGPD, Cookiebot.

---

## Reglas

### Inputs y validación

- Validación Zod en cada boundary del sistema (DEC-004)
- Todo dato que entre desde Payload, desde URL, o desde el usuario
  se valida antes de usarse
- Nunca confiar en datos del cliente — aunque vengan de Payload,
  safeParse antes de renderizar

### Frontend

- Nunca `dangerouslySetInnerHTML` sin sanitización previa
- Nunca construir HTML con concatenación de strings
- No secrets, tokens ni claves en el código frontend
- Variables de entorno sensibles solo con prefijo server-side
  (sin `NEXT_PUBLIC_`)
- `rel="noopener noreferrer"` en todo link externo

### Autenticación y acceso

- Cookies HttpOnly (Payload lo gestiona por defecto)
- Las rutas `/api/` y `/admin` requieren autenticación
- El frontend público es solo lectura — nunca expone operaciones
  de escritura

### Dependencias

- No añadir dependencias sin justificación (estándar de codigo.md)
- Revisar que las dependencias nuevas no tengan vulnerabilidades
  conocidas antes de instalar

---

## Pendiente para Hito 4

- CSP headers
- RGPD: consentimiento de cookies, Cookiebot
- RGPD: perfilado IA (Hito 3)
- Rate limiting en endpoints públicos
- Auditoría de access control por rol

---

## Herramientas de verificación

Las verificaciones genéricas de seguridad (OWASP Top 10: SQL injection, XSS,
fallos de autenticación, manejo inseguro de datos, vulnerabilidades en
dependencias) las cubren las herramientas integradas de Claude Code:

- `/security-review` — análisis bajo demanda en cada PR (regla 7 de CLAUDE.md)
- `/code-review` — revisión de calidad y seguridad general

Este estándar cubre las reglas específicas del proyecto que esas herramientas
no conocen (Zod en boundaries, Payload access control, secrets en variables
de entorno). No duplicamos lo que ya hacen mejor.
