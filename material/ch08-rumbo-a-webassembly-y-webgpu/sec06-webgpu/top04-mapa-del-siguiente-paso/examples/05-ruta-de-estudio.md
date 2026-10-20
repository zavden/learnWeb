---
example_description: "Tu ruta después del curso, como una lista de pasos que se guarda en localStorage (con la clave lw-ch08-ruta-de-estudio y un botón para reiniciarla): WebAssembly desde Rust, C o AssemblyScript, WebGPU con las guías y bibliotecas de referencia, y cuatro proyectos. Casillas de verdad, accesibles con el teclado, y una barra de progreso"
example_tags: "javascript|localstorage|checklist|formularios|accesibilidad|ruta-de-estudio"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Mi ruta después del curso</h1>
  <p class="summary"><progress id="progress" max="12" value="0"></progress> <output id="count" aria-live="polite"></output></p>
  <form id="route">
    <fieldset>
      <legend>WebAssembly</legend>
      <label><input type="checkbox" name="rust"> Compilar una función de Rust con wasm-bindgen y llamarla desde JavaScript</label>
      <label><input type="checkbox" name="emscripten"> Portar una biblioteca pequeña de C con Emscripten</label>
      <label><input type="checkbox" name="assemblyscript"> Escribir un módulo en AssemblyScript</label>
      <label><input type="checkbox" name="wat"> Leer un módulo en el formato de texto (.wat)</label>
    </fieldset>
    <fieldset>
      <legend>WebGPU</legend>
      <label><input type="checkbox" name="fundamentals"> Las lecciones de compute de WebGPU Fundamentals</label>
      <label><input type="checkbox" name="threejs"> Una escena con Three.js y su WebGPURenderer</label>
      <label><input type="checkbox" name="wgpu"> Los primeros capítulos de «Learn Wgpu», en Rust</label>
      <label><input type="checkbox" name="timestamps"> Medir una pasada con timestamp-query</label>
    </fieldset>
    <fieldset>
      <legend>Proyectos</legend>
      <label><input type="checkbox" name="editor"> Un editor de fotos con filtros en compute shaders</label>
      <label><input type="checkbox" name="particles"> Una simulación de partículas con compute y render</label>
      <label><input type="checkbox" name="game"> Un juego pequeño con su bucle de animación</label>
      <label><input type="checkbox" name="port"> Una biblioteca de C llevada a la web con WebAssembly</label>
    </fieldset>
    <button id="reset" type="button">Reiniciar la ruta</button>
  </form>
</main>
```

# CSS

```css
:root {
  color-scheme: dark;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #e2e8f0;
  background: #0f172a;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
progress {
  flex: 1;
  accent-color: #22c55e;
}
fieldset {
  border: 1px solid #475569;
  border-radius: 6px;
  margin: 0 0 0.75rem;
  padding: 0.5rem 0.75rem;
}
legend {
  font-weight: 600;
  padding: 0 0.25rem;
}
label {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.2rem 0;
  font-size: 0.9rem;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
```

# JavaScript

```javascript
// La ruta se guarda en localStorage (lección «Almacenamiento en el navegador»): en las tarjetas
// de LearnWeb es una copia en memoria que se pierde al recargar; en el editor y con ▶, se queda.
const STORAGE_KEY = 'lw-ch08-ruta-de-estudio';
const form = document.querySelector('#route');
const boxes = [...form.querySelectorAll('input[type="checkbox"]')];
const progress = document.querySelector('#progress');
const count = document.querySelector('#count');

function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set(); // datos corruptos o almacenamiento bloqueado: empezar de cero
  }
}
function save(done) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    count.textContent += ' (no se pudo guardar)';
  }
}
function render(done) {
  for (const box of boxes) box.checked = done.has(box.name);
  progress.value = done.size;
  count.textContent = `${done.size} de ${boxes.length}`;
}

const done = load();
render(done);
console.log(`Listo: ${done.size} de ${boxes.length} pasos marcados; marca uno o pulsa «Reiniciar la ruta»`);

form.addEventListener('change', (event) => {
  const box = event.target;
  if (box.checked) done.add(box.name);
  else done.delete(box.name);
  save(done);
  render(done);
  console.log(`${box.checked ? '✓' : '○'} ${box.closest('label').textContent.trim()} · ${done.size} de ${boxes.length}`);
});
document.querySelector('#reset').addEventListener('click', () => {
  done.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento: no hay nada que borrar
  }
  render(done);
  console.log(`Ruta reiniciada: 0 de ${boxes.length}`);
});
```
