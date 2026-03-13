# LearnCode

Aplicacion local para estudiar tecnologias web a partir de material organizado en carpetas y archivos Markdown.

La app combina:

- un frontend con Vite y JavaScript vanilla
- un backend con Express
- edicion de codigo con CodeMirror 6
- renderizado de teoria en Markdown
- previsualizacion en vivo en un `iframe`
- compilacion local de `Pug`, `SCSS`, `SASS`, `TypeScript` y React `single-file`

La idea central del proyecto es simple: el contenido no vive en una base de datos, vive en el filesystem dentro de la carpeta `material/`. El backend solo lee y escribe esos archivos, y el frontend actua como explorador, editor y visor.

## Tabla de contenido

- [Resumen](#resumen)
- [Tecnologias](#tecnologias)
- [Arquitectura general](#arquitectura-general)
- [Como se organiza el contenido](#como-se-organiza-el-contenido)
- [Formato de los archivos](#formato-de-los-archivos)
- [Flujo de uso dentro de la app](#flujo-de-uso-dentro-de-la-app)
- [Instalacion](#instalacion)
- [Ejecucion en desarrollo](#ejecucion-en-desarrollo)
- [Comandos disponibles](#comandos-disponibles)
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
- trabajar con ejemplos compilados (`Pug`, `SCSS`, `SASS`, `TypeScript`)
- trabajar con ejemplos React `single-file` usando `JSX` o `TSX`
- crear, guardar, modificar, renombrar y eliminar ejemplos
- crear nuevos capitulos, secciones, topics y ejemplos

## Tecnologias

### Frontend

- Vite
- JavaScript vanilla con modulos ES
- CodeMirror 6
- `marked` para renderizar Markdown
- React y ReactDOM para el modo React `single-file`

### Backend

- Node.js
- Express
- CORS
- `fs` y `path` del runtime de Node para operar sobre el filesystem
- `pug` para compilar ejemplos `Pug`
- `sass` para compilar `SCSS` y `SASS`
- `typescript` para transpilar `TypeScript`
- `esbuild` para compilar `JSX` y `TSX`

## Arquitectura general

La app esta dividida en dos procesos:

### 1. Frontend

Se sirve con Vite en `http://localhost:5173`.

Responsabilidades:

- dibujar la interfaz
- cargar el arbol de navegacion
- cargar teoria y ejemplos
- mostrar la galeria
- montar paneles dinamicos de edicion
- actualizar el preview en vivo
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

### Comunicacion entre ambos

Durante desarrollo, Vite hace proxy de las rutas `/api` hacia `http://localhost:3001`.

Eso significa que el frontend hace peticiones como:

```txt
/api/tree
/api/topic/ch01-css/sec01-selectors/top01-class-selector/main
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

- `ch01-css`
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
- `HTML + CSS`
- `HTML + CSS + JavaScript`
- `SVG + CSS`
- `Pug + SCSS`
- `Pug + TypeScript`
- `HTML + SASS + TypeScript`

Los paneles visibles del editor dependen de los bloques reales del archivo.

#### Frontmatter simple

El archivo puede arrancar con metadata simple:

~~~~md
---
framework: react
---
~~~~

Notas:

- el parser actual soporta pares `clave: valor` simples
- no es un parser YAML completo
- hoy se usa sobre todo para `framework: react`

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

Cuando eliges un ejemplo desde la galeria o desde el boton `Load`:

- se pide el archivo Markdown al backend
- se parsean los bloques y la metadata
- cada bloque visible se carga en su editor correspondiente
- el preview se actualiza automaticamente

### 4. Edicion y preview

Cada vez que cambias codigo:

- el editor dispara un callback
- el preview espera 300 ms
- el backend compila el documento si hace falta
- se reconstruye un documento HTML completo dentro del `iframe`
- se inyecta el resultado compilado actual

Si el JavaScript lanza un error, el preview intenta mostrar el mensaje al final del `body`.

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
- sesiones con `SCSS`, `SASS` y `TypeScript`
- React `single-file` con `JSX` o `TSX`

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

- Vite en `http://localhost:5173`
- Express en `http://localhost:3001`

Luego abres:

```txt
http://localhost:5173
```

## Comandos disponibles

### `npm run dev`

Levanta frontend y backend de desarrollo en paralelo.

### `npm run build`

Genera el build del frontend con Vite.

Importante:

- este comando no empaqueta ni despliega el backend
- el proyecto no trae una estrategia de produccion completa lista

### `npm run preview`

Levanta el preview estatico del frontend generado por Vite.

Importante:

- no arranca `server.js`
- no reemplaza el flujo completo de desarrollo
- para usar la app normalmente necesitas tambien el backend

## API del backend

### `GET /api/tree`

Devuelve el arbol completo de navegacion.

### `GET /api/topic/:ch/:sec/:top/main`

Devuelve el contenido de `main.md`.

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
- React `single-file`

### `GET /api/topic/:ch/:sec/:top/assets/:file`

Sirve un archivo dentro de la carpeta `assets/` del topic actual.

## Estructura del proyecto

```txt
learnWeb/
  index.html
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
    components/
      Sidebar.js
      TheoryViewer.js
      Editor.js
      Preview.js
      Gallery.js
      CreateDialog.js
    utils/
      api.js
      markdown.js
      exampleCompiler.js
      exampleRenderer.js
```

### Descripcion de archivos importantes

#### `server.js`

Backend Express. Lee y escribe el filesystem, construye el arbol, crea contenido, compila documentos y sirve assets.

#### `src/main.js`

Punto de entrada del frontend. Instancia y coordina todos los componentes.

#### `src/components/Sidebar.js`

Construye el arbol lateral con capitulos, secciones y topics.

#### `src/components/TheoryViewer.js`

Pide `main.md` y lo renderiza como HTML a partir de Markdown.

#### `src/components/Editor.js`

Configura paneles dinamicos de CodeMirror, sincroniza el preview y maneja guardar, cargar, modificar, renombrar y eliminar.

#### `src/components/Preview.js`

Coordina la compilacion y construye el documento final que se inyecta en el `iframe` de preview.

#### `src/components/Gallery.js`

Muestra tarjetas con mini previews de los ejemplos de un topic.

#### `src/components/CreateDialog.js`

Maneja el dialogo para crear nuevos nodos de contenido.

#### `src/utils/api.js`

Capa de acceso a la API del backend.

#### `src/utils/markdown.js`

Parser y generador del formato Markdown usado para los ejemplos, incluyendo metadata simple.

#### `src/utils/exampleCompiler.js`

Pipeline de compilacion para `Pug`, `SCSS`, `SASS`, `TypeScript` y React `single-file`.

#### `src/utils/exampleRenderer.js`

Convierte el documento compilado en el `srcdoc` final del `iframe`.

## Detalles importantes de funcionamiento

### Diferencia entre teoria y ejemplos

- la teoria vive en `main.md`
- los ejemplos viven en `examples/*.md`

No existe en este proyecto un editor visual para modificar `main.md` desde la UI. La teoria solo se visualiza.

### El contenido es editable directamente en disco

Como no hay base de datos:

- puedes versionar `material/` con Git
- puedes crear o modificar archivos manualmente fuera de la app
- al recargar la app, el arbol se reconstruye leyendo el filesystem

### La galeria no es solo una lista

Cada tarjeta intenta cargar el ejemplo, compilarlo si hace falta y renderizar una mini preview en un `iframe`.

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
- colapsar paneles
- maximizar un panel
- aumentar y disminuir tamano de fuente
- auto-fit de paneles segun contenido

### Responsive preview

El panel de preview tiene dos niveles de ancho:

- ancho general del panel preview, moviendo el separador entre editor y preview
- ancho interno del `iframe`, usando presets o slider manual

Si el viewport interno es mas pequeno que el panel general, se ve fondo gris detras.

### React `single-file`

El modo React actual esta pensado para aprendizaje atomico:

- un bloque `JSX` o `TSX`
- `CSS` opcional
- shell HTML oculto
- montaje automatico de `App`

Ejemplos listos para probar:

- [react-jsx.md](/home/zavden/Learning/Web/learnWeb/material/ch00-tests/sec00-test/top00-test/examples/react-jsx.md)
- [react-jsx-css.md](/home/zavden/Learning/Web/learnWeb/material/ch00-tests/sec00-test/top00-test/examples/react-jsx-css.md)
- [react-tsx.md](/home/zavden/Learning/Web/learnWeb/material/ch00-tests/sec00-test/top00-test/examples/react-tsx.md)
- [react-tsx-css.md](/home/zavden/Learning/Web/learnWeb/material/ch00-tests/sec00-test/top00-test/examples/react-tsx-css.md)

## Limitaciones actuales

- no hay autenticacion ni control de permisos
- no hay base de datos
- no hay edicion de `main.md` desde la interfaz
- `npm run preview` no representa un despliegue completo del proyecto
- no existe todavia consola de runtime dentro de la app
- React solo existe en modo `single-file`

Limitaciones tecnicas actuales:

- el frontmatter no es YAML completo; solo soporta pares simples `clave: valor`
- React `single-file` no soporta `import` ni `export` dentro del ejemplo
- React `single-file` exige una funcion o componente top-level llamada `App`
- React `single-file` no soporta multiples archivos todavia
- el bundle de preview para React es grande porque empaqueta runtime en cada ejemplo
- algunas rutas de API codifican nombres de archivo y otras no, asi que nombres exoticos pueden generar problemas

## Solucion de problemas

### La app abre pero no carga datos

Revisa:

- que `npm run dev` este corriendo
- que Vite este en `5173`
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

### `Modify`, `Rename` o `Remove` estan deshabilitados

Eso es esperado si todavia no hay un archivo activo cargado. Primero debes:

- cargar un ejemplo existente
- o guardar uno nuevo con `Save`

### Quiero crear contenido manualmente

Puedes hacerlo directamente en disco respetando esta estructura:

```txt
material/ch04-mi-capitulo/sec01-mi-seccion/top01-mi-topic/
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
