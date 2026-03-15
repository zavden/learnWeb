# Guia para IAs: Como Usar LearnWeb

Este archivo explica paso a paso como orientarte en este proyecto para poder trabajar con el, ya sea creando contenido educativo, modificando la app, o entendiendo su arquitectura.

## Paso 1: Entiende que es LearnWeb

LearnWeb es una app local para aprender desarrollo web. Funciona asi:

- El contenido educativo vive en `material/` como archivos Markdown.
- La app lee esos archivos, los compila (Pug, SCSS, TypeScript, React, Vue, shaders) y los muestra en un editor con preview en vivo.
- No hay base de datos. Todo es archivos en disco.

La estructura de contenido es jerarquica:

```
material/
  ch01-templates/           # capitulo
    sec01-vanilla/           # seccion
      top06-html-css-js/     # topic
        main.md              # teoria (explicacion del tema)
        examples/            # ejemplos ejecutables
          ex01.md
          ex02.md
        assets/              # recursos (imagenes, texturas)
```

## Paso 2: Lee el archivo de orientacion correcto

Dependiendo de lo que necesites hacer, lee UNO de estos archivos:

| Quiero... | Lee primero |
|-----------|-------------|
| Crear o editar un ejemplo | `skills/learnweb-example-authoring/SKILL.md` |
| Escribir o editar teoria | `skills/learnweb-theory-authoring/SKILL.md` |
| Crear o editar un shader | `skills/learnweb-shader-authoring/SKILL.md` |
| Modificar la app (editor, preview, etc.) | `AGENTS.md` y luego `skills/learnweb-repo-editing/references/hotspots.md` |
| Entender la arquitectura general | `AGENTS.md` |

No necesitas leerlos todos. Elige el que corresponde a tu tarea.

## Paso 3: Aprende el formato leyendo ejemplos existentes

Antes de crear contenido nuevo, lee 2-3 ejemplos existentes del mismo tipo. Esto te da el tono, el nivel de detalle y el formato exacto.

### Donde encontrar ejemplos de cada tipo

| Tipo | Ruta de ejemplo |
|------|-----------------|
| HTML/CSS/JS vanilla | `material/ch01-templates/sec01-vanilla/top06-html-css-javascript/examples/` |
| HTML-FULL | `material/ch01-templates/sec01-vanilla/top04-html-full/examples/` |
| SVG | `material/ch01-templates/sec01-vanilla/top09-svg/examples/` |
| Pug + SCSS | `material/ch01-templates/sec01-vanilla/top14-pug-scss/examples/` |
| React single-file | `material/ch01-templates/sec02-react/top02-single-file-jsx/examples/` |
| React multi-file | `material/ch01-templates/sec02-react/top06-project-jsx/examples/` |
| Vue single-file | `material/ch01-templates/sec03-vue/top02-single-file-javascript/examples/` |
| Vue multi-file | `material/ch01-templates/sec03-vue/top05-project-javascript/examples/` |
| Vue SFC multi-file | `material/ch01-templates/sec03-vue/top07-project-sfc-javascript/examples/` |
| Shader | `material/ch00-tests/sec02-shaders/top01-overview/examples/` |
| Ejercicio vanilla | `material/ch00-tests/sec00-test/top00-test/examples/exercise-html.md` |
| Ejercicio React | `material/ch00-tests/sec00-test/top00-test/examples/exercise-react.md` |
| Teoria con embeds | `material/ch01-templates/sec01-vanilla/top01-overview/main.md` |

### Que observar al leer un ejemplo

1. La estructura del frontmatter (que campos usa, cuales omite).
2. Como se nombran los bloques (`# HTML`, `# CSS`, `# JavaScript`).
3. En multi-file: el orden de `## @file`, `## @lang`, `## @role`.
4. El nivel de complejidad del codigo (simple, didactico, sin sobreingenieria).
5. Si tiene metadata editorial (`example_description`, `example_tags`, etc.).

## Paso 4: Crea contenido nuevo

### Para crear un ejemplo nuevo

1. Elige el topic donde va (`material/chXX/secXX/topXX/examples/`).
2. Lee el skill de referencia: `skills/learnweb-example-authoring/SKILL.md`.
3. Lee 1-2 ejemplos existentes en el mismo topic para ver el formato exacto.
4. Crea un archivo `.md` en la carpeta `examples/` con el formato correcto.
5. Verifica: el frontmatter es valido, los bloques estan bien formados, los paths de archivos virtuales tienen extension correcta.

### Para crear un ejercicio

Los ejercicios son ejemplos con frontmatter adicional. Pasos:

1. Lee `skills/learnweb-example-authoring/SKILL.md` seccion "Format Reference: Exercise".
2. Elige el formato base (vanilla, React, Vue, etc.) segun el topic.
3. Crea el archivo `.md` con el frontmatter de ejercicio obligatorio:
   ```yaml
   exercise: true
   exercise_title: "Titulo claro y conciso"
   exercise_instructions: "Paso 1 || Paso 2 || Paso 3"
   example_stage: exercise
   ```
4. Opciones adicionales utiles:
   - `exercise_hints: "Pista 1 || Pista 2"` — pistas revelables
   - `exercise_locked_files: archivo1,archivo2` — archivos que el alumno no puede editar
   - `exercise_solution_example: solucion.md` — archivo separado con la solucion
   - `exercise_compare_pairs: src/App.jsx=>src/solution/AppSolution.jsx` — diff lado a lado
   - `exercise_reference_files: src/data/datos.json` — archivos revelables de referencia
   - `exercise_solution_files: src/solution/AppSolution.jsx` — archivos de solucion
5. El codigo inicial del ejercicio debe tener TODOs claros o partes incompletas que el alumno debe completar.
6. Si creas un archivo de solucion separado, usa el mismo formato que el ejercicio pero con el codigo completo.

**Ejemplo rapido de ejercicio vanilla:**
```markdown
---
exercise: true
exercise_title: "Centrar un div"
exercise_instructions: "Usa flexbox en el container || Centra el .box horizontal y verticalmente || El .box debe tener 100px x 100px"
exercise_hints: "display: flex || justify-content y align-items || width y height"
example_stage: exercise
---

# HTML

```html
<div class="container">
  <div class="box">Centrado</div>
</div>
```

# CSS

```css
.container {
  width: 100%;
  height: 100vh;
  /* TODO: usa flexbox para centrar */
}

.box {
  background: #3b82f6;
  color: white;
  /* TODO: define el tamano */
}
```
```

**Ejemplo rapido de ejercicio React multi-file:**
```markdown
---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_title: "Componente contador"
exercise_instructions: "Importa useState || Crea el state count || Renderiza un boton que incremente"
exercise_hints: "const [count, setCount] = useState(0) || onClick={() => setCount(c => c + 1)}"
exercise_locked_files: src/main.jsx,src/styles.css
example_stage: exercise
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
import React from 'react';
// TODO: importa useState

export function App() {
  // TODO: crea el state count

  return (
    <div>
      <h1>Contador</h1>
      {/* TODO: boton que incremente count */}
    </div>
  );
}
```

## @file src/styles.css
## @lang css
## @role style

```css
body { margin: 0; padding: 16px; font-family: system-ui; }
```
```

### Para crear teoria nueva

1. Lee el skill: `skills/learnweb-theory-authoring/SKILL.md`.
2. Edita o crea el archivo `main.md` en el topic.
3. Si referencias ejercicios con `[[exercise:ex01.md]]`, verifica que el archivo exista en `examples/`.

### Para crear un shader

1. Lee el skill: `skills/learnweb-shader-authoring/SKILL.md`.
2. Siempre incluye `renderer: shader` y `resolution: WIDTHxHEIGHT`.
3. No redeclares los built-in uniforms (`u_time`, `u_resolution`, etc.).
4. Si usas texturas, pon los archivos en `assets/` del topic.

### Para crear un topic completo nuevo

1. Crea la carpeta: `material/chXX-nombre/secXX-nombre/topXX-nombre/`.
2. Crea `main.md` con la teoria.
3. Crea `examples/` con al menos un ejemplo.
4. Opcionalmente crea `assets/` si necesitas imagenes o texturas.
5. La app detecta la estructura automaticamente al recargar.

## Paso 5: Valida tu trabajo

| Que hiciste | Como validar |
|-------------|--------------|
| Solo contenido (material/) | Revisa que el Markdown esta bien formado |
| Contenido que usa formatos complejos | `npm test` |
| Cambios en la app | `npm test` y luego `npm run build` |

## Resumen rapido de formatos

### Vanilla (bloques legacy)
```markdown
# HTML
```html
<div>contenido</div>
```
# CSS
```css
body { margin: 0; }
```
# JavaScript
```javascript
console.log('hello');
```
```

### React multi-file (virtual files)
```markdown
---
framework: react
mode: multi-file
entry: src/main.jsx
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
export function App() { return <h1>Hello</h1>; }
```
```

### Shader
```markdown
---
renderer: shader
resolution: 800x600
---
# Vertex
```vertex
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
```
# Fragment
```fragment
precision mediump float;
uniform float u_time;
void main() { gl_FragColor = vec4(0.5 + 0.5 * sin(u_time), 0.3, 0.8, 1.0); }
```
```

### Ejercicio
```markdown
---
exercise: true
exercise_title: "Titulo del ejercicio"
exercise_instructions: "Paso 1 || Paso 2 || Paso 3"
exercise_hints: "Pista 1 || Pista 2"
example_stage: exercise
---
(bloques de codigo en cualquier formato soportado)
```

## Archivos clave del proyecto

| Archivo | Proposito |
|---------|-----------|
| `AGENTS.md` | Punto de entrada para IAs, tabla de enrutado |
| `skills/learnweb-example-authoring/SKILL.md` | Referencia completa de formatos de ejemplo |
| `skills/learnweb-theory-authoring/SKILL.md` | Como escribir teoria |
| `skills/learnweb-shader-authoring/SKILL.md` | Como escribir shaders |
| `skills/learnweb-repo-editing/SKILL.md` | Orientacion general del repo |
| `skills/learnweb-repo-editing/references/hotspots.md` | Mapa de todos los archivos del proyecto |
| `server.js` | API backend (Express) |
| `src/main.js` | Punto de entrada frontend |
| `package.json` | Dependencias y scripts (`npm test`, `npm run dev`, `npm run build`) |

## Sistema de Pending

La app tiene un sistema de "pending" (items pendientes) que funciona exactamente igual que favoritos:

- `.pending` — archivo JSON en la raiz del proyecto
- `src/utils/pendingStore.js` — store del backend
- `src/components/PendingDialog.js` — dialogo para ver/gestionar pendientes
- API: `GET/POST/DELETE /api/pending`
- Los items pending aparecen con badge ambar en la galeria y se ordenan primero
- Al iniciar la app sin topic seleccionado, se muestran los pending automaticamente

## Errores comunes a evitar

1. **No mezclar teoria con ejemplos.** `main.md` es teoria. Los `.md` en `examples/` son codigo ejecutable. Son cosas distintas.
2. **No inventar formatos.** Usa exactamente los formatos documentados. El parser es estricto.
3. **No olvidar el frontmatter en React/Vue.** `framework: react` o `framework: vue` es obligatorio.
4. **No olvidar `entry` en multi-file.** Sin `entry`, el compilador no sabe que archivo ejecutar primero.
5. **No redeclarar built-in uniforms en shaders.** `u_time`, `u_resolution`, etc. ya existen.
6. **No crear archivos fuera de la estructura.** Los ejemplos van en `examples/`, la teoria en `main.md`, los assets en `assets/`.
7. **No asumir.** Lee un ejemplo existente del mismo tipo antes de crear uno nuevo.
8. **No olvidar `example_stage: exercise` en ejercicios.** Sin esto, el ejercicio no se muestra correctamente en la galeria.
9. **No olvidar separar instrucciones con `||`.** Las instrucciones y hints usan `||` como separador, no saltos de linea.
