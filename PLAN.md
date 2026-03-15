# Plan: Code Embed en Theory — `[[exercise:file.md-]]`

## Contexto

Theory documents (`main.md`) ya soportan `[[exercise:ta.md]]` que renderiza un embed
interactivo con preview iframe, estrellas, descripcion y botones. Este plan implementa
una **segunda variante** con sintaxis `[[exercise:ta.md-]]` que muestra el **codigo fuente**
del ejemplo con syntax highlighting y tabs para navegar archivos.

### Tres variantes de sintaxis

| Shortcode | Comportamiento |
|-----------|---------------|
| `[[exercise:ta.md-]]` | Todos los archivos del ejemplo, en tabs |
| `[[exercise:ta.md-App.vue]]` | Solo `App.vue`, sin tabs |
| `[[exercise:ta.md-(App.vue\|main.ts)]]` | Solo esos archivos, en ese orden, en tabs |

### Dos contextos de renderizado

1. **Iframe** — preview de theory en el editor (`renderTheoryPreviewDocument` en `theoryRenderer.js`)
2. **DOM directo** — theory viewer del hamburger menu (`TheoryViewer.js` usa `renderTheoryHtml`)

Ambos usan la misma funcion `injectTheoryExerciseEmbeds` para reemplazar shortcodes por HTML.

### Modelo de datos del ejemplo

`parseExampleDocument(content)` retorna un document model con:
```javascript
{
  files: [
    {
      id: 'src/main.ts:0',
      path: 'src/main.ts',         // ruta completa
      name: 'main.ts',             // solo nombre
      language: 'typescript',       // typescript, vue, scss, etc.
      content: 'import ...',        // codigo fuente
      role: 'entry',               // entry, app, component, style, etc.
      // ... otros campos
    },
    // ...
  ],
  metadata: { framework: 'vue', mode: 'multi-file', ... },
}
```

### hljs y lenguajes

`highlightCode(code, lang)` en `theoryRenderer.js` usa hljs con estos lenguajes registrados:
`xml/html/svg`, `css/scss`, `javascript/jsx`, `typescript/tsx`, `json`, `glsl`, `bash`, `markdown`.

**Vue NO esta registrado**. Para archivos `.vue`, hay que usar `xml` como lenguaje de highlight
(los SFC son estructuralmente XML). El plan incluye un mapeo `vue → xml` en la funcion de rendering.

---

## Paso 1 — Parsing del shortcode (theoryExerciseEmbeds.js)

### Que hacer

1. **No cambiar el regex** `THEORY_EXERCISE_SHORTCODE_PATTERN`. El regex actual
   `^[ \t]*\[\[exercise:([^\]\n]+)\]\][ \t]*$` ya captura todo entre `exercise:` y `]]`.
   Para `[[exercise:ta.md-]]` captura `ta.md-`. Para `[[exercise:ta.md-(App.vue|main.ts)]]`
   captura `ta.md-(App.vue|main.ts)`. Solo necesitamos parsear el grupo capturado.

2. **Crear `parseExerciseShortcode(raw)`** que reciba el contenido capturado y retorne:

```javascript
// [[exercise:ta.md]] → embed estandar
{ filename: 'ta.md', codeEmbed: false, codeFilter: null }

// [[exercise:ta.md-]] → code embed, todos los archivos
{ filename: 'ta.md', codeEmbed: true, codeFilter: null }

// [[exercise:ta.md-App.vue]] → code embed, un archivo
{ filename: 'ta.md', codeEmbed: true, codeFilter: ['App.vue'] }

// [[exercise:ta.md-(App.vue|main.ts)]] → code embed, multiples archivos
{ filename: 'ta.md', codeEmbed: true, codeFilter: ['App.vue', 'main.ts'] }
```

Logica de parsing:
- Si `raw` contiene un `.md` seguido de `-`, es code embed.
- Encontrar la posicion del ultimo `.md` seguido de `-`.
- Despues del `-`:
  - Vacio → `codeFilter: null` (todos los archivos)
  - `(A|B|C)` → split por `|`, trim cada uno → `codeFilter: ['A', 'B', 'C']`
  - Cualquier otra cosa → `codeFilter: [valor]` (un solo archivo)
- El filename es todo lo que esta ANTES del `-` (incluyendo el `.md`).

3. **Actualizar `extractTheoryExerciseReferences`** para que extraiga el filename base
   (sin el sufijo `-...`). Usar `parseExerciseShortcode` internamente. Debe seguir
   deduplicando filenames (si `ta.md` aparece como embed estandar Y como code embed,
   solo se retorna una vez).

### Archivos a modificar

- `src/utils/theoryExerciseEmbeds.js`

### Validacion

- `npm run build` (no hay tests existentes en el proyecto)

---

## Paso 2 — Datos de codeFiles en el embed (theoryExerciseEmbeds.js)

### Que hacer

1. **Extender `loadTheoryExerciseEmbeds`**: el fetch y `parseExampleDocument` ya ocurren.
   Agregar un campo `codeFiles` al objeto embed retornado:

```javascript
return [filename, {
    // ... campos existentes (description, exists, filename, importance, etc.)
    codeFiles: documentModel.files.map((file) => ({
        path: file.path,
        name: file.name,
        language: file.language,
        content: file.content,
    })),
}];
```

2. **Optimizacion**: `codeFiles` debe poblarse SIEMPRE que el ejemplo exista
   (el overhead es minimo — solo copiar datos que ya estan en memoria). No vale la pena
   rastrear cuales filenames tienen variante code porque el mismo embed map se reutiliza
   para ambas variantes.

3. **En el catch** (ejemplo no encontrado), `codeFiles` es `[]`.

### Archivos a modificar

- `src/utils/theoryExerciseEmbeds.js` (solo `loadTheoryExerciseEmbeds`)

### Validacion

- `npm run build`

---

## Paso 3 — Exportar highlightCode (theoryRenderer.js)

### Que hacer

1. Cambiar `function highlightCode(code, lang)` a `export function highlightCode(code, lang)`.

Eso es todo. La funcion ya existe y funciona. Solo necesita ser exportable para que
`theoryExerciseEmbeds.js` la use en el paso 4.

### Archivos a modificar

- `src/utils/theoryRenderer.js` (linea 47: agregar `export` keyword)

### Validacion

- `npm run build`

---

## Paso 4 — Renderizado HTML del code embed (theoryExerciseEmbeds.js)

### Que hacer

1. **Crear mapeo de lenguaje para hljs**. Agregar una funcion helper:

```javascript
function getHighlightLanguage(language) {
    if (language === 'vue') return 'xml';
    return language || '';
}
```

2. **Crear `renderTheoryCodeEmbedMarkup(embed, codeFilter)`**:

   - Recibir el embed (con `codeFiles`) y `codeFilter` (null o string[]).
   - Filtrar archivos segun `codeFilter`:
     - `null` → todos los archivos, en orden original.
     - `['App.vue']` → solo ese archivo (match por `file.name` o sufijo de `file.path`).
     - `['App.vue', 'main.ts']` → esos archivos en ese orden.
   - Si no hay archivos visibles despues del filtro → renderizar mensaje de error.
   - Importar `highlightCode` desde `theoryRenderer.js`.
   - Aplicar `highlightCode(file.content, getHighlightLanguage(file.language))` a cada archivo.

3. **HTML generado — un solo archivo** (sin tabs):

```html
<div class="theory-code-embed is-single" data-theory-code-file="ta.md">
  <div class="theory-code-embed-file-header">
    <span class="theory-code-embed-file-name">App.vue</span>
    <span class="theory-code-embed-file-lang">vue</span>
  </div>
  <pre><code class="hljs language-xml">[highlighted code]</code></pre>
</div>
```

4. **HTML generado — multiples archivos** (con tabs):

```html
<div class="theory-code-embed" data-theory-code-file="ta.md">
  <div class="theory-code-embed-tabs">
    <button type="button" class="theory-code-embed-tab is-active" data-code-tab="0">main.ts</button>
    <button type="button" class="theory-code-embed-tab" data-code-tab="1">App.vue</button>
    <button type="button" class="theory-code-embed-tab" data-code-tab="2">styles.scss</button>
  </div>
  <div class="theory-code-embed-panel is-active" data-code-panel="0">
    <pre><code class="hljs language-typescript">[highlighted]</code></pre>
  </div>
  <div class="theory-code-embed-panel" data-code-panel="1">
    <pre><code class="hljs language-xml">[highlighted]</code></pre>
  </div>
  <div class="theory-code-embed-panel" data-code-panel="2">
    <pre><code class="hljs language-scss">[highlighted]</code></pre>
  </div>
</div>
```

5. **Actualizar `injectTheoryExerciseEmbeds`**: usar `parseExerciseShortcode` en el callback
   del replace. Si `codeEmbed` es true, llamar a `renderTheoryCodeEmbedMarkup`. Si no,
   llamar al existente `renderTheoryExerciseEmbedMarkup`.

```javascript
return source.replace(THEORY_EXERCISE_SHORTCODE_PATTERN, (_match, rawContent) => {
    const parsed = parseExerciseShortcode(rawContent);
    const embed = embedMap[parsed.filename] || { /* fallback missing */ };

    if (parsed.codeEmbed) {
        return renderTheoryCodeEmbedMarkup(embed, parsed.codeFilter);
    }

    return renderTheoryExerciseEmbedMarkup(embed);
});
```

### Archivos a modificar

- `src/utils/theoryExerciseEmbeds.js` (agregar import de `highlightCode`, nueva funcion, modificar `injectTheoryExerciseEmbeds`)

### Validacion

- `npm run build`

---

## Paso 5 — CSS para code embed

### Que hacer

Agregar estilos para `.theory-code-embed*` en **dos lugares** (mismos estilos, distinto scope):

1. **`src/utils/theoryRenderer.js`** — dentro del `<style>` del iframe (despues de los estilos
   de `.theory-exercise-embed`, alrededor de linea 397). Selectores SIN prefijo `#theory-content`.

2. **`src/styles/07-theory.css`** — al final del archivo. Selectores CON prefijo `#theory-content`.

### Estilos necesarios

```css
/* Contenedor */
.theory-code-embed {
  margin: 18px 0;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: #111827;
  overflow: hidden;
}

/* Barra de tabs */
.theory-code-embed-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.6);
  overflow-x: auto;
}

/* Tab individual */
.theory-code-embed-tab {
  appearance: none;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #94a3b8;
  padding: 8px 14px;
  font: inherit;
  font-size: 12px;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  cursor: pointer;
  white-space: nowrap;
}

.theory-code-embed-tab:hover {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.08);
}

.theory-code-embed-tab.is-active {
  color: #60a5fa;
  border-bottom-color: #60a5fa;
}

/* Panel de codigo (oculto por defecto) */
.theory-code-embed-panel {
  display: none;
}

.theory-code-embed-panel.is-active {
  display: block;
}

/* Header de archivo (modo single) */
.theory-code-embed-file-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.6);
}

.theory-code-embed-file-name {
  font-size: 12px;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  color: #e2e8f0;
}

.theory-code-embed-file-lang {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Pre/code dentro del embed — sin margin extra */
.theory-code-embed pre {
  margin: 0;
  border: none;
  border-radius: 0;
  padding: 14px 16px;
  background: transparent;
}

.theory-code-embed pre code {
  font-size: 13px;
  line-height: 1.6;
}
```

Para `07-theory.css`, prefijar cada selector con `#theory-content`:
```css
#theory-content .theory-code-embed { ... }
#theory-content .theory-code-embed-tabs { ... }
/* etc. */
```

### Archivos a modificar

- `src/utils/theoryRenderer.js` (agregar CSS inline al `<style>` del iframe)
- `src/styles/07-theory.css` (agregar CSS al final)

### Validacion

- `npm run build`

---

## Paso 6 — Hidratacion interactiva de tabs

### Que hacer

Agregar JavaScript para el switching de tabs (click en tab → mostrar panel correspondiente,
ocultar los demas).

1. **Iframe** (`renderTheoryPreviewDocument` en `theoryRenderer.js`):
   Extender el `<script>` inline existente (alrededor de linea 416). Agregar DESPUES
   del bloque de exercise embed handlers (despues de la linea del `keydown` listener,
   antes del cierre `})();`):

```javascript
// Code embed tab switching
document.addEventListener('click', function(event) {
    var tab = event.target.closest('.theory-code-embed-tab');
    if (!tab) return;
    var embed = tab.closest('.theory-code-embed');
    if (!embed) return;
    var index = tab.getAttribute('data-code-tab');
    embed.querySelectorAll('.theory-code-embed-tab').forEach(function(t) {
        t.classList.toggle('is-active', t.getAttribute('data-code-tab') === index);
    });
    embed.querySelectorAll('.theory-code-embed-panel').forEach(function(p) {
        p.classList.toggle('is-active', p.getAttribute('data-code-panel') === index);
    });
});
```

   **Nota**: este listener es un segundo `document.addEventListener('click', ...)`. El existente
   maneja exercise embeds (open/preview buttons + card clicks). Este nuevo es independiente y
   puede coexistir. NO mezclar con el listener existente — agregar uno separado.

2. **Theory viewer** (`TheoryViewer.js`):
   Agregar un metodo `_hydrateCodeEmbedTabs()` y llamarlo al final de `renderContent()`
   (despues de `_hydrateExercisePreviewSlots`):

```javascript
_hydrateCodeEmbedTabs() {
    if (!this.container) return;
    this.container.querySelectorAll('.theory-code-embed').forEach((embed) => {
        embed.addEventListener('click', (event) => {
            const tab = event.target.closest('.theory-code-embed-tab');
            if (!tab) return;
            const index = tab.getAttribute('data-code-tab');
            embed.querySelectorAll('.theory-code-embed-tab').forEach((t) => {
                t.classList.toggle('is-active', t.getAttribute('data-code-tab') === index);
            });
            embed.querySelectorAll('.theory-code-embed-panel').forEach((p) => {
                p.classList.toggle('is-active', p.getAttribute('data-code-panel') === index);
            });
        });
    });
}
```

   En `renderContent()`, agregar la llamada:
```javascript
this._hydrateExercisePreviewSlots(exerciseEmbeds);
this._hydrateCodeEmbedTabs();  // <-- nueva linea
```

### Archivos a modificar

- `src/utils/theoryRenderer.js` (agregar click handler al script inline del iframe)
- `src/components/TheoryViewer.js` (agregar metodo + llamada)

### Validacion

- `npm run build`

---

## Paso 7 — Integracion en el dialogo Embed (theoryEditor.js)

### Que hacer

Actualizar el dialogo de "Insert Exercise Embed" para ofrecer la opcion de insertar code embed.

1. **Modificar cada card** en `_openExerciseEmbedDialog()`: agregar un segundo boton
   debajo de cada card (o junto al existente) que copie `[[exercise:filename-]]` en vez
   de `[[exercise:filename]]`.

   Cambiar la estructura de cada card. Actualmente cada card es un `<button>` que al click
   copia `[[exercise:filename]]`. Cambiar a un contenedor con dos botones:

```javascript
// Reemplazar el card <button> por un <div> con dos botones
const card = document.createElement('div');
card.className = 'exercise-embed-card';

// ... preview y footer existentes ...

const actions = document.createElement('div');
actions.className = 'exercise-embed-card-actions';

const btnEmbed = document.createElement('button');
btnEmbed.type = 'button';
btnEmbed.className = 'exercise-embed-card-action';
btnEmbed.textContent = 'Embed';
btnEmbed.title = `Copy [[exercise:${filename}]]`;
btnEmbed.addEventListener('click', () => {
    const tag = `[[exercise:${filename}]]`;
    navigator.clipboard.writeText(tag).then(() => {
        this._showToast(`Copied: ${tag}`, 'success');
    }).catch(() => {
        this._showToast(`Tag: ${tag}`, 'success');
    });
    this.exerciseEmbedDialog.close();
});

const btnCode = document.createElement('button');
btnCode.type = 'button';
btnCode.className = 'exercise-embed-card-action is-code';
btnCode.textContent = 'Code';
btnCode.title = `Copy [[exercise:${filename}-]]`;
btnCode.addEventListener('click', () => {
    const tag = `[[exercise:${filename}-]]`;
    navigator.clipboard.writeText(tag).then(() => {
        this._showToast(`Copied: ${tag}`, 'success');
    }).catch(() => {
        this._showToast(`Tag: ${tag}`, 'success');
    });
    this.exerciseEmbedDialog.close();
});

actions.appendChild(btnEmbed);
actions.appendChild(btnCode);
card.appendChild(actions);
```

2. **CSS para los botones** en `src/styles/06-dialogs.css`:

```css
.exercise-embed-card-actions {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  border-top: 1px solid var(--border-subtle, rgba(148, 163, 184, 0.12));
}

.exercise-embed-card-action {
  flex: 1;
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  padding: 4px 8px;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(30, 64, 175, 0.18);
  color: #dbeafe;
}

.exercise-embed-card-action:hover {
  background: rgba(30, 64, 175, 0.32);
}

.exercise-embed-card-action.is-code {
  background: rgba(15, 23, 42, 0.52);
  color: #e5e7eb;
  border-color: rgba(148, 163, 184, 0.18);
}

.exercise-embed-card-action.is-code:hover {
  background: rgba(15, 23, 42, 0.72);
}
```

### Archivos a modificar

- `src/components/editor/theoryEditor.js` (`_openExerciseEmbedDialog`)
- `src/styles/06-dialogs.css` (agregar estilos al final)

### Validacion

- `npm run build` + verificacion visual manual

---

## Orden de implementacion

Implementar en el orden exacto de los pasos (1 → 7). Cada paso construye sobre el anterior.
Correr `npm run build` despues de cada paso para verificar que no hay errores de compilacion.

## Archivos involucrados (resumen)

| Archivo | Pasos |
|---------|-------|
| `src/utils/theoryExerciseEmbeds.js` | 1, 2, 4 |
| `src/utils/theoryRenderer.js` | 3, 5, 6 |
| `src/styles/07-theory.css` | 5 |
| `src/components/TheoryViewer.js` | 6 |
| `src/components/editor/theoryEditor.js` | 7 |
| `src/styles/06-dialogs.css` | 7 |
