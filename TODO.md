# TODO

## Bug corregido: línea de error en React/Vue ✓

Resuelto: el bridge ahora decodifica inline source maps (VLQ) para resolver
posiciones del bundle a archivos/líneas originales. Se añadió `sourceURL` al
script compilado para que los line numbers del stack trace sean relativos al
contenido del script (no al HTML). Preview selecciona el primer frame de
código de usuario (ignora node_modules).

| Archivo | Cambio |
|---------|--------|
| `src/utils/renderer/runtimeBridge.js` | VLQ decoder + source map resolver en el bridge |
| `src/utils/renderer/documentRenderer.js` | sourceURL + inyección sin try/catch para compiled code |
| `src/components/Preview.js` | Seleccionar frame de usuario (no framework) |
| `src/components/editor/diagnostics.js` | Fallback genérico para `learncode-inline:` paths |

**Limitación conocida**: en React single-file (stdin mode), las líneas pueden tener
un offset de ~4 debido al wrapper de imports. Multi-file funciona correctamente.

---

## Code Embed en Theory — `[[exercise:file.md-]]`

Nueva variante de embed para theory (`main.md`) que muestra el **código fuente** de un ejemplo
en vez de su preview ejecutado. Tres sintaxis:

| Sintaxis | Resultado |
|----------|-----------|
| `[[exercise:ta.md-]]` | Tabs con **todos** los archivos del ejemplo |
| `[[exercise:ta.md-App.vue]]` | Solo el código de `App.vue`, sin tabs |
| `[[exercise:ta.md-(App.vue\|main.ts)]]` | Tabs con solo `App.vue` y `main.ts`, en ese orden |

Diferencias con el embed estándar (`[[exercise:ta.md]]`):
- No muestra preview iframe, estrellas, descripción ni botones de acción.
- Muestra bloques de código con syntax highlighting (highlight.js).
- Usa tabs para navegar entre archivos (cuando hay más de uno).

### Fase 1 — Parsing del nuevo shortcode

Estado: `pendiente`

Extender `theoryExerciseEmbeds.js`:

1. Ampliar `THEORY_EXERCISE_SHORTCODE_PATTERN` (o añadir un segundo regex) para capturar:
   - `[[exercise:file.md-]]` → `filename=file.md`, `mode=all-files`, `filter=null`
   - `[[exercise:file.md-Name.ext]]` → `filename=file.md`, `mode=single-file`, `filter=["Name.ext"]`
   - `[[exercise:file.md-(A.ext|B.ext)]]` → `filename=file.md`, `mode=multi-file`, `filter=["A.ext","B.ext"]`
2. Actualizar `extractTheoryExerciseReferences()` para que también detecte las variantes con `-`.
   Debe seguir retornando los filenames únicos de los `.md` referenciados (sin duplicar si
   `ta.md` aparece como embed estándar y como code embed al mismo tiempo).
3. Crear una función `parseExerciseShortcode(raw)` que, dado el contenido entre `[[exercise:` y `]]`,
   retorne `{ filename, codeEmbed: true|false, codeFilter: null|string[] }`.

Archivos: `src/utils/theoryExerciseEmbeds.js`

Validación: `npm test` (añadir tests para las 3 variantes + el embed estándar existente)

### Fase 2 — Datos de code embed

Estado: `pendiente`

Extender `loadTheoryExerciseEmbeds()`:

1. Para cada filename referenciado, el fetch ya se hace. No hay que duplicar llamadas.
   Lo que cambia es que el objeto retornado necesita incluir los archivos parseados del ejemplo.
2. Añadir al objeto de embed un campo `codeFiles`:
   ```javascript
   codeFiles: [
     { name: "src/main.ts", language: "typescript", content: "import ..." },
     { name: "src/App.vue", language: "vue", content: "<template>..." },
     ...
   ]
   ```
   Estos se extraen de `parseExampleDocument(data.content).files`.
3. Los datos de code-files se necesitan **solo** si hay al menos un code embed para ese filename.
   Optimizar: rastrear cuáles filenames tienen variante code y cuáles no, y solo poblar
   `codeFiles` cuando sea necesario (evitar overhead para embeds estándar que no usan el código).

Archivos: `src/utils/theoryExerciseEmbeds.js`

Validación: `npm test`

### Fase 3 — Renderizado HTML del code embed

Estado: `pendiente`

Crear la función `renderTheoryCodeEmbedMarkup(embed, codeFilter)` en `theoryExerciseEmbeds.js`:

1. Recibir el embed (con `codeFiles`) y el `codeFilter` (null = todos, array = filtrar/ordenar).
2. Filtrar y ordenar los archivos según `codeFilter`:
   - `null` → todos los archivos visibles, en orden original.
   - `["App.vue"]` → solo ese archivo (match por nombre base, sin `src/`).
   - `["App.vue", "main.ts"]` → esos archivos en ese orden.
3. Generar HTML:
   - Si hay **1 solo archivo**: bloque `<pre><code>` con la clase hljs y el nombre como header.
   - Si hay **varios archivos**: barra de tabs + paneles de código, el primer tab activo.
   - Aplicar `highlightCode(content, language)` de `theoryRenderer.js` para colorear.
4. Actualizar `injectTheoryExerciseEmbeds()` para usar `parseExerciseShortcode()` y llamar
   a la función de renderizado correcta según si es code embed o embed estándar.

Estructura HTML generada (multi-tab):
```html
<div class="theory-code-embed" data-theory-code-file="ta.md">
  <div class="theory-code-embed-tabs">
    <button class="theory-code-embed-tab is-active" data-tab="0">App.vue</button>
    <button class="theory-code-embed-tab" data-tab="1">main.ts</button>
  </div>
  <div class="theory-code-embed-panel is-active" data-tab="0">
    <pre><code class="hljs language-vue">...</code></pre>
  </div>
  <div class="theory-code-embed-panel" data-tab="1">
    <pre><code class="hljs language-typescript">...</code></pre>
  </div>
</div>
```

Estructura HTML (single file, sin tabs):
```html
<div class="theory-code-embed is-single" data-theory-code-file="ta.md">
  <div class="theory-code-embed-file-header">App.vue</div>
  <pre><code class="hljs language-vue">...</code></pre>
</div>
```

Archivos: `src/utils/theoryExerciseEmbeds.js`, `src/utils/theoryRenderer.js` (exportar `highlightCode`)

Validación: `npm test`

### Fase 4 — CSS para code embed

Estado: `pendiente`

Añadir estilos para las clases `.theory-code-embed*` en dos lugares:

1. `src/utils/theoryRenderer.js` — estilos inline del iframe (modo edición de theory).
2. `src/styles/07-theory.css` — estilos del DOM principal (theory viewer hamburguesa).

Estilos necesarios:
- `.theory-code-embed` — contenedor con borde, border-radius, fondo oscuro, margin vertical.
- `.theory-code-embed-tabs` — barra de tabs horizontal con gap, border-bottom.
- `.theory-code-embed-tab` — botón de tab con estado activo (borde inferior coloreado).
- `.theory-code-embed-panel` — oculto por defecto, visible cuando `.is-active`.
- `.theory-code-embed-file-header` — nombre de archivo en modo single (font mono, color sutil).
- `pre` y `code` dentro del embed — sin margin extra, overflow-x auto.

Archivos: `src/utils/theoryRenderer.js`, `src/styles/07-theory.css`

Validación: `npm run build`

### Fase 5 — Hidratación interactiva (tabs)

Estado: `pendiente`

Añadir lógica JavaScript para el switching de tabs en ambas rutas de renderizado:

1. **Iframe** (`renderTheoryPreviewDocument` en `theoryRenderer.js`):
   Extender el `<script>` inline para que escuche clicks en `.theory-code-embed-tab`
   y active/desactive los paneles correspondientes con `.is-active`.

2. **Theory viewer** (`TheoryViewer.js`):
   Añadir un método `_hydrateCodeEmbedTabs()` llamado después de `renderContent()`.
   Attach event listeners de click a los tabs de todos los `.theory-code-embed`.

Archivos: `src/utils/theoryRenderer.js`, `src/components/TheoryViewer.js`

Validación: `npm run build` + verificación visual manual

### Fase 6 — Integración en el diálogo Embed

Estado: `pendiente`

Actualizar el diálogo de "Insert Exercise Embed" (botón Embed en la toolbar de theory):

1. Añadir un selector por tarjeta que permita elegir el modo de inserción:
   - `[[exercise:file.md]]` — embed estándar (preview + meta), ya existente.
   - `[[exercise:file.md-]]` — code embed (todos los archivos).
   - O bien un menú contextual al hacer click en la tarjeta: "Insert embed" vs "Insert code".
2. Si el usuario elige "Insert code", copiar `[[exercise:file.md-]]` al portapapeles.
3. Opcionalmente, mostrar un segundo diálogo o expandir la tarjeta para dejar elegir
   qué archivos incluir (generando la sintaxis `(A|B)` o `single`).
   Esto es un refinamiento; la inserción manual de la sintaxis filtrada también es válida.

Archivos: `src/components/editor/theoryEditor.js`, posiblemente `src/styles/06-dialogs.css`

Validación: `npm run build` + verificación visual manual

### Reglas para cada fase

1. `highlightCode` debe exportarse desde `theoryRenderer.js` para reutilizarse en el markup de code embeds.
2. No duplicar fetch: si `ta.md` aparece como embed estándar y code embed, el fetch solo ocurre una vez.
3. La barra de tabs no se renderiza si solo hay un archivo visible.
4. El match de `codeFilter` se hace por nombre base del archivo (ej. `App.vue` matchea `src/App.vue`).
5. Correr `npm test` después de las fases 1-3. Correr `npm run build` después de las fases 4-6.

---

## Resaltado de líneas en el editor

Permite resaltar líneas individuales con colores configurables. Los resaltados son
visibles tanto en el editor como en los code embeds de theory (`[[exercise:file.md-]]`).

### Fase 1 — Configuración de colores y modelo de estado

Estado: `pendiente`

1. Crear archivo de configuración `src/config/highlightColors.js` que exporte un array de colores:
   ```javascript
   export const HIGHLIGHT_COLORS = [
     { id: 'yellow',  label: 'Yellow',  bg: 'rgba(250, 204, 21, 0.18)', border: 'rgba(250, 204, 21, 0.4)' },
     { id: 'green',   label: 'Green',   bg: 'rgba(74, 222, 128, 0.18)', border: 'rgba(74, 222, 128, 0.4)' },
     { id: 'blue',    label: 'Blue',    bg: 'rgba(96, 165, 250, 0.18)', border: 'rgba(96, 165, 250, 0.4)' },
     { id: 'red',     label: 'Red',     bg: 'rgba(248, 113, 113, 0.18)', border: 'rgba(248, 113, 113, 0.4)' },
     { id: 'purple',  label: 'Purple',  bg: 'rgba(192, 132, 252, 0.18)', border: 'rgba(192, 132, 252, 0.4)' },
     { id: 'orange',  label: 'Orange',  bg: 'rgba(251, 146, 60, 0.18)',  border: 'rgba(251, 146, 60, 0.4)' },
   ];
   ```
2. Definir modelo de estado por archivo en el editor:
   ```javascript
   // Map<fileId, Map<lineNumber, colorId>>
   this.lineHighlights = new Map();
   // Color activo seleccionado
   this.activeHighlightColor = HIGHLIGHT_COLORS[0].id;
   ```
3. Los highlights son **persistentes**: se guardan en el frontmatter del `.md` al hacer
   Modify/Ctrl+S y se restauran al cargar el ejemplo. Solo se eliminan de dos maneras:
   - Editando el contenido de una línea resaltada (auto-eliminación).
   - Usando el botón `×` que aparece al posicionar el cursor en la última columna de la línea.
4. Serialización en frontmatter. Usar una clave `highlights` en el metadata del documento:
   ```yaml
   ---
   highlights: src/App.vue:3:yellow,7:blue||src/main.ts:1:green
   ---
   ```
   Formato: rutas separadas por `||`, cada ruta seguida de pares `línea:color` separados por `,`.
   Funciones necesarias:
   - `serializeHighlights(Map<fileId, Map<line, colorId>>, files)` → string para frontmatter.
   - `parseHighlights(string, files)` → `Map<fileId, Map<line, colorId>>`.
5. Integrar con `buildExampleDocument()` / `parseExampleDocument()`:
   - Al construir: leer `this.lineHighlights` y añadir a `metadata.highlights`.
   - Al parsear: leer `metadata.highlights` y poblar `this.lineHighlights`.

Archivos: `src/config/highlightColors.js` (nuevo), `src/components/Editor.js` (estado),
`src/utils/markdown/core.js` (parse/serialize highlights)

Validación: `npm run build`

### Fase 2 — Extensión de CodeMirror 6 para decoraciones de línea

Estado: `pendiente`

Crear `src/editor/lineHighlightExtension.js`:

1. Implementar un `StateField` de CM6 que almacene el set de líneas resaltadas con sus colores.
2. Implementar un `ViewPlugin` o `Decoration.line` que aplique clases CSS de fondo a cada línea
   resaltada (ej. `.cm-highlight-yellow`, `.cm-highlight-green`, etc.).
3. Definir un `StateEffect` para añadir/eliminar resaltados:
   - `addLineHighlight.of({ line, colorId })` — resalta la línea actual.
   - `removeLineHighlight.of({ line })` — elimina el resaltado de una línea.
   - `clearFileHighlights.of()` — limpia todos los resaltados del archivo.
4. **Auto-eliminación al editar**: usar `Transaction.changes` en el campo de estado para detectar
   cuando el contenido de una línea resaltada cambia. Si un cambio toca una línea con resaltado,
   eliminar ese resaltado automáticamente.
5. Registrar los estilos del tema en la extensión:
   ```javascript
   EditorView.baseTheme({
     '.cm-highlight-yellow': { backgroundColor: 'rgba(250, 204, 21, 0.18)' },
     '.cm-highlight-green':  { backgroundColor: 'rgba(74, 222, 128, 0.18)' },
     // ...
   })
   ```

Archivos: `src/editor/lineHighlightExtension.js` (nuevo)

Validación: `npm test` + `npm run build`

### Fase 3 — UI de botones en el editor

Estado: `pendiente`

Añadir dos botones al header de cada panel/tab:

**En modo cascada** (`_renderPanelsLayout`):
- Insertar después de `pathLabel` y antes de `btnMaximize` en el `panel-header`:
  - Botón **color** (swatch circular con el color activo, click abre dropdown de colores).
  - Botón **aplicar** (click resalta la línea actual del cursor con el color activo).

**En modo tabs** (`_renderTabsLayout`):
- Insertar en `editor-tab-meta`, a la derecha de `pathLabel`:
  - Mismos dos botones que en cascada.

Comportamiento:
- **Botón color**: al hacer click muestra un dropdown/popover con los colores de
  `HIGHLIGHT_COLORS`. Al seleccionar uno, se actualiza `this.activeHighlightColor`
  y el swatch del botón cambia de color.
- **Botón aplicar**: obtiene la línea actual del cursor del editor activo, despacha
  `addLineHighlight` con el color activo. Si la línea ya tiene resaltado, lo elimina (toggle).

Archivos: `src/components/Editor.js`, `src/styles/03-editor.css` o similar

Validación: `npm run build` + verificación visual

### Fase 4 — Botón de borrado inline al final de línea resaltada

Estado: `pendiente`

1. Crear un `WidgetType` de CM6 que renderice un botón `×` pequeño al final de cada línea resaltada.
2. Usar `Decoration.widget` con `side: 1` posicionado al final de la línea.
3. El widget aparece solo cuando el cursor está en esa línea o al hacer hover
   (para no saturar visualmente).
4. Al hacer click en el `×`, despacha `removeLineHighlight` para esa línea.

Archivos: `src/editor/lineHighlightExtension.js`

Validación: `npm run build` + verificación visual

### Fase 5 — Exportar highlights al modelo de code embeds

Estado: `pendiente`

Conectar los highlights del editor con el sistema de code embeds de theory:

1. Cuando se renderiza un code embed (`[[exercise:file.md-]]`), extraer los highlights
   activos de cada archivo del editor (si están disponibles).
2. Añadir un campo `highlights` al modelo de `codeFiles`:
   ```javascript
   codeFiles: [
     {
       name: "src/App.vue",
       language: "vue",
       content: "...",
       highlights: [{ line: 3, colorId: 'yellow' }, { line: 7, colorId: 'blue' }]
     }
   ]
   ```
3. En `renderTheoryCodeEmbedMarkup()` (fase 3 de Code Embed), al generar el `<pre><code>`,
   envolver las líneas resaltadas en `<span>` con clase de color:
   ```html
   <span class="code-embed-highlight-yellow">  const x = 1;</span>
   ```
4. Añadir los estilos de highlight correspondientes tanto en el CSS inline del iframe
   (`theoryRenderer.js`) como en `07-theory.css`.

**Nota**: Esta fase depende de que las fases 1-3 de Code Embed estén completadas.

Archivos: `src/utils/theoryExerciseEmbeds.js`, `src/utils/theoryRenderer.js`,
`src/styles/07-theory.css`, `src/components/Editor.js` (bridge de datos)

Validación: `npm run build` + verificación visual

### Reglas para cada fase

1. Los highlights se persisten en el frontmatter del `.md` al guardar (Modify/Ctrl+S). Se restauran al cargar el ejemplo. Solo se eliminan al editar la línea o con el botón `×`.
2. La auto-eliminación es por línea: si se edita una línea resaltada, solo esa pierde su resaltado.
3. Los botones de color y aplicar solo aparecen cuando hay un documento cargado (no en estado vacío).
4. Los colores deben contrastar bien con el tema One Dark del editor, usando fondos con baja opacidad.
5. El botón `×` inline no debe interferir con la edición — debe estar fuera del flujo del texto.
6. Correr `npm run build` después de cada fase. Fase 2 también `npm test`.
