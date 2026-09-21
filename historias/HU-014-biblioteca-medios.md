---
id: HU-014
titulo: Biblioteca de medios — duplicados, listado visual y metadatos
estado: idea
prioridad: 2
hito: 2
agente: —
rama: —
dependencias: [HU-005]
---

## Contexto

> **Reasignada al Hito 2 por el Planner.** La detección de duplicados es
> necesaria antes del pipeline de importación (contenido-IA), no antes del
> site demo.

El flujo real de la agencia es: el cliente manda una foto nueva para una
galería y alguien la sube al panel. Para eso hacen falta tres cosas que hoy no
están: saber **dónde va**, saber **si ya está**, y **encontrarla** después.

Las carpetas ya se resolvieron con `folders: true` durante HU-008 (ver
`specs/payload/modelo-datos.md`, sección `media`). Quedan las otras dos, y una
de ellas es un problema activo.

**Payload no avisa de los duplicados: los renombra.** Si subes un archivo cuyo
nombre ya existe, `getSafeFileName` le añade un sufijo y guarda igualmente:

```
foto.jpg    → ya existe → guarda foto-1.jpg
foto-1.jpg  → ya existe → guarda foto-2.jpg
```

Dos registros, dos ficheros en disco, ningún aviso. Con una biblioteca de
cientos de imágenes por cliente, eso se convierte en un vertedero: nadie sabe
cuál es la buena y el peso del almacenamiento crece sin motivo.

Esta historia debería ir **antes del importador**, que mete decenas de imágenes
de golpe y, sin detección de duplicados, las duplicaría enteras en cada
reimportación.

## Qué hacer

1. **Detección de duplicados por contenido**
   - Calcular el hash del archivo al subirlo (`beforeOperation` o
     `beforeChange`) y guardarlo en un campo indexado y único
   - Si ya existe un documento con ese hash, rechazar la subida con un error
     que **diga cuál es el archivo existente y en qué carpeta está**, para que
     el editor use ese en lugar de subir otro
   - Detecta el mismo archivo aunque venga con otro nombre, que es el caso
     habitual cuando el cliente reenvía una foto

2. **Listado visual**
   - Miniatura como columna del listado, no solo texto
   - Columnas por defecto: miniatura, `alt`, carpeta, dimensiones y peso
   - Filtros por carpeta y por tipo de archivo

3. **Metadatos que ayuden a encontrarla**
   - Revisar si `alt` basta como título del documento o hace falta un campo de
     nombre interno — `alt` es texto para accesibilidad, no un nombre de
     archivo, y son cosas distintas
   - Considerar etiquetas libres si el árbol de carpetas se queda corto

4. **Aviso de archivos huérfanos**
   - Consulta o vista que liste los `media` que no referencia ningún documento,
     para poder limpiarlos

## Leer antes

- specs/payload/modelo-datos.md (sección `media`)
- docs/decisiones/DEC-010-media-storage.md
- docs/estandares/codigo.md

## Criterios de aceptación

- [ ] Subir dos veces el mismo archivo, con nombres distintos, se detecta y se
      rechaza indicando cuál es el existente
- [ ] Subir un archivo distinto con el mismo nombre sigue funcionando
- [ ] El listado de `media` muestra miniatura, carpeta, dimensiones y peso
- [ ] Se puede filtrar el listado por carpeta
- [ ] Existe forma de listar los archivos que no usa ningún documento
- [ ] El hash no se recalcula al editar metadatos de un archivo ya subido
- [ ] Tests de los hooks — cobertura >70%

## Notas

**Dependencia experimental:** `folders: true` está marcado como experimental
por Payload (ver la nota en `specs/payload/modelo-datos.md`). Esta historia se
apoya en las carpetas para el listado y los filtros, así que hay que revisarla
al actualizar Payload. **No derivar de la carpeta la ruta física de los
ficheros**: eso corresponde al `prefix` del adapter de nube (DEC-010) y
acoplarlo aquí obligaría a mover archivos cada vez que alguien renombre una
carpeta.

## Retrospectiva

_(vacía al crear — se llena si la historia necesitó correcciones significativas)_

## Aprendizajes

| Qué se descubrió | Dónde se documenta | Propagado |
|------------------|-------------------|-----------|

_(se llena durante la implementación)_
