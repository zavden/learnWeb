# LearnCode

Aplicacion local para estudiar tecnologias web a partir de material organizado en carpetas y archivos Markdown.

La app combina:

- un frontend con Vite y JavaScript vanilla
- un backend con Express
- edicion de codigo con CodeMirror 6
- renderizado de teoria en Markdown
- previsualizacion en vivo en un `iframe`
- compilacion local de `Pug`, `SCSS`, `SASS`, `TypeScript`, React y Vue
- preview shader local con WebGL para documentos `Vertex + Fragment`
- consola runtime opt-in, modo ejercicio y comparacion intento vs solucion

La idea central del proyecto es simple: el contenido no vive en una base de datos, vive en el filesystem dentro de la carpeta `material/`. El backend solo lee y escribe esos archivos, y el frontend actua como explorador, editor y visor.

## Tabla de contenido

- [Resumen](#resumen)
- [Guia para IAs](#guia-para-ias)
- [Tecnologias](#tecnologias)
- [Arquitectura general](#arquitectura-general)
- [Como se organiza el contenido](#como-se-organiza-el-contenido)
- [Formato de los archivos](#formato-de-los-archivos)
- [Flujo de uso dentro de la app](#flujo-de-uso-dentro-de-la-app)
- [Instalacion](#instalacion)
- [Ejecucion en desarrollo](#ejecucion-en-desarrollo)
- [Comandos disponibles](#comandos-disponibles)
- [Licencia](#licencia)
- [API del backend](#api-del-backend)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Detalles importantes de funcionamiento](#detalles-importantes-de-funcionamiento)
- [Limitaciones actuales](#limitaciones-actuales)
- [Solucion de problemas](#solucion-de-problemas)

## Resumen

Este proyecto funciona como un pequeno entorno de aprendizaje local tipo "mini CodePen + visor de teoria".

Permite:

- navegar por un arbol de capitulos, secciones y topics
- leer teoria de cada topic desde un archivo `main.md`
- ver una galeria de ejemplos guardados para cada topic
- abrir un ejemplo y editar solo los paneles que realmente usa
- ver una previsualizacion en vivo del resultado
- trabajar con ejemplos clasicos (`HTML`, `SVG`, `CSS`, `JavaScript`)
- tratar `HTML` como fragmento de `body`, con `HTML-B` como alias explicito
- trabajar con `HTML-FULL` cuando necesites escribir un documento HTML completo
- trabajar con ejemplos compilados (`Pug`, `SCSS`, `SASS`, `TypeScript`)
- trabajar con React `single-file` y `multi-file`
- trabajar con Vue `single-file`, `multi-file` y `.vue` SFC controlados
- trabajar con documentos shader `Vertex + Fragment`
- alternar entre layout por paneles verticales o tabs
- usar consola runtime opt-in por ejemplo
- usar panel shader con FPS, resolucion, pausa y reset
- usar modo ejercicio con pistas, archivos ocultos y comparacion
- crear, guardar, modificar, renombrar y eliminar ejemplos
- crear nuevos capitulos, secciones, topics y ejemplos

## Guia para IAs

Si una IA tiene que aprender a editar este proyecto, este es el orden recomendado de lectura:

1. Lee [AGENTS.md](AGENTS.md).
   Ahi esta la regla general de enrutado del repo y que tipo de archivo tocar segun la tarea.
2. Lee [skills/learnweb-repo-editing/SKILL.md](skills/learnweb-repo-editing/SKILL.md).
   Esa es la guia general local del repositorio.
3. Lee [skills/learnweb-repo-editing/references/hotspots.md](skills/learnweb-repo-editing/references/hotspots.md).
   Ese archivo es el mapa detallado de hotspots: editor, preview, gallery, theory, shaders, backend, tests y contenido.
4. Si la tarea es especifica, lee solo la skill especializada que corresponda:
   - ejemplos Markdown: [`.codex/skills/learnweb-example-authoring/SKILL.md`](.codex/skills/learnweb-example-authoring/SKILL.md)
   - teoria `main.md`: [`.codex/skills/learnweb-theory-authoring/SKILL.md`](.codex/skills/learnweb-theory-authoring/SKILL.md)
   - shaders: [`.codex/skills/learnweb-shader-authoring/SKILL.md`](.codex/skills/learnweb-shader-authoring/SKILL.md)
5. Despues de eso, abre solo los archivos del hotspot exacto que corresponda a la tarea.

Regla practica:

- para entender el repo: `AGENTS.md` -> `skills/learnweb-repo-editing/SKILL.md` -> `hotspots.md`
- para editar contenido: despues salta a `material/**`
- para editar app code: despues salta a `src/**`, `index.html`, `server.js` o `tests/**` segun el hotspot

Validacion recomendada para una IA:

- cambios de contenido puro: validacion dirigida
- cambios de parser, editor, preview, backend o metadata: `npm test`
- cambios de UI o runtime: `npm run build`

## Tecnologias

### Frontend

- Vite
- JavaScript vanilla con modulos ES
- CodeMirror 6
- `marked` para renderizar Markdown
- WebGL para preview shader
- React y ReactDOM para modos React
- Vue runtime y compiladores de Vue para modos Vue
- `Web Worker` para orquestacion y cache de compilacion en cliente

### Backend

- Node.js
- Express
- CORS
- `fs` y `path` del runtime de Node para operar sobre el filesystem
- `pug` para compilar ejemplos `Pug`
- `sass` para compilar `SCSS` y `SASS`
- `typescript` para transpilar `TypeScript`
- `esbuild` para compilar `JSX`, `TSX` y bundles multi-file
- `@vue/compiler-dom` y `@vue/compiler-sfc` para templates y SFC de Vue

## Arquitectura general

La app esta dividida en dos procesos:

### 1. Frontend

Se sirve con Vite en `http://localhost:5174`.

Responsabilidades:

- dibujar la interfaz
- cargar el arbol de navegacion
- cargar teoria y ejemplos
- mostrar la galeria
- montar paneles dinamicos de edicion
- actualizar el preview en vivo
- orquestar compilaciones con cache desde un `Web Worker`
- mostrar consola runtime y panel de ejercicio
- llamar a la API del backend

### 2. Backend

Se levanta con Express en `http://localhost:3001`.

Responsabilidades:

- leer la estructura de carpetas dentro de `material/`
- exponer esa estructura como JSON
- leer teoria y ejemplos
- crear carpetas y archivos nuevos
- modificar, renombrar y borrar ejemplos
- servir assets locales de cada topic
- compilar ejemplos antes de enviarlos al preview
- cachear resultados de compilacion repetidos

### Comunicacion entre ambos

Durante desarrollo, Vite hace proxy de las rutas `/api` hacia `http://localhost:3001`.

Eso significa que el frontend hace peticiones como:

```txt
/api/tree
/api/topic/chNN-capitulo/secNN-seccion/topNN-topic/main
```

y Vite las redirige al backend.

## Como se organiza el contenido

Todo el contenido vive dentro de `material/`.

La jerarquia es:

```txt
material/
  chNN-nombre-del-capitulo/
    secNN-nombre-de-la-seccion/
      topNN-nombre-del-topic/
        main.md
        examples/
          ejemplo-1.md
          ejemplo-2.md
        assets/
          imagenes-o-recursos-del-topic
```

### Convenciones de nombres

El backend espera estos prefijos:

- `ch` para capitulos
- `sec` para secciones
- `top` para topics

Ejemplos validos:

- `chNN-mi-capitulo`
- `sec01-selectors`
- `top01-class-selector`

El numero se usa para ordenar y para mostrar la numeracion logica. El resto del nombre se usa como etiqueta visible en la UI, reemplazando guiones por espacios.

## Formato de los archivos

### 1. Teoria: `main.md`

Cada topic tiene un archivo `main.md` con contenido Markdown.

Ejemplo:

```md
# Topic 01 - Class Selector

Explicacion del tema.

- Idea 1
- Idea 2
```

La teoria se renderiza con `marked` y aparece en el panel lateral de teoria.

Tambien se puede editar desde la UI:

- el header de Theory tiene un boton para abrir `main.md` en el editor
- si hace falta, la app cambia a layout `Tabs`
- el preview derecho muestra el Markdown renderizado en vivo
- `Save`, `Modify`, `Ctrl+S`, `Shift+S` y `:w` guardan sobre el `main.md` real del topic

`main.md` soporta embeds de ejercicios del mismo topic con esta sintaxis:

```md
[[exercise:ex01.md]]
```

Ese shortcode genera una card inline con preview pequeno, un popup grande y un boton para abrir el ejercicio real.

### 2. Ejemplos: archivos `.md` dentro de `examples/`

Cada ejemplo se guarda como Markdown estructurado. El parser no trabaja con texto libre: espera bloques fenced con lenguajes soportados y, opcionalmente, un frontmatter simple al inicio.

#### Formato clasico

~~~~md
# HTML

```html
<h1>Hello</h1>
```

# CSS

```css
h1 {
  color: red;
}
```

# JavaScript

```javascript
console.log('Hello');
```
~~~~

#### Sesiones dinamicas

El sistema soporta combinaciones como:

- solo `HTML`
- solo `HTML-B`
- solo `HTML-FULL`
- `HTML + CSS`
- `HTML + CSS + JavaScript`
- `SVG + CSS`
- `Pug + SCSS`
- `Pug + TypeScript`
- `HTML + SASS + TypeScript`
- `Vertex + Fragment` con `renderer: shader`

Los paneles visibles del editor dependen de los bloques reales del archivo.

`HTML` y `HTML-B` significan lo mismo: contenido que se inyecta dentro del `<body>` generado por la app. No debes escribir `<!DOCTYPE html>`, `<html>`, `<head>` ni `<body>` dentro de esos bloques.

`HTML-FULL` es distinto: representa un documento HTML completo y el preview no lo envuelve dentro de otro `<!DOCTYPE html><html>...</html>`. En este modo, los estilos y scripts deben vivir dentro del propio documento; no se deben mezclar bloques `CSS` o `JavaScript` separados.

#### Documentos shader

El sistema tambien soporta documentos shader basados en dos bloques obligatorios:

~~~~md
---
renderer: shader
resolution: 800x600
---

# Vertex

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

# Fragment

```fragment
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
```
~~~~

Reglas del modo shader:

- el formato canonico es `Vertex + Fragment`
- `renderer: shader` es la via explicita recomendada
- si existen exactamente un bloque `vertex` y uno `fragment`, el parser tambien autodetecta el documento como shader
- `resolution: WIDTHxHEIGHT` define la resolucion base del canvas
- `shader_textures` permite declarar samplers cargados desde `assets/` del topic
- no se mezclan bloques `HTML`, `CSS` o `JavaScript` con shaders
- no se usa consola runtime: el preview muestra un panel shader especifico

#### Frontmatter simple

El archivo puede arrancar con metadata simple:

~~~~md
---
framework: react
mode: multi-file
entry: src/main.jsx
console: true
---
~~~~

Notas:

- el parser actual soporta pares `clave: valor` simples
- no es un parser YAML completo
- se usa para framework, modo, entry, consola, ejercicios y progresion

Claves soportadas mas importantes:

- `framework: react | vue`
- `renderer: shader | web`
- `resolution: 800x600`
- `shader_uniforms: intensity:float=0.8[0,1.5,0.01]|invert:bool=false|focus:vec2=0.5,0.5`
- `shader_textures: u_checker=checker.svg|u_spot=spotlight.svg`
- `mode: multi-file`
- `entry: ruta/del/entry`
- `console: true | false`
- `exercise: true`
- `exercise_title`
- `exercise_instructions`
- `exercise_hints`
- `exercise_locked_files`
- `exercise_reference_files`
- `exercise_solution_files`
- `exercise_compare_pairs`
- `exercise_solution_example`
- `example_stage: minimal | intermediate | common-error | exercise | final-solution`
- `example_description: texto corto`
- `example_tags: html|css|svg`
- `example_rating: 1..5`
- `example_importance: trivial | useful | important | critical`

#### Metadata editorial de ejemplos

Cada ejemplo puede llevar metadata editorial para describir mejor su valor didactico.

Ejemplo:

~~~~md
---
example_description: "Small responsive card with hover states"
example_tags: "html|css|layout"
example_rating: 4
example_importance: important
---
~~~~

Reglas:

- `example_description` es un texto corto para overlays y resumentes compactos
- `example_tags` usa `|` como separador
- `example_rating` debe ser un entero entre `1` y `5`
- `example_importance` acepta `trivial`, `useful`, `important` o `critical`

Desde la UI, el boton `Meta` del editor abre un popup para crear o editar estos campos. Si el ejemplo ya existe en disco, `Apply` hace `Modify` automaticamente.

#### Formato multi-file

Cuando el documento usa archivos virtuales, cada archivo vive dentro del mismo Markdown con encabezados `@file`.

Ejemplo:

~~~~md
---
framework: react
mode: multi-file
entry: src/main.jsx
console: true
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
export function App() {
  return <main>Hello</main>;
}
```

## @file src/styles.css
## @lang css
## @role style

```css
main { color: red; }
```
~~~~

Campos importantes:

- `@file`: ruta virtual del archivo
- `@lang`: lenguaje real del archivo
- `@role`: rol semantico (`entry`, `app`, `component`, `style`, etc.)

#### React `single-file`

Para React, el archivo usa `framework: react` y un bloque `JSX` o `TSX`.

Ejemplo:

~~~~md
---
framework: react
---

# JSX

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

# CSS

```css
button {
  padding: 10px 14px;
}
```
~~~~

En ese modo:

- no escribes `HTML` base manual
- no escribes `div#root`
- no escribes `ReactDOM.createRoot(...)`
- la plataforma genera el shell y monta `App` automaticamente

Cuando vuelves a guardar, el sistema reconstruye el Markdown respetando la metadata y los bloques activos.

#### React y Vue multi-file

La app ya soporta proyectos pequenos multi-file dentro de un solo `.md`:

- React multi-file con `jsx`, `tsx`, `js`, `ts`, `css`, `scss`, `sass` y `json`
- Vue multi-file con `html`, `js`, `ts`, `css`, `scss`, `sass`, `json` y `.vue`
- Vue SFC controlado con `<template>`, `<script>`, `<script setup>`, `lang="ts"`, `<style scoped>`, `scss` y `sass`

El editor puede mostrarlos en:

- `Panels`: varios archivos a la vez en vertical
- `Tabs`: un archivo activo por vez con tabs y selector

### 3. Assets por topic

Cada topic puede tener una carpeta `assets/`.

Esa carpeta sirve para guardar recursos locales del topic, por ejemplo:

- imagenes
- SVGs
- fuentes
- archivos auxiliares

El preview principal inyecta una etiqueta `<base>` para que el HTML del ejemplo pueda referenciar esos archivos usando rutas relativas.

Ejemplo:

```html
<img src="diagram.png" alt="Diagrama" />
```

Si `diagram.png` existe en `assets/`, el preview principal puede resolverlo desde:

```txt
/api/topic/:ch/:sec/:top/assets/diagram.png
```

Para proyectos `React` y `Vue` multi-file, la politica actual es:

- `JSON` virtual dentro del mismo Markdown: soportado
- imagenes, fuentes o binarios virtuales dentro del mismo Markdown: no soportado
- recursos locales simples en `assets/` del topic: soportado por URL relativa

### 4. Favoritos externos

Los favoritos no viven en el frontmatter del ejemplo. Se guardan por separado en [`.favorites`](./.favorites), en la raiz del proyecto.

Caracteristicas:

- guardan rutas de Markdown, no copias del contenido
- no modifican el archivo original
- funcionan entre topics distintos
- si un favorito deja de existir, se sigue mostrando como card `missing`

Desde la UI:

- la estrella del editor agrega o quita el ejemplo actual
- el boton `Favorites` del tree abre un popup con todos los favoritos
- cada card favorita permite `Open` o `Remove`

## Flujo de uso dentro de la app

### 1. Carga inicial

Al entrar:

- se construyen los componentes principales del frontend
- se crea el editor, el preview, la galeria y el visor de teoria
- se llama a `/api/tree`
- el sidebar se llena con el arbol de capitulos, secciones y topics

### 2. Seleccion de un topic

Cuando haces click en un topic:

- la app guarda la ruta del topic actual
- el editor y el preview quedan vinculados a ese topic
- se carga `main.md` como teoria
- se cargan los ejemplos del topic
- se muestra la galeria en vez del editor

### 3. Apertura de un ejemplo

Cuando eliges un ejemplo desde la galeria, desde `Open File` o desde `Favorites`:

- se pide el archivo Markdown al backend
- se parsean los bloques y la metadata
- cada bloque visible se carga en su editor correspondiente
- el preview se actualiza automaticamente

### 4. Edicion y preview

Cada vez que cambias codigo:

- el editor dispara un callback
- el preview espera 300 ms
- un cliente de compilacion con `Web Worker` reutiliza cache y, si hace falta, llama al backend
- se reconstruye un documento HTML completo dentro del `iframe`
- se inyecta el resultado compilado actual

La zona superior del preview tambien puede mostrar un resumen editorial del ejemplo activo:

- descripcion corta
- tags
- rating en estrellas
- importancia

Ese bloque se puede mostrar u ocultar desde el toggle `Show Info / Hide Info` del tree.

Si `console: true` esta activo en el ejemplo:

- aparece una consola debajo del preview
- captura `console.log/info/warn/error`
- captura `window.onerror` y `unhandledrejection`
- permite ejecutar comandos manuales
- mantiene historial por ejemplo y soporta filtros, zoom y resize

Si el documento usa `renderer: shader`:

- el preview cambia al pipeline WebGL
- se renderiza un fullscreen quad con `Vertex + Fragment`
- la consola se reemplaza por un panel shader
- el panel muestra `FPS`, resolucion efectiva, uniforms built-in, uniforms personalizados y estado de texturas
- los controles editables viven en un drawer plegable del lado del editor
- el shader arranca pausado por defecto

La galeria tambien aprovecha la metadata editorial:

- al hacer `hover` sobre una card aparece un overlay con descripcion, tags, rating e importance
- ese overlay se puede ocultar globalmente desde `Hide Info / Show Info` en la propia galeria

#### Uniforms personalizados en shaders

La V1 de shaders tambien soporta uniforms definidos por metadata:

~~~~md
---
renderer: shader
resolution: 960x540
shader_uniforms: intensity:float=0.8|invert:bool=false|focus:vec2=0.5,0.5
---
~~~~

Formato actual:

- `name:type=value`
- o `name:type=value[min,max,step]` para `float` e `int`
- separador entre uniforms: `|`
- tipos soportados:
  - `float`
  - `int`
  - `bool`
  - `vec2`
  - `vec3`
  - `vec4`

Reglas:

- no puedes redefinir built-ins como `u_time` o `u_resolution`
- si una declaracion es invalida, se muestra diagnostico y se ignora
- el panel shader crea controles automaticamente para esos uniforms
- el runtime los aplica solo si el shader realmente declara esos uniforms
- `float` e `int` pueden declarar un rango opcional y el panel mostrara un slider
- `vec3` y `vec4` se editan como grupos de valores numericos

#### Texturas locales en shaders

La V1 de shaders tambien soporta samplers definidos por metadata y cargados desde `assets/` del topic actual:

~~~~md
---
renderer: shader
resolution: 960x540
shader_textures: u_checker=checker.svg|u_spot=spotlight.svg
---
~~~~

Formato actual:

- `uniformName=asset-file`
- separador entre texturas: `|`
- extensiones soportadas:
  - `.png`
  - `.jpg`
  - `.jpeg`
  - `.gif`
  - `.webp`
  - `.avif`
  - `.bmp`
  - `.svg`

Reglas:

- el archivo debe existir en `assets/` del topic actual
- por ahora solo se soportan archivos en la raiz de `assets/`, no subcarpetas
- el panel shader muestra estado de carga y dimensiones cuando la textura ya esta lista
- el runtime asigna una unidad de textura por declaracion y la conecta al uniform del mismo nombre
- si el shader no declara ese sampler, la textura se carga pero no afecta el programa

### 5. Guardado

Hay dos flujos distintos:

#### `Save`

`Save` crea un archivo nuevo en `examples/`.

El nombre del archivo lo genera el backend con timestamp, por ejemplo:

```txt
mar-12-2026-23:10:45.md
```

Esto sirve para crear una nueva version o nuevo ejemplo a partir del estado actual del editor.

#### `Modify`

`Modify` sobrescribe el archivo que ya esta cargado actualmente.

Solo esta habilitado si ya abriste o acabas de crear/cargar un archivo.

Notas utiles:

- si editas `main.md` desde Theory, `Modify` guarda la teoria del topic actual
- si aplicas cambios desde el popup `Meta` y el ejemplo ya existe, la app hace `Modify` automaticamente

### 6. Rename y Remove

- `Rename` cambia el nombre del archivo actual
- `Remove` lo borra del filesystem

### 7. Create

El dialogo de creacion permite crear:

- `Chapter`
- `Section`
- `Topic`
- `Example`

Reglas:

- un `Chapter` se crea directamente dentro de `material/`
- una `Section` se crea dentro de un capitulo
- un `Topic` se crea dentro de una seccion
- un `Example` se crea como archivo `.md` dentro de `examples/`

Cuando creas un `Topic`, el backend tambien crea:

- `examples/`
- `assets/`
- `main.md`

Cuando creas un `Example`, el backend genera una plantilla minima segun el preset elegido.

Actualmente el dialogo incluye presets para:

- sesiones clasicas
- shaders (`shader-basic`, `shader-time`, `shader-mouse`, `shader-frame`, `shader-custom-uniforms`, `shader-vector-uniforms`, `shader-ranged-uniforms`, `shader-textures`)
- sesiones con `SCSS`, `SASS` y `TypeScript`
- React `single-file`
- React `multi-file`
- Vue `single-file`
- Vue `multi-file`
- Vue SFC

## Instalacion

### Requisitos

- Node.js 18 o superior recomendado
- npm

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd learnWeb
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instala dependencias de frontend y backend definidas en `package.json`.

### 3. Verificar que existe la carpeta `material/`

El proyecto depende de `material/` como fuente de contenido. Debe existir en la raiz del repo.

Si la borras, el backend no podra construir el arbol de navegacion.

## Ejecucion en desarrollo

La forma normal de usar el proyecto es:

```bash
npm run dev
```

Ese comando arranca al mismo tiempo:

- Vite en `http://localhost:5174`
- Express en `http://localhost:3001`

Luego abres:

```txt
http://localhost:5174
```

## Comandos disponibles

### `npm run dev`

Levanta frontend y backend de desarrollo en paralelo.

### `npm run build`

Genera el build del frontend con Vite.

Importante:

- este comando no empaqueta ni despliega el backend
- el proyecto no trae una estrategia de produccion completa lista

### `npm test`

Ejecuta la suite automatica completa con `node --test`.

### `npm run test:watch`

Ejecuta la suite en modo watch.

### `npm run preview`

Levanta el preview estatico del frontend generado por Vite.

Importante:

- no arranca `server.js`
- no reemplaza el flujo completo de desarrollo
- para usar la app normalmente necesitas tambien el backend

## Licencia

Este proyecto se publica bajo `AGPL-3.0-only`. El texto completo esta en [LICENSE](./LICENSE).

La elegi porque es la licencia estandar mas cercana a este objetivo:

- cualquiera puede leer, usar y modificar el codigo
- si alguien distribuye una version modificada, debe mantener la licencia y los avisos
- si alguien ejecuta una version modificada como servicio en red, debe ofrecer el codigo fuente correspondiente

Importante:

- esto se parece mas a lo que buscabas que `GPL` comun
- no obliga por si sola a poner un credito visible en toda interfaz o producto final
- si mas adelante quieres exigir una atribucion visible mas fuerte, habria que anadir terminos adicionales

## API del backend

### `GET /api/tree`

Devuelve el arbol completo de navegacion.

### `GET /api/topic/:ch/:sec/:top/main`

Devuelve el contenido de `main.md`.

### `PATCH /api/topic/:ch/:sec/:top/main`

Sobrescribe el `main.md` del topic actual.

Body:

```json
{
  "content": "# Theory\n\nUpdated text"
}
```

### `GET /api/topic/:ch/:sec/:top/examples`

Devuelve el listado de archivos `.md` dentro de `examples/`.

### `GET /api/topic/:ch/:sec/:top/examples/:file`

Devuelve el contenido de un ejemplo especifico.

### `POST /api/topic/:ch/:sec/:top/examples`

Crea un nuevo ejemplo usando el contenido recibido en el body:

```json
{
  "content": "..."
}
```

El backend asigna un nombre con timestamp.

### `PATCH /api/topic/:ch/:sec/:top/examples/*`

Sobrescribe el contenido de un ejemplo existente.

Body:

```json
{
  "content": "..."
}
```

### `DELETE /api/topic/:ch/:sec/:top/examples/*`

Elimina un ejemplo existente.

### `PUT /api/topic/:ch/:sec/:top/examples/*`

Renombra un ejemplo.

Body:

```json
{
  "newFilename": "nuevo-nombre.md"
}
```

### `POST /api/create`

Crea capitulos, secciones, topics o ejemplos.

Body:

```json
{
  "type": "chapter | section | topic | example",
  "name": "nombre",
  "parentPath": "ruta/opcional",
  "sessionPreset": "opcional"
}
```

### `POST /api/compile`

Compila un documento fuente y devuelve:

- `document`
- `compiledDocument`
- `compileDiagnostics`

Es la ruta que usa el preview para soportar:

- `Pug`
- `SCSS`
- `SASS`
- `TypeScript`
- React `single-file` y `multi-file`
- Vue `single-file`, `multi-file` y `.vue`

Tambien devuelve `compileMeta` con informacion de cache cuando aplica.

### `GET /api/topic/:ch/:sec/:top/assets/:file`

Sirve un archivo dentro de la carpeta `assets/` del topic actual.

### `GET /api/favorites`

Devuelve el estado actual de [`.favorites`](./.favorites):

- `items`: rutas guardadas tal como viven en el archivo
- `entries`: cards resueltas, incluyendo `exists`, `topicPath` y `filename` cuando aplica

### `POST /api/favorites`

Agrega un ejemplo a favoritos.

Body:

```json
{
  "path": "material/chNN-capitulo/secNN-seccion/topNN-topic/examples/exNN.md"
}
```

### `DELETE /api/favorites`

Elimina un ejemplo de favoritos.

Body:

```json
{
  "path": "material/chNN-capitulo/secNN-seccion/topNN-topic/examples/exNN.md"
}
```

### `GET /api/editor/vim-shortcuts`

Devuelve la configuracion efectiva de [vim-shortcuts.yaml](./vim-shortcuts.yaml), incluyendo fallback al mapa por defecto si el archivo falta o es invalido.

## Estructura del proyecto

```txt
learnWeb/
  index.html
  .favorites
  package.json
  package-lock.json
  vite.config.js
  server.js
  material/
  src/
    main.js
    style.css
    config/
      exampleBlocks.js
      fileTemplates.js
    components/
      Sidebar.js
      TheoryViewer.js
      Editor.js
      ExercisePanel.js
      Preview.js
      Gallery.js
      CreateDialog.js
    utils/
      api.js
      compileCache.js
      compileClient.js
      exerciseComparison.js
      exampleEditorial.js
      markdown.js
      exampleCompiler.js
      exampleRenderer.js
      theoryExerciseEmbeds.js
    workers/
      compileWorker.js
  tests/
    metadata-validation.test.mjs
    document-roundtrip.test.mjs
    framework-compilation.test.mjs
    example-editorial.test.mjs
    favorites-store.test.mjs
    theory-document.test.mjs
    theory-exercise-embeds.test.mjs
```

### Descripcion de archivos importantes

#### `server.js`

Backend Express. Lee y escribe el filesystem, construye el arbol, crea contenido, compila documentos y sirve assets.

#### `src/main.js`

Punto de entrada del frontend. Instancia y coordina todos los componentes.

#### `src/components/Sidebar.js`

Construye el arbol lateral con capitulos, secciones y topics.

#### `src/components/TheoryViewer.js`

Pide `main.md`, lo renderiza como HTML a partir de Markdown y resuelve embeds inline de ejercicios.

#### `src/components/Editor.js`

Configura paneles dinamicos de CodeMirror, soporta layout `Panels/Tabs`, ejercicio, archivos virtuales, resaltado GLSL para `vertex` y `fragment`, y maneja guardar, cargar, modificar, renombrar y eliminar.

#### `src/components/ExercisePanel.js`

Panel superior del modo ejercicio: instrucciones, pistas, comparacion y controles de revelado.

#### `src/components/Preview.js`

Coordina la compilacion, la consola runtime, el panel shader y construye el documento final que se inyecta en el `iframe` de preview.

#### `src/components/Gallery.js`

Muestra tarjetas con mini previews de los ejemplos de un topic, overlays editoriales y estados de progresion.

#### `src/components/CreateDialog.js`

Maneja el dialogo para crear nuevos nodos de contenido.

#### `src/utils/api.js`

Capa de acceso a la API del backend.

#### `src/utils/exampleEditorial.js`

Helpers de formato para descripcion, rating e importance de la metadata editorial.

#### `src/utils/compileClient.js`

Cliente de compilacion del frontend. Usa `Web Worker` y fallback directo al backend.

#### `src/utils/compileCache.js`

Helpers para claves estables y clonacion serializable de resultados de compilacion.

#### `src/utils/exerciseComparison.js`

Resuelve pares intento/solucion y genera comparaciones por linea para el modo ejercicio.

#### `src/utils/markdown.js`

Parser y generador del formato Markdown usado para los ejemplos, incluyendo metadata simple.

#### `src/utils/exampleCompiler.js`

Pipeline de compilacion para `Pug`, `SCSS`, `SASS`, `TypeScript`, React y Vue.

#### `src/utils/exampleRenderer.js`

Convierte el documento compilado en el `srcdoc` final del `iframe`.

#### `src/utils/theoryExerciseEmbeds.js`

Extrae `[[exercise:...]]`, genera embeds inline y prepara previews pequenos para Theory.

#### `src/workers/compileWorker.js`

Worker del frontend para cachear y deduplicar compilaciones repetidas.

## Detalles importantes de funcionamiento

### Diferencia entre teoria y ejemplos

- la teoria vive en `main.md`
- los ejemplos viven en `examples/*.md`

La teoria ya se puede editar desde la UI:

- el panel de Theory tiene un boton para abrir `main.md` dentro del editor
- al terminar, una palomita en el preview cierra esa sesion y restaura el ejemplo o la galeria anterior
- `main.md` tambien puede incrustar ejercicios del topic con `[[exercise:archivo.md]]`

### El contenido es editable directamente en disco

Como no hay base de datos:

- puedes versionar `material/` con Git
- puedes crear o modificar archivos manualmente fuera de la app
- al recargar la app, el arbol se reconstruye leyendo el filesystem

### La galeria no es solo una lista

Cada tarjeta intenta cargar el ejemplo, compilarlo si hace falta y renderizar una mini preview en un `iframe`.

Ademas:

- puede mostrar metadata editorial en hover
- puede ocultar ese overlay sin desactivar el click normal de la card
- los favoritos reutilizan el mismo tipo de preview

### Los editores son dinamicos

La interfaz ya no asume tres paneles fijos.

Segun el ejemplo cargado, puede mostrar:

- `HTML`
- `SVG`
- `Pug`
- `CSS`
- `SCSS`
- `SASS`
- `JavaScript`
- `TypeScript`
- `JSX`
- `TSX`

Ademas incluye:

- resize vertical entre paneles
- switch entre `Panels` y `Tabs`
- colapsar paneles
- maximizar un panel
- aumentar y disminuir tamano de fuente
- auto-fit de paneles segun contenido
- resaltado GLSL para bloques `Vertex` y `Fragment`

### Las etiquetas de archivo ya se pueden editar

La etiqueta de lenguaje de cada archivo real o bloque legacy ya no es solo decorativa.

Puedes hacer click en etiquetas como `HTML`, `CSS`, `JSX`, `TSX`, `Vue`, `Vertex` o `Fragment` para abrir un popup que evalua el cambio antes de aplicarlo.

Comportamiento actual:

- el popup muestra la etiqueta actual y la etiqueta destino
- solo lista cambios compatibles para el archivo seleccionado
- si la transicion esta bloqueada, la UI explica la razon y mantiene `Apply` deshabilitado
- en virtual files, hace preview del rename del `path` cuando la extension debe cambiar
- si el archivo es el `entry`, el editor tambien mantiene sincronizado `metadata.entry`
- si el archivo estaba oculto por `editor_hidden_files`, ese estado oculto se conserva aunque cambie la extension
- si el archivo esta bloqueado por metadata de ejercicio, el cambio de etiqueta queda bloqueado

Ejemplos:

- `HTML -> Pug`
- `CSS -> SCSS`
- `src/main.jsx -> src/main.tsx`
- `src/styles.css -> src/styles.scss`

Nota importante:

- esta funcionalidad cambia el tipo o lenguaje declarado de forma segura, pero no reescribe el contenido por ti
- si el contenido deja de ser valido para la nueva etiqueta, el sistema lo reporta despues con los diagnosticos normales

### Modo Vim

El editor puede trabajar en modo Vim y arranca activado por defecto si `.vim_enable` esta en `true`.

Comportamiento actual:

- Vim funciona tanto en `Tabs` como en `Panels`
- el toggle superior de Vim permite desactivarlo temporalmente en la sesion actual
- el sidebar tiene un switch global `Vim Default` que persiste el valor en `.vim_enable`
- el clipboard del sistema tambien tiene modo global en `.clipboard_default`
- el mapa de shortcuts se puede sobrescribir desde [vim-shortcuts.yaml](./vim-shortcuts.yaml)
- existe un indicador flotante de modo (`NORMAL`, `INSERT`, `VISUAL`, `VISUAL BLOCK`, etc.)

`vim-shortcuts.yaml` usa contexts `global`, `tabs`, `panels` y `shaders`, con buckets `shift`, `leader` y `leader2`. Si el archivo falta o es invalido, la app vuelve automaticamente al mapa por defecto.

Atajos adicionales del proyecto sobre Vim:

- `Shift+H`: tab anterior en `Tabs`, o abrir `Open File` en `Panels`
- `Shift+L`: tab siguiente en `Tabs`, o alternar auto-render en `Panels`
- `Shift+J`: abrir `Open File` en `Tabs`, o bajar al siguiente panel en `Panels`
- `Shift+K`: alternar auto-render en `Tabs`, o subir al panel anterior en `Panels`
- `Shift+X`: mostrar u ocultar la barra superior del preview
- `Shift+C`: mostrar u ocultar la consola del preview en ejemplos web
- `Space` luego `e`: mostrar u ocultar el tree
- `Space` luego `m`: colapsar el tree y dejar editor/preview en `50/50`
- `Space` luego `h`: ejecutar `:noh`
- `Space` luego `c`: colapsar o expandir el panel activo en `Panels`
- `Space` luego `x`: maximizar o restaurar el panel activo en `Panels`
- `Space` luego `a`: ejecutar `auto-fit` en `Panels`
- `Space` luego `v`: normalizar `Panels` y dejar las ventanas equidistantes
- `Space` luego `Space` luego `v`: alternar entre `Tabs` y `Panels`
- `Space` luego `Space` luego `n`: abrir la lista contextual de shortcuts

Notas para `Panels`:

- el panel activo se resalta visualmente y es el que manda el indicador global de modo Vim
- si estas en `Panels` y un panel esta maximizado, `Shift+J/K` transfieren ese maximize al siguiente o anterior
- `Shift+J/K` funcionan con panels normales, colapsados o maximizados
- `Shift+J/K` hacen ciclo vertical: desde el ultimo vuelven al primero y viceversa
- `Space x` sigue siendo la salida explicita del modo maximizado

Atajos adicionales para documentos shader:

- `Space` luego `Space` luego `p`: pausar o reanudar el shader
- `Space` luego `Space` luego `c`: mostrar u ocultar `Shader Controls`
- `Space` luego `Space` luego `u`: abrir el dialogo de `Shader Uniforms`
- `Space` luego `Space` luego `t`: abrir el dialogo de `Shader Textures`
- `Space` luego `Space` luego `s`: abrir el panel shader del preview y ajustar su altura
- `Space` luego `Space` luego `r`: resetear el runtime shader

El clipboard del sistema se puede activar o desactivar desde el toggle azul del toolbar. Cuando esta activo, los yanks y pastes de Vim se sincronizan con el clipboard del sistema; cuando esta apagado, Vim usa un clipboard sombra local.

### Modo ejercicio

Cuando `exercise: true` esta presente:

- aparece un panel superior con instrucciones
- pueden existir pistas progresivas
- puede haber archivos bloqueados, de referencia o solucion ocultos
- puedes comparar intento vs solucion
- la comparacion puede venir del mismo Markdown o de otro ejemplo enlazado

La galeria tambien soporta `example_stage` para ordenar y etiquetar ejemplos como progresion didactica.

### Consola runtime

La consola no aparece siempre. Solo se activa si el ejemplo define:

```md
---
console: true
---
```

Capacidades actuales:

- logs, warnings y errores
- promesas rechazadas
- ejecucion manual de comandos
- filtros por nivel
- zoom de fuente
- colapsado y resize
- stacks runtime mas legibles
- deduplicacion de errores repetidos

### Modo shader

Cuando el documento es shader:

- el preview usa WebGL en vez del pipeline HTML habitual
- el panel inferior cambia de `Console` a `Shader`
- los controles editables viven en un drawer plegable al fondo del editor
- el shader arranca pausado por defecto
- el runtime expone estos uniforms built-in:
  - `u_time`
  - `u_delta`
  - `u_resolution`
  - `u_mouse`
  - `u_mouse_pressed`
  - `u_frame`
- el drawer del editor permite:
  - cambiar `width` y `height` con slider o input numerico
  - editar uniforms personalizados
  - inspeccionar estado de texturas locales
- el panel inferior permite:
  - ver `FPS`, resolucion efectiva y `frame`
  - elegir presets de resolucion
  - pausar, reanudar y resetear runtime
  - inspeccionar uniforms built-in
- si guardas o usas `Ctrl+S`, la resolucion actual del shader se persiste en `resolution: WIDTHxHEIGHT`

Ejemplos listos para probar:

- [ex01.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex01.md)
- [ex02.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex02.md)
- [ex03.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex03.md)
- [ex04.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex04.md)
- [ex05.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex05.md)
- [ex06.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex06.md)
- [ex07.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex07.md)
- [ex08.md](material/ch00-tests/sec02-shaders/top01-overview/examples/ex08.md)

### Responsive preview

El panel de preview tiene dos niveles de ancho:

- ancho general del panel preview, moviendo el separador entre editor y preview
- ancho interno del `iframe`, usando presets o slider manual

Si el viewport interno es mas pequeno que el panel general, se ve fondo negro detras.

### React y Vue

El proyecto ya cubre dos niveles pedagogicos:

- ejemplos atomicos `single-file`
- mini-proyectos `multi-file` dentro de un solo Markdown

Ejemplos listos para probar:

- [react-jsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-jsx.md)
- [react-jsx-css.md](material/ch00-tests/sec00-test/top00-test/examples/react-jsx-css.md)
- [react-tsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-tsx.md)
- [react-tsx-css.md](material/ch00-tests/sec00-test/top00-test/examples/react-tsx-css.md)
- [vue-javascript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-javascript.md)
- [vue-typescript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-typescript.md)
- [react-project-jsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-project-jsx.md)
- [react-project-tsx.md](material/ch00-tests/sec00-test/top00-test/examples/react-project-tsx.md)
- [vue-project-javascript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-project-javascript.md)
- [vue-project-sfc-typescript.md](material/ch00-tests/sec00-test/top00-test/examples/vue-project-sfc-typescript.md)

#### Limitaciones de React

- React `single-file` solo usa un bloque `JSX` o `TSX`
- React `single-file` no soporta `import` ni `export`
- React `single-file` exige un componente top-level llamado `App`
- React `single-file` no usa bloques `HTML`, `JavaScript` o `TypeScript` separados; el shell HTML y el montaje se generan automaticamente
- React `multi-file` si soporta `json` virtual, pero no assets binarios virtuales dentro del mismo Markdown

#### Limitaciones de Vue

- Vue `single-file` no usa formato `.vue`; usa un bloque `HTML` como template y un bloque `JavaScript` o `TypeScript` con `export default`
- Vue `single-file` no soporta imports relativos
- Vue `single-file` solo acepta `HTML` como template; `SVG`, `Pug` o `HTML-FULL` no aplican a ese modo
- Vue `multi-file` requiere `entry` valido en `JavaScript` o `TypeScript`
- los archivos `.vue` SFC solo existen en modo `multi-file`
- Vue SFC soporta un subconjunto controlado: `<template>` HTML normal, `<script>` o `<script setup>` en JS/TS, y estilos normales o `scss`/`sass`
- Vue SFC no soporta `template src`, `script src`, `style src`, CSS modules ni custom blocks
- Vue `multi-file` si soporta `json` virtual, pero no assets binarios virtuales dentro del mismo Markdown

## Limitaciones actuales

- no hay autenticacion ni control de permisos
- no hay base de datos
- `npm run preview` no representa un despliegue completo del proyecto

Limitaciones tecnicas actuales:

- el frontmatter no es YAML completo; solo soporta pares simples `clave: valor`
- React `single-file` solo admite un bloque `JSX` o `TSX`
- React `single-file` no soporta `import` ni `export` dentro del ejemplo
- React `single-file` exige una funcion o componente top-level llamada `App`
- Vue `single-file` no usa `.vue` y requiere `HTML` como template
- Vue `single-file` no soporta imports relativos
- Vue `multi-file` requiere `entry` valido en `JavaScript` o `TypeScript`
- los proyectos `React` y `Vue` multi-file si soportan archivos `json` virtuales
- los proyectos multi-file no soportan todavia assets binarios virtuales como `png`, `jpg`, `woff` o `mp4`
- los documentos shader son V1: un solo canvas y un solo pass
- el modo shader no soporta todavia multipass, framebuffer ping-pong ni audio-reactive shaders
- el modo shader no soporta virtual files ni proyectos shader multi-file
- los shaders solo soportan uniforms personalizados simples por metadata (`float`, `int`, `bool`, `vec2`, `vec3`, `vec4`)
- los sliders por metadata solo aplican a uniforms `float` e `int`
- las texturas shader por metadata solo soportan archivos del topic actual y no admiten subcarpetas dentro de `assets/`
- los shaders no soportan todavia arrays ni structs como uniforms definidos por metadata
- Vue SFC es controlado: no soporta `template src`, `script src`, `style src`, CSS modules ni custom blocks
- cambiar la etiqueta de un archivo no migra semanticamente el codigo; solo cambia el tipo declarado de forma segura
- para imagenes y recursos locales debes usar la carpeta `assets/` del topic
- el bundle de preview para React es grande porque empaqueta runtime en cada ejemplo
- algunas rutas de API codifican nombres de archivo y otras no, asi que nombres exoticos pueden generar problemas
- la compilacion sigue ocurriendo realmente en el backend; el `Web Worker` actual orquesta cache y deduplicacion, no reemplaza todavia el compilador de servidor

## Solucion de problemas

### La app abre pero no carga datos

Revisa:

- que `npm run dev` este corriendo
- que Vite este en `5174`
- que Express este en `3001`
- que exista la carpeta `material/`

### El sidebar aparece vacio

Posibles causas:

- `material/` no existe
- la estructura de nombres no respeta los prefijos `ch`, `sec`, `top`
- el backend no esta levantado

### El preview no muestra imagenes o recursos

Revisa:

- que el archivo exista en `assets/`
- que el topic actual sea el correcto
- que uses una ruta relativa valida desde el HTML del ejemplo

### Un ejemplo React no renderiza

Revisa:

- que el archivo tenga `framework: react` en el frontmatter
- que exista exactamente un bloque `JSX` o `TSX`
- que el archivo defina un componente top-level `App`
- que no uses `import` ni `export` en la version `single-file`
- que los errores de compilacion no aparezcan en la barra de estado del editor

### Un ejemplo Vue no renderiza

Revisa:

- que el archivo tenga `framework: vue` si aplica
- que el modo `single-file` use `HTML` como template
- que el modo `single-file` exporte `default`
- que el modo `multi-file` tenga `entry` valido
- que un `.vue` no use features fuera del alcance soportado

### La consola no aparece

Revisa:

- que el ejemplo tenga `console: true`
- que el preview no este en galeria sino en editor
- que la consola no este colapsada

### `Modify`, `Rename` o `Remove` estan deshabilitados

Eso es esperado si todavia no hay un archivo activo cargado. Primero debes:

- cargar un ejemplo existente
- o guardar uno nuevo con `Save`

### Quiero crear contenido manualmente

Puedes hacerlo directamente en disco respetando esta estructura:

```txt
material/chNN-mi-capitulo/secNN-mi-seccion/topNN-mi-topic/
  main.md
  examples/
    ex01.md
  assets/
```

Luego recarga la app para que el backend vuelva a leer el arbol.

## Estado actual del repositorio

Actualmente el repositorio ya trae contenido de ejemplo dentro de `material/`, incluyendo topics como:

- tests / test / test
- CSS / selectors
- SVG basics / coordinates
- JavaScript / basics

Eso permite abrir la app y probar el flujo sin tener que crear contenido desde cero.

La suite automatica actual cubre:

- parser y metadata
- round-trip de serializacion
- compilacion representativa de modos legacy, React y Vue
- ejercicios, consola y rendering basico
