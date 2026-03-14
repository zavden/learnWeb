# TODO

## Modularización del código fuente

Patrón a seguir: `markdown.js` → re-exporta desde `markdown/`.
Cada módulo grande se convierte en un directorio con un archivo índice.

### Fase 1 — `exampleCompiler.js` (1,647 líneas)

Estado: `completada`

Dividir en `src/utils/compiler/`:

- `compiler/reactCompiler.js` — compilación React single-file y multi-file
- `compiler/vueCompiler.js` — compilación Vue single-file, multi-file y SFC
- `compiler/markupCompiler.js` — Pug, HTML, SVG
- `compiler/styleCompiler.js` — CSS, SCSS, SASS
- `compiler/scriptCompiler.js` — JavaScript, TypeScript
- `compiler/virtualFilesPlugin.js` — plugin esbuild de módulos inline
- `compiler/helpers.js` — `createCompileDiagnostic`, normalización, utilidades compartidas
- `exampleCompiler.js` — fachada: `compileExampleDocument()` + re-exports

Validación: `npm test`

### Fase 2 — `exampleRenderer.js` (1,561 líneas)

Estado: `completada`

Dividir en `src/utils/renderer/`:

- `renderer/runtimeBridge.js` — `buildRuntimeBridgeMarkup`, consola del iframe
- `renderer/diagnosticsMarkup.js` — `buildDiagnosticsMarkup`, `formatDiagnosticLocation`
- `renderer/shaderRenderer.js` — `renderShaderExampleDocument`, script WebGL, panel shader
- `renderer/documentRenderer.js` — `renderCompiledExampleDocument`, `injectFullDocumentMarkup`, helpers HTML
- `exampleRenderer.js` — fachada con re-exports

Validación: `npm test`

### Fase 3 — `Preview.js` (2,071 líneas)

Estado: `completada`

Dividir en `src/components/preview/`:

- `preview/ConsoleManager.js` — sesión de consola, entries, filtros, input, render
- `preview/ShaderControls.js` — uniformes, texturas, resolución, panel shader
- `preview/RuntimeDiagnostics.js` — registro, renderizado y emisión de diagnósticos de runtime
- `Preview.js` — clase principal orquestadora + re-exports

Validación: `npm test` + `npm run build`

### Fase 4 — `Editor.js` (5,285 líneas)

Estado: `completada`

Dividir en `src/components/editor/`:

- `editor/diagnostics.js` — `DiagnosticGutterMarker`, `buildEditorDiagnosticSets`, `editorDiagnosticsField`, collect/resolve/sync
- `editor/sessionManager.js` — snapshots, workspace state, session persistence
- `editor/shaderDialogs.js` — diálogos de uniforms, texturas, resolución
- `editor/metadataDialogs.js` — editorial metadata, file details, file type change
- `editor/fileOperations.js` — save, modify, rename, delete, create file
- `editor/theoryEditor.js` — modo edición de `main.md`, theory preview bridge
- `editor/exercisePanel.js` — comparación attempt/solution, panel de ejercicios
- `Editor.js` — clase principal orquestadora + re-exports

Validación: `npm test` + `npm run build`

### Fase 5 — Archivos medianos

Estado: `completada`

- `vimSupport.js` (587 líneas) → extraer `vim/clipboardBridge.js`
- `vimShortcutConfig.js` (472 líneas) → extraer `vim/yamlParser.js`

Validación: `npm test`

### Reglas para cada fase

1. Leer el archivo completo antes de mover código.
2. No cambiar lógica: solo reorganizar.
3. El archivo original queda como fachada que re-exporta todo.
4. Imports internos del proyecto no deben romperse.
5. Correr `npm test` después de cada fase. Si hay tests específicos, correrlos también.
6. Si la fase toca componentes de UI, correr `npm run build` además.
7. Reportar qué archivos se crearon y cuáles se modificaron.

---

## Bug Resuelto: React/Vue no muestran el recuadro rojo de error bajo el preview

Estado actual:

- En `shaders` el recuadro de error visible sí funciona.
- En `HTML` simple hay casos estructurales que sí muestran warning.
- En `React` y `Vue`, cuando el usuario provoca errores deliberados, la consola del preview sí recibe errores, pero no aparece el recuadro rojo debajo del preview ni el panel esperado por ese flujo.

Síntomas observados:

- El preview deja de funcionar o queda vacío.
- La consola puede mostrar el error.
- El bloque visual de error del preview no aparece.
- El estado no coincide entre:
  - errores de compilación estructural
  - errores de runtime
  - errores de frameworks React/Vue

Hipótesis anteriores (contexto original):

1. Parte de los errores de React/Vue no están llegando como `compileDiagnostics`, sino como errores de runtime posteriores al bootstrap.
2. El flujo visual del preview distingue entre:
   - errores de compilación renderizados dentro del `iframe`
   - errores de runtime enviados por `postMessage`
   y esos dos caminos no están unificados todavía para React/Vue.
3. Puede haber una diferencia entre errores de:
   - compilación real del documento
   - bootstrap del framework dentro del `iframe`
   - render inicial de componentes
4. El warning de `DOCTYPE` sí aparece porque vive en el flujo de diagnósticos estructurales del documento, no en el flujo React/Vue.

Intentos ya hechos:

- Se evitó reservar `min-height` en `#root` / `#app` cuando hay errores bloqueantes.
- Se dejó visible `Compile diagnostics` aun con consola activa si el error es bloqueante.
- Se añadieron diagnósticos de runtime al estado del editor y a un contenedor visual debajo del preview.

Resultado:

- Todo eso compila y pasa tests, pero no resolvió el caso real reportado por el usuario.

---

## Investigación profunda — Análisis del flujo de errores

Fecha: 2026-03-14

### Flujo completo trazado

El error recorre esta cadena:

```
Editor cambia código
  → Preview.compileAndRender()
    → compileClient.js → Worker → API /api/compile → server.js
      → exampleCompiler.js: compileReactSingleFileDocument() / compileVueSingleFileDocument()
      → retorna { compiledDocument, compileDiagnostics }
    → Preview recibe resultado
      → renderCompiledExampleDocument(compiledDocument, ..., diagnostics, { consoleEnabled })
        → genera srcdoc del iframe con posible recuadro de error inline
      → _emitCompileState(diagnostics) → Editor.setCompileDiagnostics() → line markers

Errores de runtime (dentro del iframe):
  → buildRuntimeBridgeMarkup() → window.addEventListener('error') / 'unhandledrejection'
    → postMessage(kind: 'runtime-error') al padre
  → Preview._handleIframeMessage()
    → isRuntimeDiagnostic? → _registerRuntimeDiagnostic() → _renderRuntimeDiagnostics()
      → muestra #preview-runtime-status + _emitRuntimeDiagnostics() → Editor.setRuntimeDiagnostics()
    → consola intercepta console.error() → appendConsoleEntry() → renderConsoleEntries()
```

### Por qué shaders SÍ funcionan

Los shaders NO usan el runtime bridge ni la consola. Su error se detecta al compilar
el shader con WebGL (`gl.getShaderInfoLog`), se genera markup de error estático directamente
en `buildShaderStatusMarkup()` y se inyecta en el DOM del panel shader. Es un flujo autocontenido
que no depende de `compileDiagnostics`, `postMessage`, ni del bridge del iframe.

### Hipótesis investigadas y confirmadas

#### H1 (ALTA PROBABILIDAD) — `console.error()` de React/Vue no se registra como diagnóstico de runtime

**Archivo**: `exampleRenderer.js:252-280` (bridge), `Preview.js:737-748` (listener)

El bridge en el iframe registra como diagnóstico de runtime **solo** eventos de tipo
`'runtime-error'` (de `window.addEventListener('error')`) y `'unhandled-rejection'`.

Pero React 18+ y Vue 3 **capturan los errores internamente** dentro de su propio árbol de componentes.
React los atrapa en su reconciler, llama a `console.error()` con el mensaje formateado, y puede
que el error no propague a `window.onerror` en todos los casos (especialmente errores de render,
hooks inválidos, y errores dentro de event handlers que React envuelve).

Vue 3 tiene `app.config.errorHandler` interno que atrapa errores de componentes y emite
`console.warn()` / `console.error()` sin dejar que el error llegue a `window.onerror`.

Cuando el error llega como `console.error()`:
- El bridge lo intercepta como `kind: 'console'`, `level: 'error'`
- La consola del preview lo muestra ✓
- Pero `isRuntimeDiagnostic` en Preview.js:737 es `false` (requiere `kind === 'runtime-error'`)
- **No se llama** `_registerRuntimeDiagnostic()` → no hay recuadro rojo ni line markers ✗

**Esto explica exactamente el síntoma**: "la consola sí recibe errores, pero no aparece
el recuadro rojo ni los marcadores de línea".

#### H2 (ALTA PROBABILIDAD) — Renderer descarta markup de error dentro del iframe cuando consola está activa

**Archivo**: `exampleRenderer.js:408-410`

```js
const diagnosticsMarkup = consoleEnabled && !hasBlockingDiagnostics
    ? ''
    : buildDiagnosticsMarkup(diagnostics);
```

Si `consoleEnabled === true` y no hay errores bloqueantes en `compileDiagnostics`,
el renderer **no genera markup de error** dentro del iframe. La idea es que el bridge
se encargue de mostrar errores vía `postMessage`. Pero combinado con H1, si React/Vue
no dejan que sus errores lleguen a `window.onerror`, el bridge no los registra como
diagnósticos y **nadie muestra el error visual**.

Para errores de compilación bloqueantes (esbuild falla), el markup SÍ se genera
(`!hasBlockingDiagnostics` es false). Pero para errores de runtime de framework,
`compileDiagnostics` está vacío → `hasBlockingDiagnostics = false` → sin markup.

#### H3 (MEDIA) — React single-file descarta `appDiagnostics` en el path de éxito

**Archivo**: `exampleCompiler.js:506-516`

Cuando esbuild compila exitosamente un ejemplo React single-file, solo se retornan
`styleResult.diagnostics`. Los `appDiagnostics` de `validateReactSingleFileAppBlock()`
se descartan completamente:

```js
compileDiagnostics: [
    ...styleResult.diagnostics,
    // appDiagnostics no se incluye aquí
],
```

Los errores de validación nivel 'error' SÍ se capturan antes del try (líneas 483-496),
pero warnings de validación del bloque app se pierden silenciosamente.

#### H4 (MEDIA) — Vue single-file filtra diagnósticos de error en path de éxito

**Archivo**: `exampleCompiler.js:1183-1184`

Después de compilación exitosa de Vue, los diagnósticos de validación y template se filtran:

```js
...validationDiagnostics.filter((diagnostic) => diagnostic.level !== 'error'),
...templateResult.diagnostics.filter((diagnostic) => diagnostic.level !== 'error'),
```

Aunque los errores nivel 'error' ya se capturaron en la línea 1146-1149, este filtro
es defensivo pero potencialmente confuso. Si alguna ruta generara diagnósticos de error
que no fueran "bloqueantes" según el check inicial, se perderían aquí.

#### H5 (BAJA) — Offset de líneas en bundles React/Vue

**Archivo**: `exampleCompiler.js:371-387` (`buildReactSingleFileEntry`)

El entry de React envuelve el código del usuario con imports (~4 líneas antes del código real):

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
${appSource}   // código del usuario empieza en línea ~4
```

Aunque esbuild genera sourcemaps inline, los stack traces de errores de runtime podrían
referenciar paths y líneas del bundle que no coinciden con los archivos del document model.
`_findFileForDiagnostic()` podría no resolver el path del stack trace al file correcto.

Esto NO causa la ausencia del recuadro (ese viene de otra vía), pero SÍ podría explicar
que los line markers no se posicionen correctamente incluso si los datos llegan.

#### H6 (DESCARTADA) — CSS roto por la refactorización de styles

Los estilos para error existen y están completos:
- `.editor-status.error` → recuadro en el editor
- `.preview-runtime-status` → recuadro bajo el preview (con `.hidden` para ocultar)
- `.cm-diagnostic-gutter-error` → punto rojo en líneas
- `.cm-diagnostic-line-error` → highlight de línea

El CSS no es la causa. El problema es que los datos nunca llegan al JS que
remueve `.hidden` de los contenedores.

---

### Diagnóstico raíz (combinación de H1 + H2)

Los errores de React/Vue son **errores de framework** que los propios React 18+ y Vue 3
capturan internamente. Estos frameworks emiten los errores por `console.error()` en vez
de dejarlos propagar a `window.onerror`. El bridge del iframe intercepta `console.error()`
y lo envía al padre como `kind: 'console'`, pero Preview.js solo registra diagnósticos
de runtime para `kind: 'runtime-error'` o `'unhandled-rejection'`.

El resultado neto:
1. `console.error()` del framework → llega a la consola del preview ✓
2. Pero no dispara `_registerRuntimeDiagnostic()` → sin recuadro rojo ✗
3. Sin runtime diagnostics → sin `setRuntimeDiagnostics()` → sin line markers ✗
4. `compileDiagnostics` vacío (build exitoso) → renderer no genera markup inline ✗

### Plan de corrección sugerido

1. **En Preview.js**: promover `console.error()` de nivel 'error' con `kind: 'console'`
   a runtime diagnostic cuando el framework es React o Vue. Opcionalmente,
   hacer esto para TODOS los `console.error()` que parezcan errores de framework
   (detectar patterns como "React error", "Uncaught", "TypeError", etc.).

2. **En el bridge** (`exampleRenderer.js:230-250`): cuando `console.error()` se
   intercepta, si el mensaje parece un error no trivial (no un warning de dev),
   emitir un `postMessage` adicional con `kind: 'runtime-error'` para que el
   listener del padre lo registre como diagnóstico visual.

3. **Alternativa más simple**: en Preview.js, cuando se recibe un entry de consola
   con `level: 'error'` y `kind: 'console'`, también llamar a
   `_registerRuntimeDiagnostic()` con los datos disponibles. Esto unificaría
   el flujo sin necesidad de cambiar el bridge.

4. **Para líneas**: asegurarse de que los stack traces de `console.error()` de framework
   se parseen correctamente y que `_findFileForDiagnostic()` pueda resolver
   los paths del bundle a los archivos del document model.

### Archivos a modificar

| Prioridad | Archivo | Cambio |
|-----------|---------|--------|
| P0 | `src/components/Preview.js:737-761` | Promover `console.error()` a runtime diagnostic |
| P1 | `src/utils/exampleRenderer.js:230-250` | Opcionalmente emitir `runtime-error` desde el bridge para `console.error()` graves |
| P2 | `src/utils/exampleCompiler.js:513-515` | Incluir `appDiagnostics` en return de React success path |
| P2 | `src/utils/exampleCompiler.js:1183-1184` | Revisar filtro de Vue success path |
| P3 | `src/components/Editor.js:5160-5214` | Verificar resolución de paths de runtime para React/Vue bundles |
