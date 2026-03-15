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
| `src/utils/compiler/reactCompiler.js` | React single-file refactorizado a módulos inline (como Vue); elimina offset +4 |

---

## Code Embed en Theory — `[[exercise:file.md-]]` ✓

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

Implementado. Archivos modificados:

| Archivo | Cambio |
|---------|--------|
| `src/utils/theoryExerciseEmbeds.js` | `parseExerciseShortcode`, `codeFiles` en embed data, `renderTheoryCodeEmbedMarkup`, `injectTheoryExerciseEmbeds` actualizado |
| `src/utils/theoryRenderer.js` | `highlightCode` exportado, CSS inline, tab switching JS |
| `src/styles/07-theory.css` | Estilos `.theory-code-embed*` |
| `src/components/TheoryViewer.js` | `_hydrateCodeEmbedTabs()` |
| `src/components/editor/theoryEditor.js` | Botones Embed/Code en el diálogo |
| `src/styles/06-dialogs.css` | Estilos de los botones de acción |

---

## Resaltado de líneas en el editor

Permite resaltar líneas individuales con colores configurables. Los resaltados son
visibles tanto en el editor como en los code embeds de theory (`[[exercise:file.md-]]`).

### Fase 1 — Configuración de colores y modelo de estado

Estado: `completado` ✓

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

Estado: `completado` ✓

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

Estado: `completado` ✓

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

Estado: `completado` ✓

1. Crear un `WidgetType` de CM6 que renderice un botón `×` pequeño al final de cada línea resaltada.
2. Usar `Decoration.widget` con `side: 1` posicionado al final de la línea.
3. El widget aparece solo cuando el cursor está en esa línea o al hacer hover
   (para no saturar visualmente).
4. Al hacer click en el `×`, despacha `removeLineHighlight` para esa línea.

Archivos: `src/editor/lineHighlightExtension.js`

Validación: `npm run build` + verificación visual

### Fase 5 — Exportar highlights al modelo de code embeds

Estado: `completado` ✓

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
