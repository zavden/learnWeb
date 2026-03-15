# Mejoras de escalabilidad y desarrollo futuro

Recomendaciones organizadas por prioridad y esfuerzo. El objetivo es que la app sea mas
facil de mantener, extender, depurar y escalar a medida que crece.

---

## 1. Code-splitting y optimizacion del bundle

### Problema

El build genera un unico chunk JS de ~1.3MB. Vite advierte `Some chunks are larger than 500 kB`.
Todo se carga en el primer paint aunque el usuario no necesite todas las funcionalidades.

### Acciones

1. **Configurar `manualChunks` en `vite.config.js`** para separar dependencias pesadas:

```javascript
// vite.config.js
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    codemirror: [
                        '@codemirror/state',
                        '@codemirror/view',
                        '@codemirror/lang-html',
                        '@codemirror/lang-css',
                        '@codemirror/lang-javascript',
                        // ... demas paquetes de codemirror
                    ],
                    highlightjs: ['highlight.js'],
                    markdown: ['marked'],
                },
            },
        },
    },
});
```

2. **Lazy import de subsistemas pesados**: los compiladores de framework (Vue, React, esbuild)
   solo se necesitan cuando el usuario abre un ejemplo de ese tipo. Convertir a `import()` dinamico:

```javascript
// En vez de: import { compileVue } from './compiler/vue.js';
// Usar:
async function compileVue(doc) {
    const { compileVue } = await import('./compiler/vue.js');
    return compileVue(doc);
}
```

3. **Carga on-demand de lenguajes hljs**: registrar solo html/css/js por defecto, cargar
   typescript/vue/scss/glsl cuando se necesiten.

4. **Analisis de bundle**: agregar `rollup-plugin-visualizer` para ver que ocupa espacio:

```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
    plugins: [visualizer({ open: true })],
});
```

### Archivos a modificar

- `vite.config.js`
- `src/utils/compileClient.js` (lazy imports)
- `src/utils/theoryRenderer.js` (hljs on-demand)

---

## 2. Descomposicion de main.js (god object)

### Problema

`main.js` es una unica clase `App` de ~1400 lineas que maneja:
- 80+ referencias DOM
- Estado de layout, sesion, preferencias, favoritos, pending
- Inicializacion de todos los componentes
- Resize handlers, shortcuts, zoom, viewport

Cualquier cambio requiere leer y entender todo el archivo.

### Acciones

Extraer en managers independientes que `App` solo coordina:

```
src/
├── managers/
│   ├── LayoutManager.js       // sidebar resize, workspace resize, console resize
│   ├── SessionManager.js      // save/restore session, localStorage
│   ├── PreviewManager.js      // zoom, viewport, width mode
│   └── FavoritesManager.js    // favorites + pending (ya comparten patron)
```

Ejemplo de extraccion:

```javascript
// src/managers/LayoutManager.js
export class LayoutManager {
    constructor({ appShell, sidebarElement, workspaceElement, ... }) { ... }
    initSidebarControls() { ... }
    initWorkspaceResizer() { ... }
    initConsoleResizer() { ... }
    resetLayout() { ... }
}

// main.js - queda limpio
this.layout = new LayoutManager({ ... });
this.session = new SessionManager({ ... });
```

### Criterio de separacion

| Manager | Lineas actuales | Responsabilidad |
|---------|----------------|-----------------|
| `LayoutManager` | ~300 | Resize de sidebar, workspace, consola |
| `SessionManager` | ~150 | Lectura/escritura de sesion en localStorage |
| `PreviewManager` | ~200 | Zoom, viewport width, slider controls |
| `FavoritesManager` | ~200 | Favorites + Pending (CRUD, sync, dialogs) |

### Archivos a crear

- `src/managers/LayoutManager.js`
- `src/managers/SessionManager.js`
- `src/managers/PreviewManager.js`
- `src/managers/FavoritesManager.js`

### Archivos a modificar

- `src/main.js` (reducir a ~400 lineas de coordinacion)

---

## 3. Reemplazar mixins por composicion

### Problema

El Editor usa 8 mixins que se mezclan via `Object.assign(Editor.prototype, mixin)`.
Cada mixin accede a `this` del Editor, comparte estado implicitamente, y no se puede
testear de forma independiente. Agregar un campo nuevo requiere verificar que no colisione
con los otros 7 mixins.

### Mixins actuales del Editor

| Mixin | Lineas | Responsabilidad |
|-------|--------|-----------------|
| `fileOperationsMixin` | 863 | CRUD de archivos, save, modify, rename |
| `metadataDialogsMixin` | 983 | Dialogos de metadata editorial |
| `sessionManagerMixin` | ~200 | Estado de sesion del editor |
| `exercisePanelMixin` | ~300 | Logica de ejercicios |
| `theoryEditorMixin` | ~200 | Edicion de teoria |
| `diagnosticsMixin` | ~150 | Compile/runtime diagnostics |
| `shaderDialogsMixin` | ~400 | Dialogos de shaders |
| `lineHighlightsMixin` | ~150 | Highlight de lineas |

### Acciones

Convertir cada mixin en un **service class** que recibe las dependencias que necesita
en vez de acceder a `this` del Editor:

```javascript
// Antes (mixin):
export const fileOperationsMixin = {
    async _handleSave() {
        if (!this.currentTopicPath) return;  // accede a this del Editor
        const content = buildExampleDocument(this.currentDocument);
        await saveExample(this.currentTopicPath, content);
        this._showToast('Saved', 'success');
    },
};

// Despues (service):
export class FileService {
    constructor(editor) {
        this.editor = editor;
    }

    async handleSave() {
        if (!this.editor.currentTopicPath) return;
        const content = buildExampleDocument(this.editor.currentDocument);
        await saveExample(this.editor.currentTopicPath, content);
        this.editor.showToast('Saved', 'success');
    }
}

// En Editor:
this.fileService = new FileService(this);
```

Beneficios: cada service se puede testear con un mock del editor, las dependencias
son explicitas, no hay colision de nombres.

### Archivos a crear/modificar

- Renombrar `src/components/editor/*.js` de mixins a services
- `src/components/Editor.js` (instanciar services en vez de mezclar mixins)

---

## 4. Server: I/O asincrono y validacion

### Problema

`server.js` usa `fs.readFileSync`/`fs.writeFileSync` en todos los endpoints. Con multiples
usuarios concurrentes, cada peticion bloquea el event loop mientras lee/escribe disco.
Tambien faltan validaciones de path que podrian permitir directory traversal.

### Acciones

1. **Convertir a async I/O**:

```javascript
// Antes:
const content = fs.readFileSync(filePath, 'utf-8');

// Despues:
import { promises as fsp } from 'fs';
const content = await fsp.readFile(filePath, 'utf-8');
```

Aplicar en: `server.js`, `favoritesStore.js`, `pendingStore.js`, `editorDefaults.js`, `materialTree.js`.

2. **Validacion de paths** — crear un helper:

```javascript
function safePath(base, ...segments) {
    const resolved = path.resolve(base, ...segments);
    if (!resolved.startsWith(path.resolve(base))) {
        throw new Error('Path traversal detected');
    }
    return resolved;
}
```

3. **Middleware de errores** centralizado:

```javascript
app.use((err, req, res, next) => {
    console.error(`[${req.method}] ${req.path}:`, err.message);
    res.status(err.status || 500).json({ error: err.message });
});
```

4. **Compresion gzip**:

```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

5. **Cache del arbol de material**: el arbol cambia raramente, cachearlo 60 segundos:

```javascript
let treeCache = null;
let treeCacheExpiry = 0;

function getCachedTree(options) {
    if (treeCache && Date.now() < treeCacheExpiry) return treeCache;
    treeCache = buildMaterialTree(MATERIAL_DIR, options);
    treeCacheExpiry = Date.now() + 60_000;
    return treeCache;
}
```

### Archivos a modificar

- `server.js`
- `src/utils/favoritesStore.js`
- `src/utils/pendingStore.js`
- `src/utils/editorDefaults.js`
- `src/utils/materialTree.js`

---

## 5. Testing

### Estado actual

- 19 archivos de test para utilidades (buen coverage de markdown, validators, renderers)
- 0 tests para componentes, server, o integracion

### Acciones

1. **Tests de API del servidor** — verificar que cada endpoint responde correctamente:

```javascript
// test/server.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('GET /api/tree', () => {
    it('returns array of chapters', async () => {
        const res = await fetch('http://localhost:3001/api/tree');
        assert.strictEqual(res.status, 200);
        const tree = await res.json();
        assert(Array.isArray(tree));
    });
});
```

2. **Tests de los stores** — `favoritesStore.js`, `pendingStore.js`:

```javascript
// test/pendingStore.test.js
describe('addPending', () => {
    it('adds valid example path', () => { ... });
    it('rejects invalid path', () => { ... });
    it('deduplicates', () => { ... });
});
```

3. **Tests de componentes** (futuro) — considerar Vitest + happy-dom para testear
   Gallery, Editor, Sidebar con DOM simulado.

4. **CI con GitHub Actions**:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm install
      - run: npm test
      - run: npx vite build
```

### Archivos a crear

- `test/server.test.js`
- `test/pendingStore.test.js`
- `.github/workflows/test.yml`

---

## 6. Linting y formateo

### Problema

No hay ESLint ni Prettier configurados. El estilo del codigo es consistente por convencion
pero no hay enforcement automatico. Cualquier colaborador podria introducir inconsistencias.

### Acciones

```bash
npm install -D eslint prettier eslint-config-prettier
```

```javascript
// eslint.config.js (flat config)
export default [
    {
        files: ['**/*.js'],
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'error',
        },
    },
];
```

```json
// .prettierrc
{
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "all",
    "printWidth": 120
}
```

Agregar scripts:

```json
{
    "scripts": {
        "lint": "eslint src/",
        "format": "prettier --write src/"
    }
}
```

### Archivos a crear

- `eslint.config.js`
- `.prettierrc`

### Archivos a modificar

- `package.json` (scripts)

---

## 7. Type safety con JSDoc

### Problema

No hay tipos definidos. Las funciones aceptan objetos complejos (`documentModel`, `embedMap`,
`sessionState`) sin documentar su forma. Esto hace dificil saber que campos existen
sin leer la implementacion.

### Acciones

No migrar a TypeScript (seria muy disruptivo), pero agregar **JSDoc typedefs** para los
modelos de datos principales:

```javascript
// src/types.js (archivo de definiciones)

/**
 * @typedef {Object} DocumentFile
 * @property {string} id
 * @property {string} path
 * @property {string} name
 * @property {string} language
 * @property {string} content
 * @property {string} [role]
 */

/**
 * @typedef {Object} ExampleDocument
 * @property {DocumentFile[]} files
 * @property {Object} metadata
 * @property {string} [sourceFormat]
 * @property {Array} [blocks]
 * @property {Array} [diagnostics]
 */

/**
 * @typedef {Object} FavoriteEntry
 * @property {boolean} exists
 * @property {string} filename
 * @property {string} path
 * @property {string} topicPath
 */

/**
 * @typedef {Object} SessionState
 * @property {number} version
 * @property {string} topicPath
 * @property {string} documentFilename
 * @property {string} documentTarget
 * @property {Object} editor
 * @property {Object} preview
 */
```

Luego referenciar con `@param {ExampleDocument} document` en las funciones.

Habilitar `checkJs` en un `jsconfig.json` para que el editor de errores de tipo:

```json
// jsconfig.json
{
    "compilerOptions": {
        "checkJs": true,
        "strict": false,
        "target": "ES2022",
        "module": "ES2022",
        "moduleResolution": "bundler"
    },
    "include": ["src/**/*.js"]
}
```

### Archivos a crear

- `src/types.js`
- `jsconfig.json`

---

## 8. CSS custom properties para theming

### Problema

Los colores estan hardcodeados en cada archivo CSS. Si se quiere cambiar el tema
(o soportar light mode), hay que buscar y reemplazar en 11 archivos.

### Acciones

Definir variables en `01-base.css`:

```css
:root {
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-bg-elevated: #111827;
    --color-border: rgba(148, 163, 184, 0.18);
    --color-border-strong: rgba(148, 163, 184, 0.3);
    --color-text-primary: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-text-muted: #64748b;
    --color-accent: #60a5fa;
    --color-accent-hover: #3b82f6;
    --color-success: #10b981;
    --color-error: #ef4444;
    --color-warning: #f59e0b;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
}
```

Luego reemplazar gradualmente los valores hardcodeados por variables.
No hace falta hacerlo todo de golpe — se puede ir archivo por archivo.

### Archivos a modificar

- `src/styles/01-base.css` (definir variables)
- Todos los demas CSS (gradualmente)

---

## 9. Event bus para comunicacion entre componentes

### Problema

La comunicacion entre componentes es via callbacks pasados en constructores.
El Editor recibe 18 callbacks. Agregar un nuevo evento requiere tocar 3-4 archivos
(componente origen, main.js, componente destino).

### Acciones

Crear un event bus simple:

```javascript
// src/utils/eventBus.js
class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    on(event, callback) {
        if (!this._listeners.has(event)) this._listeners.set(event, []);
        this._listeners.get(event).push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const list = this._listeners.get(event);
        if (!list) return;
        this._listeners.set(event, list.filter((fn) => fn !== callback));
    }

    emit(event, ...args) {
        const list = this._listeners.get(event);
        if (!list) return;
        list.forEach((fn) => fn(...args));
    }
}

export const bus = new EventBus();
```

Uso:

```javascript
// Editor.js — emitir
bus.emit('example:favoriteToggle');

// main.js — escuchar
bus.on('example:favoriteToggle', () => this._toggleCurrentExampleFavorite());
```

No reemplazar todos los callbacks de golpe — empezar por los eventos mas frecuentes
y migrar gradualmente.

### Archivos a crear

- `src/utils/eventBus.js`

---

## 10. Variables de entorno

### Problema

El puerto del servidor (3001) y la URL base de la API (`/api`) estan hardcodeados.
No se puede cambiar sin editar codigo fuente.

### Acciones

1. **Cliente** — usar variables de Vite:

```javascript
// src/utils/api.js
const BASE = import.meta.env.VITE_API_BASE || '/api';
```

2. **Servidor** — usar variables de entorno:

```javascript
// server.js
const PORT = parseInt(process.env.PORT || '3001', 10);
const MATERIAL_DIR = process.env.MATERIAL_DIR || path.join(__dirname, 'material');
```

3. **Archivo `.env.example`** para documentar:

```env
PORT=3001
MATERIAL_DIR=./material
VITE_API_BASE=/api
```

### Archivos a crear

- `.env.example`

### Archivos a modificar

- `server.js`
- `src/utils/api.js`

---

## Resumen de prioridades

### Rapidos (1-2 dias)

| # | Accion | Impacto |
|---|--------|---------|
| 1 | `manualChunks` en vite.config.js | Elimina warning, mejora carga inicial |
| 2 | ESLint + Prettier | Previene inconsistencias |
| 3 | Variables de entorno | Flexibilidad de deploy |
| 4 | CSS custom properties (solo definirlas) | Base para theming |
| 5 | Compresion gzip en server | Reduce transferencia ~60% |

### Medios (1-2 semanas)

| # | Accion | Impacto |
|---|--------|---------|
| 6 | Descomponer main.js en managers | Mantenibilidad |
| 7 | Async I/O en server | Rendimiento con concurrencia |
| 8 | Tests de API y stores | Confianza en cambios |
| 9 | JSDoc typedefs | Documentacion viva |
| 10 | Event bus (empezar gradual) | Reducir acoplamiento |

### Grandes (2-4 semanas)

| # | Accion | Impacto |
|---|--------|---------|
| 11 | Reemplazar mixins por services | Testabilidad del Editor |
| 12 | Lazy imports de compiladores | Reducir bundle ~40% |
| 13 | CI con GitHub Actions | Automatizar validacion |
| 14 | Cache del arbol + validacion de paths | Seguridad y rendimiento |
