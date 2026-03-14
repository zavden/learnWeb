# Plan: Cambio De Etiqueta/Tipo De Archivo Desde El Editor

## Objetivo

Permitir que el usuario haga click en la etiqueta del archivo o bloque (`HTML`, `CSS`, `JS`, `TSX`, `Vue`, etc.) y abra un menu para cambiarla por otra compatible.

La meta no es solo cambiar el badge visual. La meta real es cambiar el `language` o `blockType` del documento activo de forma segura, persistible y consistente con:

- legacy blocks
- virtual files
- React multi-file
- Vue multi-file
- Vue SFC
- entry files
- extensiones de path
- validaciones actuales
- preview y compilacion

## Por Que Es Delicado

Este cambio toca una zona sensible del proyecto:

- en `legacy-blocks`, cambiar `HTML` por `PUG` o `CSS` por `SCSS` cambia el significado del documento
- en `virtual-files`, cambiar `language` puede volver invalida la extension del path
- en React y Vue multi-file, algunas combinaciones de lenguaje no son validas
- si el archivo es `entry`, cambiar el lenguaje puede volver invalido `metadata.entry`
- en Vue SFC, un `.vue` no es equivalente a `html` o `javascript`
- en shaders, `vertex` y `fragment` forman una pareja especial
- en ejercicios, archivos locked/reference/solution no deben romperse por una edicion accidental

Por eso el cambio necesita fases y una matriz de transiciones validas.

## Alcance Inicial

Incluye:

- click en badge para abrir menu de cambio
- popup de cambio con validacion explicita
- cambio de tipo para bloques legacy
- cambio de `language` para virtual files
- guardrails para React/Vue/shaders
- actualizacion de `path` cuando la extension ya no coincide
- actualizacion de `metadata.entry` si aplica
- guardado por flujo normal del editor

No incluye de entrada:

- cambiar `role` desde el badge
- conversion semantica profunda del contenido
- refactors automaticos dentro del codigo
- migraciones masivas de varios archivos al mismo tiempo

## Decisiones Base

### 1. El cambio sera guiado por compatibilidad, no libre

El menu no mostrara “todos los tipos del sistema” siempre.

Mostrara solo los compatibles con el contexto actual:

- `legacy-blocks`: solo tipos legacy compatibles
- `virtual-files` sin framework: solo lenguajes de archivos soportados
- React multi-file: solo lenguajes validos para React
- Vue multi-file: solo lenguajes validos para Vue
- shader: solo `vertex` o `fragment` donde aplique

### 2. Habra transiciones permitidas y transiciones bloqueadas

Ejemplos razonables:

- `css -> scss`: permitido
- `scss -> css`: permitido
- `javascript -> typescript`: permitido
- `typescript -> javascript`: permitido
- `html -> pug`: permitido en legacy
- `html -> svg`: permitido en legacy
- `jsx -> vue`: bloqueado
- `vue -> tsx`: bloqueado
- `vertex -> css`: bloqueado

### 3. Si cambia la extension, el path se ajusta automaticamente

Ejemplos:

- `src/App.jsx -> src/App.tsx`
- `src/styles.css -> src/styles.scss`
- `src/main.js -> src/main.ts`

Si el usuario cambio el lenguaje pero el path ya tiene una extension incompatible, el sistema corrige el path al guardar el cambio.

### 4. Si el archivo es `entry`, tambien se sincroniza `metadata.entry`

Ejemplo:

- `entry: src/main.jsx`
- cambias `src/main.jsx` a `tsx`
- el path pasa a `src/main.tsx`
- `metadata.entry` debe actualizarse tambien

## Criterios De Exito

Al terminar:

- hacer click en un badge abre un menu de cambio de tipo/lenguaje
- el menu abre como popup claro, no como cambio directo sin confirmacion
- el menu solo ofrece opciones validas para ese archivo
- si una opcion no es valida, la UI indica por que
- el usuario no puede aplicar cambios si la transicion sigue bloqueada
- el cambio actualiza el documento en memoria sin romper el editor
- si la extension del path ya no coincide, se corrige automaticamente
- React y Vue multi-file conservan invariantes de compilacion
- los archivos `entry` siguen siendo validos
- los shaders no quedan en estados imposibles
- el preview y los diagnosticos se recalculan bien
- `Save`, `Modify`, `Ctrl+S` y `:w` persisten el resultado correcto

## Fase 1: Matriz De Compatibilidad Y Helpers Base

Objetivo:

- definir formalmente que cambios son validos en cada contexto

Cambios:

- crear una matriz de transiciones validas por contexto:
  - legacy
  - virtual-files sin framework
  - React multi-file
  - Vue multi-file
  - shader
- crear helpers puros en `markdown.js` o util dedicado para:
  - listar opciones validas para un archivo
  - decidir si una transicion es valida
  - devolver motivo de bloqueo cuando no es valida
  - calcular extension esperada del path

Riesgo:

- si esta matriz queda incompleta, la UI dejara entrar cambios que luego el compilador rechaza

Entrega:

- una API interna confiable para preguntar “que opciones tiene este badge”

## Fase 2: Cambio Seguro En Legacy Blocks

Objetivo:

- soportar primero el caso mas simple: documentos por bloques

Cambios:

- permitir cambiar `block.type` y `block.language` en legacy
- recalcular el `file` derivado para ese bloque
- mantener la posicion del bloque y su contenido
- bloquear transiciones peligrosas entre mundos incompatibles

Casos clave:

- `HTML <-> PUG`
- `HTML <-> SVG`
- `CSS <-> SCSS <-> SASS`
- `JavaScript <-> TypeScript`

Riesgo:

- ciertos cambios hacen que el contenido ya no sea valido semanticamente

Mitigacion:

- el sistema solo cambia el tipo
- no promete migrar el contenido
- los errores posteriores se muestran como diagnosticos normales

Entrega:

- cambio de badge funcional para legacy

## Fase 3: Cambio Seguro En Virtual Files

Objetivo:

- soportar cambio de `language` en archivos virtuales sin romper path ni metadata

Cambios:

- extender `updateDocumentFileDetails(...)` o helper nuevo para:
  - cambiar `language`
  - actualizar extension del path si hace falta
  - conservar basename si es posible
  - sincronizar `entry` si el archivo cambiado es el `entry`
  - devolver error explicito si el cambio termina en colision o estado invalido

Casos clave:

- `App.jsx -> App.tsx`
- `main.js -> main.ts`
- `styles.css -> styles.scss`
- `Widget.ts -> Widget.js`

Riesgo:

- dos archivos pueden terminar colisionando en el mismo path

Mitigacion:

- si el path recalculado ya existe, el cambio debe bloquearse con mensaje claro

Entrega:

- cambios de lenguaje virtual-file consistentes y sin colisiones silenciosas

## Fase 4: Guardrails Especiales Para React, Vue Y Shaders

Objetivo:

- endurecer el cambio donde mas facil es romper el proyecto

Cambios:

- React multi-file:
  - solo permitir lenguajes soportados por React
  - validar entry languages React
- Vue multi-file:
  - solo permitir lenguajes soportados por Vue
  - respetar reglas de `.vue`
  - respetar entry languages Vue
- shader:
  - permitir solo `vertex` y `fragment`
  - bloquear cualquier cambio que destruya el modelo `Vertex + Fragment`

Riesgo:

- una conversion aparentemente trivial puede dejar el documento en estado invalido pero guardable

Entrega:

- el menu ya no deja hacer transiciones absurdas en frameworks o shaders

## Fase 5: UI Del Menu De Cambio Desde El Badge

Objetivo:

- hacer visible la funcionalidad en el editor

Cambios:

- el badge del panel/tab se vuelve clickable
- al hacer click, abrir un popup pequeno y centrado respecto al badge
- mostrar:
  - tipo/lenguaje actual
  - lista de opciones compatibles
  - opcion deshabilitada si una transicion esta bloqueada
  - razon visible de bloqueo para la opcion seleccionada
  - resumen de que cambiara si la transicion es valida:
    - lenguaje
    - path/extension
    - `entry` si aplica
- incluir botones explicitos:
  - `Cancel`
  - `Apply`
- `Apply` solo se habilita si la transicion actual es valida

Detalles UX:

- en `Tabs`, debe funcionar tanto en el tab como en la meta del archivo activo
- en `Panels`, debe funcionar desde el header del panel
- el cambio debe restaurar foco al editor luego de cerrar el menu
- si el usuario elige una opcion invalida, el popup no se cierra y debe mostrar claramente la razon

Riesgo:

- el menu puede competir con el click del tab o con el header del panel
- si la razon de bloqueo no se entiende, el usuario percibira el sistema como arbitrario

Entrega:

- cambio accesible, explicable y bloqueado correctamente desde la UI

## Fase 6: Integracion Con Preview, Diagnostics Y Session State

Objetivo:

- asegurar que el resto de la app entienda el nuevo tipo inmediatamente

Cambios:

- rerender del workspace si cambia el badge
- recompilacion o rerender del preview
- resincronizacion de diagnostics
- mantener foco y archivo activo
- persistir bien en session state si el usuario cambia layout o recarga

Riesgo:

- cambiar tipo y luego cambiar de `Tabs` a `Panels` puede rehidratar mal el documento si algo sigue usando el tipo viejo

Entrega:

- flujo estable despues del cambio de tipo

## Fase 7: Casos Especiales

Objetivo:

- cerrar zonas problematica antes de darlo por terminado

Cambios:

- ejercicios:
  - bloquear cambios sobre archivos locked si aplica
  - revisar reference/solution files
- theory edit:
  - confirmar que `main.md` no expone esta UI
- hidden files:
  - si un archivo oculto cambia de tipo, la visibilidad no debe perderse
- favorites:
  - no debe cambiar nada porque siguen apuntando al Markdown, no a archivos virtuales internos

Riesgo:

- edge cases de UI que no fallan en compile pero si en flujo de trabajo

Entrega:

- funcionalidad robusta en escenarios reales

## Fase 8: Tests

Objetivo:

- cubrir la logica antes de abrir el feature por completo

Tests minimos:

- matriz de compatibilidad por contexto
- motivo de bloqueo correcto por contexto
- legacy transitions validas e invalidas
- virtual-file language change con rename de extension
- sync de `metadata.entry`
- colision de path al cambiar extension
- React invalid language blocked
- Vue invalid language blocked
- shader invalid transition blocked
- popup con `Apply` deshabilitado cuando la opcion sigue bloqueada
- foco restaurado tras cerrar el menu

Riesgo:

- sin tests, este feature puede romper silenciosamente proyectos multi-file

Entrega:

- suite de regresion razonable

## Fase 9: README Y QA Manual

Objetivo:

- documentar el comportamiento y validar el flujo real

Cambios:

- actualizar README
- documentar que el cambio de tipo no migra automaticamente el contenido
- dejar claro que algunas transiciones se bloquean por compatibilidad

QA manual sugerido:

- cambiar `CSS -> SCSS`
- cambiar `JS -> TS`
- cambiar `App.jsx -> App.tsx`
- cambiar `main.js -> main.ts` cuando es `entry`
- probar un Vue SFC y confirmar que no ofrece cambios invalidos
- probar shader y confirmar que solo aparecen opciones validas

## Orden Recomendado

1. Fase 1
2. Fase 2
3. Fase 3
4. Fase 4
5. Fase 5
6. Fase 6
7. Fase 7
8. Fase 8
9. Fase 9

## Resultado Esperado

Al final del roadmap, el badge del archivo deja de ser decorativo y se vuelve una herramienta real de edicion.

Pero el sistema no debe tratar esto como un simple cambio cosmetico: debe tratarlo como una migracion controlada de tipo de archivo, con reglas distintas para legacy, virtual-files, React, Vue y shaders.
