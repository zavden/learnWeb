# Plan de Implementacion: React Single-File y Evolucion a Mini-Project

## Objetivo

Agregar soporte para aprender React dentro de este editor local con dos niveles de complejidad:

1. una primera version `single-file`, pensada para aprender React de forma atomica
2. una segunda version `mini-project`, pensada para ejemplos con multiples archivos y estructura mas real

La prioridad inmediata es implementar `single-file`, pero sin cerrar el camino de evolucion.

## Conclusion General

La mejor experiencia educativa para React en este proyecto no es `HTML + CSS + JS` clasico.

La mejor estructura inicial es:

- un editor principal de `JSX` o `TSX`
- un editor opcional de `CSS`
- consola opcional debajo del preview
- `HTML` base oculto y autogenerado por el sistema
- bootstrap de React oculto y autogenerado por el sistema

Razon:

- React ensena mejor componentes, props, state y effects si el alumno trabaja directo sobre el componente
- obligar a editar `HTML` manual en cada ejemplo agrega ruido pedagogico
- el `div#root` y el `mount` deben ser parte de la plataforma, no del ejercicio

## Evaluacion de Complejidad

### Single-File React

Complejidad estimada: `6/10`

Es viable porque el proyecto ya tiene:

- pipeline de compilacion centralizado en [src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js)
- render de preview centralizado en [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)
- vista de preview aislada en [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- editor dinamico por bloques en [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)

Lo que falta es:

- soporte de bloques `jsx` y `tsx`
- dependencias `react` y `react-dom`
- compilacion JSX/TSX
- renderer especial para montar React en `#root`

### Mini-Project React

Complejidad estimada: `8/10` a `9/10`

Sube mucho porque ya no alcanza con un solo documento Markdown.

Se necesitarian:

- multiples archivos por ejemplo
- resolucion de imports locales
- entrypoint explicito
- potencialmente multiples componentes y estilos
- manejo de errores mas parecido a un bundler

Conclusion:

- `single-file` debe salir primero
- `mini-project` debe disenarse desde ahora, pero no implementarse todavia

## Modelo Recomendado para Single-File

### Contrato de Markdown

El ejemplo debe declarar metadata para indicar que usa React.

Ejemplo recomendado:

```md
---
framework: react
console: true
---

# JSX
```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <main className="app">
      <h1>Hello React</h1>
      <button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}
```

# CSS
```css
.app {
  padding: 24px;
}
```
```

Version TypeScript:

```md
---
framework: react
console: true
---

# TSX
```tsx
function App() {
  const [count, setCount] = React.useState<number>(0);

  return (
    <main className="app">
      <button onClick={() => setCount(count + 1)}>
        {count}
      </button>
    </main>
  );
}
```
```

### Regla de montaje

El sistema debe asumir uno de estos contratos:

1. el usuario define `function App() { ... }`
2. la plataforma monta automaticamente `<App />`

Decision recomendada:

- pedir que el archivo defina `App`
- la plataforma hace el `createRoot(...).render(<App />)`

Razon:

- reduce boilerplate
- mantiene foco didactico en el componente
- deja claro cual es la unidad pedagogica principal

### Bloques visibles

Para `react-jsx`:

- `JSX`
- `CSS` opcional

Para `react-tsx`:

- `TSX`
- `CSS` opcional

No debe mostrarse panel HTML en la version educativa inicial.

## Arquitectura Recomendada para Single-File

### 1. Framework Mode

Agregar metadata `framework: react`.

Eso debe activar un pipeline especial:

- el markup deja de venir de `html/svg/pug`
- el entry principal pasa a ser `jsx` o `tsx`
- el renderer crea automaticamente un HTML base con `div#root`

### 2. Nuevos tipos de bloque

Agregar nuevos bloques:

- `jsx`
- `tsx`

Decision de slot:

- `jsx` y `tsx` deben vivir en un slot nuevo, por ejemplo `app`

No conviene meterlos en `markup` ni en `script`, porque conceptualmente son ambas cosas a la vez.

### 3. Compilacion

El compilador debe:

- transpilar `jsx` a JavaScript ejecutable
- transpilar `tsx` a JavaScript ejecutable
- inyectar imports o globals de React y ReactDOM
- compilar `css/scss/sass` como ya ocurre hoy

Decision recomendada:

- usar `esbuild` para `jsx` y `tsx`

Razon:

- rapido
- simple
- soporta JSX y TSX
- sirve tanto para `single-file` como para la futura version `mini-project`

### 4. Runtime de React

El preview debe cargar React y ReactDOM dentro del documento renderizado.

Opciones:

1. bundlear React dentro del JS compilado
2. exponer `React` y `ReactDOM` como globals inyectados por el renderer

Decision recomendada para primera version:

- compilar con imports controlados y resolverlos desde el pipeline

Si eso complica demasiado la primera iteracion:

- exponer `React` y `ReactDOM` como globals y documentarlo claramente

### 5. Renderer

El renderer para React debe generar algo como:

```html
<body>
  <div id="root"></div>
  <script>
    // runtime React
    // codigo compilado del ejemplo
    // mount automatico de App
  </script>
</body>
```

Esto debe ser distinto del renderer actual orientado a `html/css/js`.

## Fases de Implementacion para Single-File

## Fase 1: Metadata y Modelo

Objetivo:

- soportar `framework: react`

Cambios:

- extender [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)
- agregar `metadata.framework`
- validar combinaciones permitidas

Reglas:

- `framework: react` requiere `jsx` o `tsx`
- no debe coexistir con `html/svg/pug` en la misma sesion

## Fase 2: Registro de Bloques y Presets

Objetivo:

- introducir `jsx` y `tsx` en el sistema

Cambios:

- extender [src/config/exampleBlocks.js](/home/zavden/Learning/Web/learnWeb/src/config/exampleBlocks.js)
- agregar presets como:
  - `react-jsx`
  - `react-jsx-css`
  - `react-tsx`
  - `react-tsx-css`

Resultado esperado:

- el editor puede mostrar un panel `JSX` o `TSX` mas `CSS`

## Fase 3: Compilacion React

Objetivo:

- compilar JSX/TSX a JS ejecutable

Cambios:

- agregar dependencias `react`, `react-dom`, `esbuild`
- extender [src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js)
- agregar pipeline de React separado del pipeline actual

Resultado esperado:

- el componente `App` compila y queda listo para montarse

## Fase 4: Renderer React

Objetivo:

- montar React automaticamente en el preview

Cambios:

- extender [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)
- generar `#root`
- montar `App`

Resultado esperado:

- el usuario ve su componente sin escribir HTML base

## Fase 5: UI Educativa

Objetivo:

- que React se sienta como modo propio y no como parche

Cambios:

- badges nuevos para `JSX` y `TSX`
- crear ejemplos base en `material/`
- preparar mensajes de error comprensibles

Resultado esperado:

- el alumno entiende que esta editando un componente, no una pagina clasica

## Fase 6: Consola React

Objetivo:

- reutilizar la futura consola para ver orden de ejecucion, warnings y errores

Cambios:

- la consola del plan principal debe integrarse tambien con el modo React

Resultado esperado:

- `console.log`, errores de render y warnings observables del runtime aparecen en el panel

## Estructura Recomendada para Aprender React de Forma Atomica

### Nivel 1: Componentes puros

Solo `JSX` o `TSX`.

Meta pedagogica:

- entender JSX
- props
- render condicional
- listas

### Nivel 2: Estado y eventos

`JSX/TSX` + consola opcional.

Meta pedagogica:

- `useState`
- eventos
- orden de ejecucion
- re-render

### Nivel 3: Efectos y estilos

`JSX/TSX` + `CSS`

Meta pedagogica:

- `useEffect`
- clases dinamicas
- UI mas real

### Nivel 4: Componentes mas largos

Seguir `single-file`, pero con componentes internos dentro del mismo editor.

Ejemplo:

```jsx
function Counter({ value, onIncrement }) {
  return <button onClick={onIncrement}>{value}</button>;
}

function App() {
  const [count, setCount] = React.useState(0);
  return <Counter value={count} onIncrement={() => setCount(count + 1)} />;
}
```

Esta fase sigue siendo didacticamente util y evita entrar todavia a imports locales.

## Diseno Objetivo para Mini-Project

### Objetivo

Permitir ejemplos React mas reales con multiples archivos, sin perder la simplicidad del flujo educativo.

### Estructura recomendada

En vez de un solo `.md`, cada ejemplo de proyecto debe ser una carpeta.

Ejemplo:

```text
examples/
  ex-project-counter/
    project.json
    App.tsx
    Counter.tsx
    styles.css
    main.md
```

### Archivos propuestos

- `project.json`
  - framework
  - entry
  - archivos visibles
  - configuracion de consola
- `main.md`
  - teoria o instrucciones del ejercicio
- archivos fuente reales
  - `App.tsx`
  - `Button.tsx`
  - `styles.css`

### Por que no conviene meter el mini-project en un solo Markdown

- imports locales se vuelven artificiales
- navegar multiples componentes dentro de un markdown enorme es malo
- la UX deja de ser clara

Conclusion:

- `single-file` y `mini-project` deben convivir como dos modos distintos

## Decisiones para No Romper la Evolucion

### 1. `esbuild` desde el inicio

Aunque la primera version sea single-file, el compilador debe montarse sobre `esbuild`, no sobre hacks de transpile aislado.

### 2. Metadata de framework

No deducir React solo por encontrar `jsx` o `tsx`.

Usar metadata explicita:

- `framework: react`

Eso ayuda a distinguir entre:

- sesion web clasica
- sesion React
- futura sesion mini-project

### 3. Slot `app`

Crear desde ahora un slot dedicado para bloques de aplicacion React.

Eso evita forzar `jsx/tsx` dentro de `script`, que despues dificultaria el salto a multiples archivos.

### 4. Renderer por framework

No meter todo en un solo renderer monolitico.

Direccion correcta:

- renderer web clasico
- renderer react single-file
- renderer futuro mini-project

## Riesgos

### 1. Dependencias nuevas

React necesita dependencias nuevas y eso aumenta el peso del proyecto.

### 2. Mensajes de error

Errores de JSX/TSX pueden ser mas confusos que los de JS clasico.

### 3. UX de editor

Si el usuario espera escribir HTML manual, React puede parecer raro si no se deja claro el contrato del modo.

### 4. Mini-project prematuro

Si intentamos resolver imports y multiples archivos demasiado pronto, se frena la entrega del modo educativo util.

## Alcance de la Primera Entrega Recomendada

### Incluye

- `framework: react`
- bloques `jsx` y `tsx`
- panel `CSS` opcional
- montaje automatico de `App`
- compilacion con React
- ejemplos base para aprender componentes y estado

### No incluye todavia

- multiples archivos
- imports locales arbitrarios
- alias de rutas
- package manager por ejemplo
- npm dependencies por ejemplo

## Criterios de Aceptacion

- un ejemplo con `framework: react` y `jsx` se renderiza correctamente
- un ejemplo con `framework: react` y `tsx` se renderiza correctamente
- el alumno no necesita escribir `div#root`
- el alumno no necesita escribir `ReactDOM.createRoot(...)`
- el panel HTML no aparece en el modo React single-file
- `CSS` opcional sigue aplicando correctamente
- los errores de compilacion se muestran de forma entendible

## Archivos que Seguramente Cambiaran

- [PLAN_RECT.md](/home/zavden/Learning/Web/learnWeb/PLAN_RECT.md)
- [package.json](/home/zavden/Learning/Web/learnWeb/package.json)
- [server.js](/home/zavden/Learning/Web/learnWeb/server.js)
- [src/utils/markdown.js](/home/zavden/Learning/Web/learnWeb/src/utils/markdown.js)
- [src/config/exampleBlocks.js](/home/zavden/Learning/Web/learnWeb/src/config/exampleBlocks.js)
- [src/utils/exampleCompiler.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleCompiler.js)
- [src/utils/exampleRenderer.js](/home/zavden/Learning/Web/learnWeb/src/utils/exampleRenderer.js)
- [src/components/Editor.js](/home/zavden/Learning/Web/learnWeb/src/components/Editor.js)
- [src/components/Preview.js](/home/zavden/Learning/Web/learnWeb/src/components/Preview.js)
- [src/style.css](/home/zavden/Learning/Web/learnWeb/src/style.css)

## Estado

Listo para implementar la version `single-file`.

Orden recomendado de ejecucion:

1. metadata `framework: react`
2. bloques `jsx/tsx`
3. compilacion con `esbuild`
4. renderer React con `#root`
5. presets y ejemplos
6. integracion posterior con consola
