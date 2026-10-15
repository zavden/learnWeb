---
example_description: "Buscar mientras se escribe: sin cancelar, la respuesta más lenta (la de «c») llega la última y pisa a la buena; con AbortController cada pulsación cancela la petición anterior, y con debounce además solo se envía una; el buscador de la página usa las dos técnicas"
example_tags: "javascript|async|debounce|abortcontroller|carrera|busqueda|bug"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main class="search">
  <label for="query">Buscar en la tienda</label>
  <input id="query" type="search" autocomplete="off" placeholder="Prueba con «café»">
  <p id="status" class="status" role="status">Escribe para buscar.</p>
  <ul id="results"></ul>
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
.search {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}
input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  padding: 0.5rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  color: #52606d;
}
```

# JavaScript

```javascript
const PRODUCTS = ['café de olla', 'café de Chiapas', 'cajeta', 'cacao en polvo', 'canela', 'chocolate'];
const wait = (ms, { signal } = {}) => new Promise((resolve, reject) => {
  signal?.throwIfAborted();
  const timerId = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
    clearTimeout(timerId);
    reject(signal.reason);
  }, { once: true });
});

// La API simulada: las búsquedas cortas tardan MÁS (devuelven más resultados).
const LATENCY = { 1: 300, 2: 200, 3: 120, 4: 40 };
let requestsSent = 0;
async function searchProducts(query, { signal } = {}) {
  requestsSent += 1;
  await wait(LATENCY[Math.min(query.length, 4)], { signal });
  return { query, items: PRODUCTS.filter((name) => name.includes(query)) };
}

// Teclear «café» letra a letra, una cada 60 ms (simulado).
async function typeSlowly(onInput) {
  for (const text of ['c', 'ca', 'caf', 'café']) {
    onInput(text);
    await wait(60);
  }
}

async function demo(label, makeHandler) {
  requestsSent = 0;
  let shown = null;
  let aborted = 0;
  const handler = makeHandler((result) => { shown = result.query; }, () => { aborted += 1; });
  await typeSlowly(handler);
  await wait(400); // esperamos a que llegue todo
  console.log(`${label} → peticiones: ${requestsSent}, canceladas: ${aborted}, en pantalla: «${shown}»`);
}

// 🐛 Una petición por pulsación, sin cancelar: gana la ÚLTIMA EN LLEGAR.
const naive = (show) => (text) => {
  searchProducts(text).then(show);
};

// ✅ Cada pulsación cancela la petición anterior.
const withAbort = (show, onAbort) => {
  let controller = null;
  return (text) => {
    controller?.abort();
    controller = new AbortController();
    searchProducts(text, { signal: controller.signal })
      .then(show)
      .catch((error) => { if (error.name === 'AbortError') onAbort(); else throw error; });
  };
};

// ✅ Debounce + cancelación: solo se busca cuando dejas de teclear 100 ms.
const withDebounce = (show, onAbort) => {
  const search = withAbort(show, onAbort);
  let timerId;
  return (text) => {
    clearTimeout(timerId);
    timerId = setTimeout(search, 100, text);
  };
};

// El buscador de la página usa la versión buena (querySelector, textContent,
// createElement, append y el evento input: capítulo 6).
const input = document.querySelector('#query');
const statusLine = document.querySelector('#status');
const list = document.querySelector('#results');
const render = ({ query, items }) => {
  statusLine.textContent = `${items.length} resultado(s) para «${query}»`;
  list.replaceChildren(...items.map((name) => {
    const li = document.createElement('li');
    li.textContent = name;
    return li;
  }));
};
const liveSearch = withDebounce(render, () => {});
input.addEventListener('input', () => {
  if (input.value.trim() !== '') liveSearch(input.value.trim());
});

async function main() {
  await demo('🐛 sin cancelar', naive);
  await demo('✅ con AbortController', withAbort);
  await demo('✅ con debounce + AbortController', withDebounce);
}
main();

// La carrera: «c» sale primero pero tarda 300 ms; «café» sale el último y
// tarda 40. Las respuestas llegan al revés, y la que llega la última («c»)
// pinta resultados de una búsqueda que el usuario ya no quiere.
// Cancelar la anterior arregla la carrera; el debounce, además, ahorra
// peticiones. fetch acepta la misma { signal } (capítulo 6).
```
