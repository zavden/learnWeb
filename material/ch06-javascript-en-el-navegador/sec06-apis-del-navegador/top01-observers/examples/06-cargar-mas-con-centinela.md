---
example_description: "«Cargar más» automático con un centinela: un elemento vacío al final de la lista se observa y, cuando entra en la vista, se pide la página siguiente; el botón sigue siendo la vía principal, y al acabar se llama a disconnect()"
example_tags: "javascript|intersectionobserver|centinela|scroll-infinito|cargar-mas|disconnect"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Recetario: <output id="count">0 de 30</output> recetas</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
  </p>
  <div id="recipes-panel" class="panel" tabindex="0" role="region" aria-label="Recetas">
    <ol id="recipes" class="recipes" aria-busy="false"></ol>
    <p id="sentinel" class="sentinel">
      <button id="load-more" type="button">Cargar más recetas</button>
    </p>
  </div>
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
  margin: 0 0 0.5rem;
}
.toolbar {
  margin: 0 0 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:disabled {
  cursor: progress;
  color: #52606d;
}
button:focus-visible,
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.panel {
  height: 15rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.recipes {
  margin: 0;
  padding: 0.5rem 0.5rem 0 2.5rem;
}
/* 10 recetas (≈ 420 px) llenan de sobra el panel (240 px): al cargar,
   el centinela queda lejos, incluso con los 120 px de rootMargin. */
.recipes li {
  line-height: 2.5rem;
  border-bottom: 1px solid #e4e7eb;
}
.sentinel {
  margin: 0;
  padding: 0.75rem;
  text-align: center;
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
const ALL_RECIPES = [
  'Chiles en nogada', 'Mole poblano', 'Pozole rojo', 'Cochinita pibil', 'Tamales verdes',
  'Sopa de lima', 'Enchiladas suizas', 'Tacos al pastor', 'Birria de res', 'Chilaquiles rojos',
  'Huevos rancheros', 'Sopa de tortilla', 'Esquites', 'Tlayudas', 'Pescado a la talla',
  'Aguachile', 'Caldo de piedra', 'Mixiote de carnero', 'Pambazos', 'Sopes de frijol',
  'Enfrijoladas', 'Papadzules', 'Pan de muerto', 'Arroz con leche', 'Flan napolitano',
  'Jericalla', 'Capirotada', 'Churros', 'Buñuelos', 'Café de olla',
];
const PAGE_SIZE = 10;
const panel = document.querySelector('#recipes-panel');
const list = document.querySelector('#recipes');
const sentinel = document.querySelector('#sentinel');
const loadButton = document.querySelector('#load-more');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let page = 0;
let loading = false;

// Simula la red (300 ms). En una página real, un fetch a la API.
async function loadNextPage() {
  if (loading || page * PAGE_SIZE >= ALL_RECIPES.length) return;
  loading = true;
  loadButton.disabled = true;
  list.setAttribute('aria-busy', 'true');
  await wait(300);
  page += 1;
  const items = ALL_RECIPES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((title) => {
    const item = document.createElement('li');
    item.textContent = title;
    return item;
  });
  list.append(...items);
  const shown = list.children.length;
  document.querySelector('#count').textContent = `${shown} de ${ALL_RECIPES.length}`;
  list.setAttribute('aria-busy', 'false');
  loading = false;
  loadButton.disabled = false;
  if (page > 1) logLine(`📥 página ${page} → ${shown} de ${ALL_RECIPES.length} recetas`);
  if (shown === ALL_RECIPES.length) {
    observer.disconnect(); // ✅ no queda nada que cargar: deja de observar
    loadButton.hidden = true;
    sentinel.append('No hay más recetas.');
    logLine('✅ no hay más: disconnect()');
  }
}

let calls = 0;
const observer = new IntersectionObserver((entries) => {
  calls += 1;
  const entry = entries[0];
  if (!entry.isIntersecting) {
    // La primera llamada llega al observar: el centinela está fuera de la vista.
    if (calls === 1) logLine('centinela → fuera de la vista: no cargo nada');
    return;
  }
  logLine(`centinela → a la vista: cargo la página ${page + 1}`);
  loadNextPage();
}, { root: panel, rootMargin: '0px 0px 120px 0px' }); // empieza 120 px antes

loadButton.addEventListener('click', loadNextPage);
document.querySelector('#to-end').addEventListener('click', () => {
  panel.scrollTop = panel.scrollHeight;
});

// La primera página llega con la propia página; después, se empieza a observar.
loadNextPage().then(() => {
  observer.observe(sentinel);
  logLine('Listo: 10 de 30 recetas · baja hasta el final del panel o pulsa «Cargar más recetas»');
});
```
