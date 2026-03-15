# HOTFIX: React Single-File — Error Line Offset Bug

**Estado: VERIFICADO ✓** — solo `src/utils/compiler/reactCompiler.js` fue modificado.

## Problema

En ejemplos React **single-file**, cuando ocurre un error en runtime, la linea marcada en el editor estaba desfasada por **+4 lineas**. Si el error estaba en la linea 3 del codigo del usuario, el editor marcaba la linea 7.

Esto NO afecta a:
- React **multi-file** (siempre funcionó correctamente)
- Vue single-file (siempre funcionó correctamente)
- Vue multi-file (siempre funcionó correctamente)

## Causa Raiz

`buildReactSingleFileEntry()` envolvía el código del usuario inline dentro de un string con 4 líneas de preámbulo:

```
linea 1: (vacia — newline del template literal)
linea 2: import React from 'react';
linea 3: import { createRoot } from 'react-dom/client';
linea 4: (vacia)
linea 5+: CODIGO DEL USUARIO  ← offset +4
```

Todo se compilaba via esbuild `stdin` como un solo archivo. El source map resultante mapeaba las posiciones del bundle a las lineas del **archivo envuelto**, no del código original. La linea 1 del usuario era la linea 5 del source map.

Vue y React multi-file no tienen este problema porque usan un enfoque modular: cada archivo del usuario es un módulo separado con su propio contexto de source map, sin ningún preámbulo inyectado.

## Solución Implementada

Refactorizar `compileReactSingleFileDocument` para que use el mismo patrón modular que Vue single-file: separar el entry wrapper del código del usuario en dos módulos virtuales distintos, usando `createInlineModulesPlugin`.

### Cambios en `reactCompiler.js`

**1. Nuevos imports:**
```javascript
import path from 'path';
import { createVirtualFilesPlugin, createInlineModulesPlugin } from './virtualFilesPlugin.js';
```

**2. `buildReactSingleFileEntry` — ahora recibe una ruta de importación, no el source inline:**
```javascript
function buildReactSingleFileEntry(appImportPath) {
    return `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from ${JSON.stringify(appImportPath)};

globalThis.React = React;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('React root element "#root" was not found.');

const root = createRoot(rootElement);
root.render(React.createElement(App));
`;
}
```

Nota: `globalThis.React = React` es necesario porque el módulo del usuario no importa React explícitamente (la validación prohíbe imports). React queda disponible como global para cuando se llame `App()`. Ver sección de limitaciones.

**3. `buildReactBundle` eliminada. Reemplazada por `buildReactSingleFileBundle`:**
```javascript
async function buildReactSingleFileBundle({ appSource, appPath, loader }) {
    const entryPath = '__learncode_react_single__/entry.js';
    const normalizedAppPath = normalizeSourcePath(appPath, `react-example.${loader}`);
    const appImportPath = `./${path.posix.relative(path.posix.dirname(entryPath), normalizedAppPath)}`;

    const files = new Map([
        [entryPath, { contents: buildReactSingleFileEntry(appImportPath), loader: 'jsx', resolveDir: process.cwd() }],
        [normalizedAppPath, { contents: `${appSource}\nexport { App };`, loader, resolveDir: process.cwd() }],
    ]);

    const result = await build({
        entryPoints: [entryPath],
        plugins: [createInlineModulesPlugin(files, entryPath)],
        // ... resto de la config igual que antes (sin stdin)
    });
}
```

El código del usuario vive en su propio módulo. Su linea 1 = linea 1 del source map. Sin offset.
`export { App };` se agrega al final — no afecta las lineas del usuario porque está DESPUÉS.

**4. Llamada actualizada en `compileReactSingleFileDocument`:**
```javascript
const bundle = await buildReactSingleFileBundle({
    appSource: appBlock.content || '',
    appPath: appFile?.path || '',
    loader: appBlock.type === 'tsx' ? 'tsx' : 'jsx',
});
```

### Archivos que NO necesitaron cambios

- `runtimeBridge.js` — el VLQ decoder y `resolveSourcePosition` ya funcionaban; ahora reciben lineas correctas
- `documentRenderer.js` — sin cambios
- `diagnostics.js` — ya manejaba el namespace `learncode-inline:` generado por el plugin
- `Preview.js` — sin cambios

## Limitación conocida

`globalThis.React = React` se ejecuta en el entry module body, que corre **después** de que el módulo del usuario se inicializa (orden de dependencias en el bundle IIFE). Esto significa que si el usuario usa `React.algo()` a nivel de módulo (fuera de funciones), fallaría:

```jsx
// PROBLEMA: se ejecuta durante inicialización del módulo, antes de globalThis.React
const MyContext = React.createContext(null);

function App() { ... }
```

```jsx
// OK: se ejecuta cuando App() es llamado, después de globalThis.React
function App() {
  const [x] = React.useState(0); // ✓
}
```

**Impacto real: ninguno.** Se revisaron todos los ejemplos single-file en `material/` y ninguno usa `React.` a nivel de módulo. Los ejemplos con `React.createContext` son todos multi-file (donde los usuarios importan React explícitamente). Los single-file son los más simples por diseño.

## Casos verificados

1. React single-file con `React.useState` dentro de funciones ✓
2. React single-file con `const App = () => ...` ✓
3. React single-file sin `App` definido → error de compilación claro de esbuild ✓
4. React single-file TSX ✓
5. React multi-file — no afectado (usa `createVirtualFilesPlugin`, path separado) ✓
6. Vue single-file y multi-file — no afectados ✓
