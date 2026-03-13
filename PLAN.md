# Plan de Implementacion: Consola de Runtime por Markdown

## Objetivo

Agregar una consola visual debajo del preview, estilo CodePen, orientada a depurar ejemplos con `JavaScript` o `TypeScript`.

La consola debe:

- existir solo cuando el Markdown del ejemplo la habilite
- conservar el historial aunque el preview se vuelva a renderizar
- mostrar el orden de ejecucion
- mostrar `log`, `info`, `warn`, `error`
- mostrar errores reales de runtime y `unhandledrejection`
- quedar preparada para ejecutar comandos en una fase posterior
- permitir aumentar y disminuir el zoom de fuente de la consola

## Conclusiones de la Evaluacion

### 1. La base tecnica ya existe y la dificultad es razonable

El proyecto ya tiene un punto central de render del preview:

- [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)

Eso hace viable interceptar el runtime del `iframe` sin tocar cada ejemplo por separado.

Estimacion:

- consola basica con logs, warnings, errores y persistencia entre rerenders: `4/10` a `5/10`
- consola con ejecucion de comandos tipo REPL: `6/10` a `7/10`

### 2. El cuello de botella actual no es el preview, es el modelo de documento

Hoy el parser de ejemplos solo entiende bloques de codigo y headings:

- [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)

No existe metadata de documento para cosas como:

- `console: true`
- configuracion inicial de consola
- futuras flags de runtime

Conclusion:

- antes de dibujar la consola, hay que extender el formato del Markdown para soportar metadata de ejemplo

### 3. La consola no debe vivir dentro del iframe

Hoy el `iframe` se reemplaza en cada render con `srcdoc`.

Si el historial vive dentro del propio preview:

- se va a perder en cada recarga
- no se va a poder ver el orden real entre ejecuciones
- ejecutar comandos despues sera mas dificil

Conclusion:

- el `iframe` solo debe emitir eventos
- el historial debe vivir en la app principal, fuera del `iframe`

### 4. "Errores y warnings reales" necesita una definicion precisa

Lo que si es factible capturar de forma fiable:

- `console.log`
- `console.info`
- `console.warn`
- `console.error`
- `window.onerror`
- `unhandledrejection`
- errores de runtime del script del usuario
- diagnosticos de compilacion ya existentes

Lo que no se puede prometer capturar al 100% desde codigo de pagina:

- todos los warnings internos de DevTools del navegador
- todos los warnings de red, CSP o deprecations generados solo por el browser

Conclusion:

- la primera version debe mostrar todos los errores y warnings observables desde el runtime del `iframe`
- no debe venderse como clon completo de la consola del navegador

### 5. La implementacion debe quedar lista para comandos futuros

Si la consola se hace solo como visor de texto, luego habra que rehacerla para soportar input.

La direccion correcta desde el inicio es:

- un canal `postMessage` bidireccional entre app e `iframe`
- eventos con `renderId`
- store de consola por ejemplo
- base para pedir evaluaciones futuras al contexto vivo del preview

## Contrato Propuesto de Markdown

### Opcion recomendada

Agregar metadata de documento al inicio del archivo.

Ejemplo minimo:

```md
---
console: true
---

# HTML
```html
<button id="run">Run</button>
```

# JavaScript
```javascript
console.log('ready');
```
```

### Extension futura compatible

```md
---
console:
  enabled: true
  open: true
  height: 180
  fontSize: 12
---
```

### Decision recomendada

Primera iteracion:

- soportar `console: true|false`
- no guardar en Markdown el zoom real que el usuario vaya cambiando en la UI
- tratar `open`, `height` y `fontSize` como futuras extensiones

Razon:

- minimiza el cambio inicial
- evita sobredisenar la metadata
- mantiene claro que el Markdown habilita la herramienta, pero la preferencia visual sigue siendo del usuario

## Modelo de Datos Objetivo

El documento parseado debe crecer a algo como esto:

```js
{
  sessionId: 'html-javascript',
  blocks: [...],
  diagnostics: [...],
  unsupportedBlocks: [...],
  metadata: {
    console: {
      enabled: true
    }
  }
}
```

La consola en frontend debe tener un store separado:

```js
{
  topicPath: '...',
  filename: 'ex01.md',
  entries: [
    {
      id: '...',
      renderId: 3,
      level: 'log',
      origin: 'runtime',
      message: ['ready'],
      timestamp: 1710000000000
    }
  ]
}
```

## Arquitectura Recomendada

### 1. Bridge dentro del iframe

El HTML generado por [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js) debe inyectar un script bootstrap antes del script del usuario.

Ese bootstrap debe:

- parchear `console.log`, `console.info`, `console.warn`, `console.error`
- escuchar `window.error`
- escuchar `window.unhandledrejection`
- enviar mensajes al padre con `window.parent.postMessage(...)`
- etiquetar cada mensaje con `renderId`

### 2. Store de consola en el padre

[src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js) debe escuchar `message` events del `iframe` y pasarlos a un componente de consola.

El store debe:

- conservar entradas entre rerenders del mismo ejemplo
- insertar separadores por corrida, por ejemplo `Run #1`, `Run #2`
- limpiarse solo cuando el usuario lo pida o cuando se cambie de ejemplo

### 3. UI debajo del preview

La consola debe vivir debajo de [index.html](/home/zavden/Learning/Web/learnWeb/index.html) en la columna del preview.

Primera version:

- panel colapsable
- scroll vertical
- boton `Clear`
- botones `A-` y `A+`
- badge por nivel (`LOG`, `WARN`, `ERROR`)

### 4. Gating por Markdown

La UI de consola no debe aparecer siempre.

Regla:

- si `metadata.console.enabled !== true`, no se muestra consola
- si no hay script block y la consola no esta habilitada, no se monta nada relacionado
- si la consola esta habilitada aunque no haya script, puede mostrarse vacia para registrar errores de runtime o futuros comandos

## Fases de Implementacion

## Fase 1: Metadata de Documento

Objetivo:

- permitir que el ejemplo active capacidades de runtime desde Markdown

Cambios:

- extender [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js) para parsear metadata al inicio
- extender `buildExampleDocument(...)` para serializar esa metadata
- definir valores por defecto seguros cuando no haya metadata

Decision tecnica recomendada:

- implementar parser minimo propio
- evitar introducir una dependencia YAML si no hace falta en esta iteracion

Resultado esperado:

- un ejemplo puede declarar `console: true`

## Fase 2: Shell de Consola en la UI

Objetivo:

- crear el panel visual debajo del preview

Cambios:

- actualizar [index.html](/home/zavden/Learning/Web/learnWeb/index.html) para alojar la consola
- actualizar [src/style.css](/home/zavden/Learning/Web/learnWeb/src/style.css) para layout, scroll, badges y controles de zoom
- crear componente nuevo, por ejemplo `src/components/ConsolePanel.js`

Resultado esperado:

- la consola puede abrirse/cerrarse debajo del preview
- tiene controles de clear y zoom

## Fase 3: Runtime Bridge

Objetivo:

- capturar la actividad real del JS/TS ejecutado

Cambios:

- modificar [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js) para inyectar bootstrap de consola
- emitir `postMessage` hacia el parent
- mover el script del usuario a un bloque separado del bootstrap para no perder errores de parseo

Resultado esperado:

- `console.log`, `console.warn`, `console.error`, errores y promesas rechazadas llegan a la app

## Fase 4: Persistencia Entre Rerenders

Objetivo:

- que la consola no se vacie en cada recompilacion del preview

Cambios:

- almacenar las entradas en el parent
- asignar `renderId` incremental desde [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- agregar marcador de corrida antes de cada nuevo render

Regla de limpieza recomendada:

- `Refresh` no limpia
- cambio de codigo no limpia
- `Clear` manual si limpia
- cambiar de archivo si limpia

Resultado esperado:

- se ve el orden de ejecucion de varias corridas seguidas

## Fase 5: Integracion con Diagnosticos de Compilacion

Objetivo:

- unificar errores de compilacion y errores de runtime sin mezclarlos mal

Cambios:

- mantener compile diagnostics como categoria separada
- decidir si aparecen en el panel de consola o en una sub-seccion del mismo

Decision recomendada:

- mostrarlos en la consola con `origin: compile`
- no reemplazar el estado visual de error ya existente del editor

Resultado esperado:

- el usuario ve en un solo lugar los problemas observables del ejemplo

## Fase 6: Preparacion de REPL

Objetivo:

- dejar listo el protocolo para ejecutar comandos despues

Cambios:

- definir mensajes `console:eval-request` y `console:eval-result`
- reservar area de input en el componente, aunque pueda quedar deshabilitada inicialmente
- documentar que la evaluacion correra dentro del mismo contexto del `iframe`

Resultado esperado:

- la segunda iteracion no requiere rehacer el bridge

## Fase 7: Zoom de Fuente

Objetivo:

- controlar el tamaño del texto de consola de forma independiente del editor

Cambios:

- estado local de `consoleFontSize`
- botones `A-` y `A+`
- persistencia opcional en `localStorage`

Resultado esperado:

- la consola se puede leer mejor sin tocar el editor

## Riesgos y Puntos Delicados

### 1. Serializacion de objetos

`console.log(window)` o estructuras circulares no pueden enviarse tal cual por `postMessage`.

Solucion recomendada:

- serializador seguro con profundidad limitada
- strings cortadas a un maximo razonable
- representaciones explicitas para `Error`, arrays, objetos, funciones y nodos DOM

### 2. Errores de parseo de JS

Si el JS del usuario tiene error de sintaxis, un `try/catch` normal no lo captura.

Solucion recomendada:

- bootstrap en un `<script>` propio
- script del usuario en otro `<script>` separado
- captura por `window.onerror`

### 3. Seguridad del canal de mensajes

Debe filtrarse lo que llega a `window.message`.

Solucion recomendada:

- validar `event.source === iframe.contentWindow`
- validar `type`
- ignorar mensajes externos

### 4. Comportamiento con `console: false`

La consola debe desaparecer por completo.

Decision recomendada:

- no renderizar el panel
- no montar listeners de runtime innecesarios para ese preview

## Alcance de la Primera Implementacion Recomendada

### Incluye

- metadata `console: true`
- panel de consola debajo del preview
- logs persistentes entre rerenders del mismo ejemplo
- `log`, `info`, `warn`, `error`
- `window.onerror`
- `unhandledrejection`
- boton `Clear`
- zoom de fuente simple
- soporte para `JavaScript` y `TypeScript`

### No incluye todavia

- input ejecutable tipo REPL
- autocompletado en consola
- `console.table`
- `group/groupCollapsed`
- expandir objetos como DevTools
- captura perfecta de todos los warnings internos del browser

## Criterios de Aceptacion

### Para la primera entrega

- un ejemplo sin `console: true` no muestra consola
- un ejemplo con `console: true` si muestra consola
- `console.log('a')` aparece en consola
- `console.warn('b')` aparece como warning
- `throw new Error('x')` aparece como error de runtime
- `Promise.reject(new Error('y'))` aparece como `unhandledrejection`
- modificar el codigo y rerenderizar no borra el historial previo
- `Clear` vacia la consola
- cambiar de ejemplo reinicia la consola del ejemplo anterior
- `A-` y `A+` cambian el tamaño de fuente de la consola

### Para la segunda entrega

- existe input de consola
- se puede evaluar codigo en el contexto vivo del preview
- el resultado vuelve al panel de consola

## Archivos que Seguramente Cambiaran

- [PLAN.md](/home/zavden/Learning/Web/learnWeb/PLAN.md)
- [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)
- [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)
- [index.html](/home/zavden/Learning/Web/learnWeb/index.html)
- [src/style.css](/home/zavden/Learning/Web/learnWeb/src/style.css)
- nuevo componente probable: `src/components/ConsolePanel.js`

## Estado

Listo para empezar la implementacion.

Orden recomendado:

1. metadata en Markdown
2. shell visual de consola
3. bridge de runtime
4. persistencia entre rerenders
5. zoom de fuente
