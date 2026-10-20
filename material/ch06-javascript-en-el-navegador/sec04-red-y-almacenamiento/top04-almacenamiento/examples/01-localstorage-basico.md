---
example_description: "localStorage guarda pares clave/valor por origen que sobreviven a recargas y a cerrar el navegador: un contador de visitas a una receta con getItem (null si no existe), setItem y removeItem; las claves llevan un prefijo propio porque todos los ejemplos comparten el origen"
example_tags: "javascript|localstorage|almacenamiento|persistencia|getitem|setitem"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pozole rojo</h1>
  <p>Has abierto esta receta <output id="visits">0 veces</output> en este navegador.</p>
  <p><button id="forget" type="button">Olvidar mis visitas</button></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
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
output {
  font-weight: 700;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Todos los ejemplos del curso comparten un origen (http://localhost:3001), y
// por tanto un mismo localStorage: cada clave lleva un prefijo propio.
const VISITS_KEY = 'lw-almacen-visitas-pozole';
const visitsOutput = document.querySelector('#visits');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// getItem devuelve el texto guardado, o null si la clave no existe.
const saved = localStorage.getItem(VISITS_KEY);
logLine(`getItem → ${JSON.stringify(saved)}`);
const visits = Number(saved ?? 0) + 1;
localStorage.setItem(VISITS_KEY, String(visits));
visitsOutput.textContent = `${visits} ${visits === 1 ? 'vez' : 'veces'}`;
logLine(`setItem → ${JSON.stringify(String(visits))}`);

document.querySelector('#forget').addEventListener('click', () => {
  localStorage.removeItem(VISITS_KEY); // quita SOLO nuestra clave
  visitsOutput.textContent = '0 veces';
  logLine(`removeItem → ahora getItem da ${JSON.stringify(localStorage.getItem(VISITS_KEY))}`);
});

logLine('Listo: pulsa ⟳ en la vista previa (el número sube) o «Olvidar mis visitas»');

// localStorage.length y Object.keys(localStorage) cuentan las claves de TODOS
// los ejemplos del origen. Y nunca localStorage.clear() en una página que
// comparte origen: borraría los datos de todas las demás. En una tarjeta de
// la teoría (iframe aislado) LearnWeb pone un localStorage en memoria, que se
// pierde al recargar.
```
