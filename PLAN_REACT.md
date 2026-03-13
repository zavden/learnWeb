# Plan de Implementacion: React Multi-File en Un Solo Markdown

## Objetivo

Agregar un modo React mas potente para crear ejemplos pequenos pero reales con multiples archivos, manteniendo una restriccion clave del proyecto:

- todo el ejemplo debe seguir guardandose dentro de un unico archivo `.md`

Ademas, esta etapa obliga a redisenar el editor para que deje de depender de paneles simultaneos y pase a un modelo basado en archivos virtuales con tabs.

El nuevo sistema de tabs debe servir tanto para React multi-file como para los lenguajes y sesiones que ya existen hoy.

## Decisiones Nuevas que Cambian el Diseno

### 1. React multi-file no se implementara como carpeta

Aunque una carpeta seria el modelo mas natural, aqui el requisito es distinto:

- un proyecto React multi-file debe serializarse por completo dentro de un solo Markdown

Eso implica que ya no basta con pensar en "bloques" aislados. Hay que pensar en:

- metadata del documento
- lista de archivos virtuales
- entrypoint
- tipos de archivo
- orden y roles especiales

### 2. El editor actual por paneles simultaneos deja de escalar

El modelo actual sirve para:

- `HTML + CSS + JS`
- `SVG + CSS`
- `Pug + SCSS`
- React `single-file`

Pero deja de ser util cuando un ejemplo puede tener:

- `App.tsx`
- `Button.tsx`
- `hooks/useCounter.ts`
- `styles.css`
- `utils/format.ts`

Conclusion:

- el editor debe migrar a un modelo de archivo activo + tabs
- solo se edita un archivo a la vez
- el resto se navega por tabs y por menu

### 3. Este rediseño debe volverse general, no solo de React

El usuario pidio que el sistema de tabs tambien sea valido para los lenguajes anteriores.

Conclusion:

- la capa visual de edicion debe dejar de estar acoplada al concepto "slot"
- toda sesion, clasica o React, debe poder representarse como una lista de archivos virtuales

## Evaluacion de Complejidad

### React multi-file en un solo Markdown

Complejidad estimada: `8/10`

Sube respecto a React `single-file` porque ahora hay que resolver:

- multiples archivos virtuales
- imports locales entre archivos
- entrypoint
- serializacion dentro de un markdown unico
- errores por archivo
- navegacion por tabs

### Tabs generalizados para todo el editor

Complejidad estimada: `7/10`

No es un cambio cosmetico. Cambia la forma base del editor.

Hay que tocar:

- parser y modelo de documento
- renderer del editor
- Create presets
- guardado / reconstruccion del markdown
- sincronizacion del preview

## Conclusion Arquitectonica

La unidad principal del editor ya no debe ser "bloque por slot".

La nueva unidad principal debe ser:

- archivo virtual

Un documento de ejemplo debe poder verse internamente asi:

```js
{
  metadata: {
    framework: 'react',
    mode: 'multi-file',
    entry: 'src/main.tsx'
  },
  files: [
    {
      id: 'src/main.tsx',
      path: 'src/main.tsx',
      language: 'tsx',
      role: 'entry',
      content: '...'
    },
    {
      id: 'src/App.tsx',
      path: 'src/App.tsx',
      language: 'tsx',
      role: 'component',
      content: '...'
    },
    {
      id: 'src/Button.tsx',
      path: 'src/Button.tsx',
      language: 'tsx',
      role: 'component',
      content: '...'
    },
    {
      id: 'src/styles.css',
      path: 'src/styles.css',
      language: 'css',
      role: 'style',
      content: '...'
    }
  ]
}
```

## Propuesta de Formato Markdown

## Requisito

Debe ser:

- legible a mano
- editable a mano si hace falta
- serializable sin ambiguedad
- compatible con tabs y multiples archivos

## Opcion recomendada: secciones de archivo virtual

Ejemplo:

````md
---
framework: react
mode: multi-file
entry: src/main.tsx
---

## @file src/main.tsx
## @lang tsx
## @role entry

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(<App />);
```

## @file src/App.tsx
## @lang tsx
## @role component

```tsx
import React from 'react';
import { CounterButton } from './CounterButton';

export function App() {
  return (
    <main>
      <h1>React Multi File</h1>
      <CounterButton />
    </main>
  );
}
```

## @file src/CounterButton.tsx
## @lang tsx
## @role component

```tsx
import React from 'react';

export function CounterButton() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## @file src/styles.css
## @lang css
## @role style

```css
main {
  padding: 24px;
}
```
````

## Por que esta forma

Ventajas:

- sigue siendo Markdown puro
- es razonablemente legible
- permite metadata por archivo
- evita inventar un pseudo-JSON enorme dentro del Markdown
- se puede parsear sin depender de YAML complejo

## Reglas del formato

Cada archivo virtual debe tener:

- `## @file ruta`
- `## @lang lenguaje`
- bloque fenced correspondiente

Opcional:

- `## @role entry | component | style | util | asset`

Metadata global en frontmatter:

- `framework`
- `mode`
- `entry`
- futuras flags como `console`

## Compatibilidad con ejemplos viejos

No conviene romper el formato actual.

Por eso el parser debe soportar dos modos:

### Modo legado

Ejemplos actuales como:

- `HTML`
- `CSS`
- `JavaScript`
- `Pug`
- `SCSS`
- `TypeScript`
- React `single-file`

Se siguen parseando como hoy.

### Modo virtual files

Si el parser detecta `## @file ...`, entra en modo multi-file.

Conclusion:

- compatibilidad hacia atras obligatoria
- el nuevo sistema no invalida el contenido ya existente

## Como Representar Lenguajes Previos en el Nuevo Editor de Tabs

Aunque el archivo siga siendo de formato legado, la UI debe convertirlo internamente a archivos virtuales para editar.

Ejemplos:

### HTML + CSS + JavaScript

Debe verse como tabs:

- `index.html`
- `styles.css`
- `script.js`

### Pug + SCSS + TypeScript

Debe verse como tabs:

- `template.pug`
- `styles.scss`
- `script.ts`

### React single-file

Debe verse como tabs:

- `App.jsx` o `App.tsx`
- `styles.css` si existe

Conclusion:

- el sistema visual no debe saber si el origen era "legacy blocks" o "multi-file real"
- la capa de UI solo debe recibir una lista de archivos editables

## Rediseño del Editor

## Nuevo modelo de UI

El editor debe pasar a esta estructura:

- barra superior de tabs
- menu selector de archivo
- un solo editor CodeMirror visible
- preview al lado
- futura consola debajo del preview

## Comportamiento

- una tab por archivo virtual
- si hay muchas tabs, el menu permite saltar rapido al archivo
- cambiar tab cambia el contenido del unico editor visible
- el preview recompila usando todos los archivos del documento

## Requisitos de UX

- tabs ordenadas y estables
- archivo activo bien marcado
- nombres cortos en tab, ruta completa en tooltip o menu
- el menu debe listar todos los archivos aunque no quepan en tabs

## Decision recomendada

Las tabs deben ser la navegacion principal.

El menu debe ser apoyo, no reemplazo.

## Arquitectura Recomendada

## 1. Nuevo modelo interno de documento

El documento debe crecer a algo como:

```js
{
  sessionId: 'react-multi-file',
  metadata: {
    framework: 'react',
    mode: 'multi-file',
    entry: 'src/main.tsx'
  },
  files: [...],
  diagnostics: []
}
```

Y para retrocompatibilidad:

```js
{
  sessionId: 'html-css-javascript',
  metadata: {},
  files: [
    { path: 'index.html', language: 'html', role: 'markup', sourceType: 'legacy' },
    { path: 'styles.css', language: 'css', role: 'style', sourceType: 'legacy' },
    { path: 'script.js', language: 'javascript', role: 'script', sourceType: 'legacy' }
  ]
}
```

## 2. Parser dual

[src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js) debe soportar:

- parse legacy blocks
- parse virtual file sections

Y tambien:

- reconstruir el markdown en el formato correcto original

Decision recomendada:

- si el documento original era multi-file, se guarda como multi-file
- si era legacy, se guarda como legacy mientras no se migre explicitamente

## 3. Compilador multi-file para React

[src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js) debe aceptar:

- multiples archivos virtuales
- imports relativos internos
- un archivo de entrada

Decision recomendada:

- seguir con `esbuild`
- usar un plugin o resolucion en memoria para importar archivos del documento virtual

Eso permite:

- `import { App } from './App'`
- `import './styles.css'`
- `import { useCounter } from './hooks/useCounter'`

sin tocar el filesystem real

## 4. Renderer

Para React multi-file:

- el renderer debe seguir generando un `#root`
- el bundle compilado debe montarse desde el archivo `entry`
- el preview no debe saber que el origen venia de un markdown unico

## 5. UI de Tabs generalizada

La UI nueva debe vivir por encima del concepto de framework.

Eso significa:

- HTML/CSS/JS tambien usan tabs
- Pug/SCSS/TS tambien usan tabs
- React single-file tambien usa tabs
- React multi-file usa tabs

## Fases de Implementacion

## Fase 1: Plan y Modelo General

Objetivo:

- dejar definido que el editor entero migra a "archivos virtuales"

Cambios:

- ajustar los planes y documentacion tecnica
- fijar el contrato del formato `## @file`

Resultado esperado:

- no hay ambiguedad entre legacy blocks y multi-file

## Fase 2: Parser de Virtual Files

Objetivo:

- parsear y reconstruir documentos multi-file en un solo markdown

Cambios:

- extender [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)
- detectar `## @file`
- validar `@lang`
- validar rutas duplicadas
- validar existencia del `entry`

Resultado esperado:

- el documento queda representado como `files[]`

## Fase 3: Adaptador Legacy -> Files

Objetivo:

- que todos los ejemplos, incluidos los viejos, se editen como archivos virtuales en la UI

Cambios:

- mapear:
  - `HTML` -> `index.html`
  - `SVG` -> `graphic.svg`
  - `Pug` -> `template.pug`
  - `CSS` -> `styles.css`
  - `SCSS` -> `styles.scss`
  - `SASS` -> `styles.sass`
  - `JavaScript` -> `script.js`
  - `TypeScript` -> `script.ts`
  - `JSX` -> `App.jsx`
  - `TSX` -> `App.tsx`

Resultado esperado:

- el editor ya no necesita paneles simultaneos

## Fase 4: UI de Tabs

Objetivo:

- reemplazar paneles por tabs + menu de seleccion

Cambios:

- redisenar [src/components/Editor.js](/home/zavden/Learning/Web/learnWeb/src/components/Editor.js)
- agregar barra de tabs
- agregar selector de archivo
- mantener CodeMirror unico
- cambiar el archivo activo sin destruir el documento entero

Resultado esperado:

- el usuario solo ve un archivo a la vez
- puede navegar por tabs o menu

## Fase 5: Compilacion React Multi-File

Objetivo:

- soportar imports internos y hooks repartidos en varios archivos

Cambios:

- extender [src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js)
- crear pipeline React multi-file con `esbuild`
- resolver archivos virtuales en memoria
- soportar CSS importado desde el arbol virtual

Resultado esperado:

- un mini proyecto React funciona sin existir como carpeta real

## Fase 6: Presets y Creacion

Objetivo:

- permitir crear proyectos base desde la UI

Cambios:

- extender [src/config/exampleBlocks.js](/home/zavden/Learning/Web/learnWeb/src/config/exampleBlocks.js) o la capa sucesora
- agregar presets como:
  - `react-multi-file-jsx`
  - `react-multi-file-tsx`
  - `react-multi-file-hooks`

Resultado esperado:

- el usuario crea un proyecto con varios archivos desde `Create`

## Fase 7: Preview, Galeria y Errores

Objetivo:

- que preview y galeria entiendan documentos multi-file

Cambios:

- actualizar [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- actualizar [src/components/Gallery.js](/home/zavden/Learning/Web/learnWeb/src/components/Gallery.js)
- mejorar diagnosticos por archivo

Resultado esperado:

- preview y mini previews siguen funcionando en todos los modos

## Fase 8: Consola y Hooks

Objetivo:

- dejar preparado el entorno correcto para ejemplos mas realistas

Cambios:

- integrar la futura consola con React multi-file
- validar ejemplos con hooks custom, componentes separados y utilidades

Resultado esperado:

- el entorno sirve para ensenar React mas alla del componente unico

## Reglas de Compatibilidad

### No se deben romper ejemplos existentes

Los ejemplos ya guardados en formato viejo deben:

- seguir cargando
- seguir editandose
- seguir guardandose

### El nuevo editor con tabs debe ser universal

No debe haber:

- editor por paneles para sesiones viejas
- editor por tabs solo para React

Debe haber una sola experiencia de edicion.

## Riesgos

### 1. Serializacion compleja en Markdown

Si el formato `@file` no queda muy claro, editar a mano sera propenso a errores.

### 2. Esbuild en memoria

Resolver imports virtuales dentro de un markdown unico requiere una capa propia de resolucion.

### 3. Migracion de UI

Cambiar de paneles a tabs es un rediseño importante que puede introducir regresiones en sesiones antiguas.

### 4. Errores por archivo

El sistema debe poder indicar no solo "hay error", sino en que archivo virtual ocurre.

## Alcance de la Primera Implementacion Recomendada

### Incluye

- nuevo formato multi-file en un solo markdown
- editor con tabs y menu de seleccion
- React multi-file con imports relativos internos
- soporte para hooks y componentes repartidos en varios archivos
- compatibilidad visual de tabs para ejemplos anteriores

### No incluye todavia

- assets binarios embebidos dentro del markdown
- npm dependencies por proyecto
- alias de rutas avanzados
- test runner
- HMR real dentro del preview

## Criterios de Aceptacion

- un proyecto React multi-file puede vivir en un solo `.md`
- el parser detecta y valida todos los archivos virtuales
- el usuario ve tabs y solo un editor activo a la vez
- el menu puede abrir cualquier archivo del proyecto
- el sistema compila imports relativos entre archivos virtuales
- ejemplos legacy tambien usan tabs sin romper compatibilidad
- el preview sigue funcionando para modos clasicos y React

## Archivos que Seguramente Cambiaran

- [PLAN_REACT.md](/home/zavden/Learning/Web/learnWeb/PLAN_REACT.md)
- [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)
- [src/config/exampleBlocks.js](/home/zavden/Learning/Web/learnWeb/src/config/exampleBlocks.js)
- [src/components/Editor.js](/home/zavden/Learning/Web/learnWeb/src/components/Editor.js)
- [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- [src/components/Gallery.js](/home/zavden/Learning/Web/learnWeb/src/components/Gallery.js)
- [src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js)
- [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)
- [index.html](/home/zavden/Learning/Web/learnWeb/index.html)
- [src/style.css](/home/zavden/Learning/Web/learnWeb/src/style.css)

## Estado

Listo para empezar despues de aprobar este cambio de direccion.

Orden recomendado:

1. parser multi-file
2. adaptador legacy a archivos virtuales
3. UI de tabs general
4. compilacion React multi-file
5. presets y ejemplos
