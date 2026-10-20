---
example_description: "Eventos que llegan en ráfaga con eventos reales: debounce en el input de un buscador, throttle (con llamada final) en el scroll de un artículo y debounce en el resize de la ventana; contadores de eventos frente a trabajo hecho"
example_tags: "javascript|eventos|debounce|throttle|input|scroll|resize|rendimiento"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Blog del tostador</h1>
  <label for="query">Buscar artículos</label>
  <input id="query" type="search" autocomplete="off">
  <p class="stats">input: <output id="input-events">0</output> · búsquedas: <output id="searches">0</output></p>

  <div id="article" class="article" tabindex="0" aria-label="Artículo: cómo tostar café en casa">
    <h2>Cómo tostar café en casa</h2>
    <p>Necesitas una sartén de fondo grueso, 200 g de café verde y paciencia.</p>
    <p>Calienta la sartén a fuego medio y remueve sin parar: el grano pasa de verde a amarillo y huele a pan.</p>
    <p>A los ocho minutos llega el primer crack: el grano se expande y suena como palomitas.</p>
    <p>Para un tueste medio, retira dos minutos después del primer crack.</p>
    <p>Enfría el grano enseguida en un colador, moviéndolo para quitarle la cascarilla.</p>
    <p>Déjalo reposar doce horas antes de molerlo: el café recién tostado suelta mucho gas.</p>
  </div>
  <progress id="reading" max="100" value="0" aria-label="Progreso de lectura"></progress>
  <p class="stats">scroll: <output id="scroll-events">0</output> · actualizaciones: <output id="updates">0</output></p>
  <p class="stats">resize: <output id="resize-events">0</output> · recolocaciones: <output id="layouts">0</output></p>
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
h2 {
  font-size: 1rem;
}
#query {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.25rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
}
.article {
  height: 8rem;
  overflow-y: auto;
  padding: 0 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.article p {
  margin-bottom: 2rem;
}
#query:focus-visible,
.article:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
progress {
  width: 100%;
}
.stats {
  margin: 0.25rem 0 0.75rem;
  color: #52606d;
  font-variant-numeric: tabular-nums;
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
const logList = document.querySelector('#log');
const article = document.querySelector('#article');
const counters = { input: 0, searches: 0, scroll: 0, updates: 0, resize: 0, layouts: 0 };
let finishedReading = false;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function count(name, outputId) {
  counters[name] += 1;
  document.querySelector(outputId).textContent = counters[name];
}

// Las dos funciones de la lección «Funciones de orden superior».
function debounce(fn, waitMs) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), waitMs);
  };
}
function throttle(fn, intervalMs) { // con llamada final: el último evento no se pierde
  let last = -Infinity;
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    const wait = intervalMs - (performance.now() - last);
    if (wait <= 0) {
      last = performance.now();
      fn(...args);
    } else {
      timerId = setTimeout(() => {
        last = performance.now();
        fn(...args);
      }, wait);
    }
  };
}

// input: buscar solo cuando deja de escribir 300 ms.
const search = debounce((text) => {
  count('searches', '#searches');
  logLine(`🔎 búsqueda ${counters.searches}: «${text}» (tras ${counters.input} eventos input)`);
}, 300);
document.querySelector('#query').addEventListener('input', (event) => {
  count('input', '#input-events');
  search(event.target.value);
});

// scroll: actualizar la barra como mucho cada 100 ms.
const updateProgress = throttle(() => {
  count('updates', '#updates');
  const percent = Math.round(100 * article.scrollTop / (article.scrollHeight - article.clientHeight));
  document.querySelector('#reading').value = percent;
  if (percent === 100 && !finishedReading) {
    finishedReading = true;
    logLine(`📜 lectura 100 % (${counters.scroll} eventos scroll, ${counters.updates} actualizaciones)`);
  }
}, 100);
article.addEventListener('scroll', () => {
  count('scroll', '#scroll-events');
  updateProgress();
}, { passive: true }); // scroll no se puede cancelar: passive no cambia nada aquí

// resize: recolocar cuando la ventana deja de cambiar de tamaño.
const relayout = debounce(() => {
  count('layouts', '#layouts');
  logLine(`↔️ recoloco para ${window.innerWidth} px (tras ${counters.resize} eventos resize)`);
}, 200);
window.addEventListener('resize', () => {
  count('resize', '#resize-events');
  relayout();
});
logLine('Listo: escribe «tueste» seguido; desplaza el artículo hasta el final; cambia el ancho de la vista previa');
```
