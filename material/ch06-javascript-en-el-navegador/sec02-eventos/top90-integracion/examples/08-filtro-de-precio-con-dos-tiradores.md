---
example_description: "Un filtro de precio con dos tiradores hecho con Pointer Events (setPointerCapture, touch-action, la pista medida al empezar) y teclado (flechas, RePág/AvPág, Inicio/Fin); avisa con range:change, agrupado por frame con requestAnimationFrame mientras se arrastra, y la lista de productos se filtra al recibirlo"
example_tags: "javascript|eventos|integracion|pointer-events|slider|customevent|requestanimationframe|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cafés de origen</h1>
  <div id="price-range" class="range" data-min="100" data-max="400" data-step="10">
    <p class="range-label">Precio: <output id="range-output">$100 – $400</output></p>
    <div class="track">
      <div class="fill"></div>
      <div class="thumb" data-thumb="min" role="slider" tabindex="0" aria-label="Precio mínimo"></div>
      <div class="thumb" data-thumb="max" role="slider" tabindex="0" aria-label="Precio máximo"></div>
    </div>
  </div>
  <p id="count" aria-live="polite"></p>
  <ul id="products" class="products"></ul>
  <ol id="log" class="log"></ol>
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
.range {
  padding: 0 0.75rem 1rem;
}
.track {
  position: relative;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #cbd2d9;
}
.fill {
  position: absolute;
  height: 100%;
  background: #1d4ed8;
}
.thumb {
  position: absolute;
  top: 50%;
  width: 1.25rem;
  height: 1.25rem;
  translate: -50% -50%;
  border: 2px solid #1d4ed8;
  border-radius: 50%;
  background: #ffffff;
  cursor: grab;
  touch-action: none;
}
.thumb:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.products {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
}
.products li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  background: #ffffff;
}
.log {
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
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── El componente: no sabe nada de productos; solo avisa con range:change.
function createRange(root) {
  const limits = { min: Number(root.dataset.min), max: Number(root.dataset.max), step: Number(root.dataset.step) };
  const values = { min: limits.min, max: limits.max };
  const track = root.querySelector('.track');
  const thumbs = { min: root.querySelector('[data-thumb="min"]'), max: root.querySelector('[data-thumb="max"]') };
  let frame = 0;

  const percent = (value) => ((value - limits.min) / (limits.max - limits.min)) * 100;
  function render() {
    for (const which of ['min', 'max']) {
      const thumb = thumbs[which];
      thumb.style.left = `${percent(values[which])}%`;
      thumb.setAttribute('aria-valuenow', values[which]);
      thumb.setAttribute('aria-valuetext', `$${values[which]}`);
      // Cada tirador solo llega hasta el otro.
      thumb.setAttribute('aria-valuemin', which === 'min' ? limits.min : values.min);
      thumb.setAttribute('aria-valuemax', which === 'max' ? limits.max : values.max);
    }
    const fill = root.querySelector('.fill');
    fill.style.left = `${percent(values.min)}%`;
    fill.style.width = `${percent(values.max) - percent(values.min)}%`;
  }
  function emit(committed) {
    root.dispatchEvent(new CustomEvent('range:change', { bubbles: true, detail: { ...values, committed } }));
  }
  function setValue(which, raw) {
    const stepped = Math.round(raw / limits.step) * limits.step;
    const low = which === 'min' ? limits.min : values.min;
    const high = which === 'max' ? limits.max : values.max;
    values[which] = Math.min(high, Math.max(low, stepped));
    render();
  }

  // Puntero: captura, pista medida una vez, un aviso por frame como mucho.
  let dragging = null; // { which, box }
  root.addEventListener('pointerdown', (event) => {
    const thumb = event.target.closest('[data-thumb]');
    if (!thumb) return;
    thumb.setPointerCapture(event.pointerId);
    dragging = { which: thumb.dataset.thumb, box: track.getBoundingClientRect() };
  });
  root.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const { which, box } = dragging;
    setValue(which, limits.min + ((event.clientX - box.left) / box.width) * (limits.max - limits.min));
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        emit(false);
      });
    }
  });
  root.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = null;
    cancelAnimationFrame(frame);
    frame = 0;
    emit(true);
  });
  root.addEventListener('lostpointercapture', () => {
    dragging = null;
  });

  // Teclado: el patrón de un slider (WAI-ARIA).
  root.addEventListener('keydown', (event) => {
    const thumb = event.target.closest('[data-thumb]');
    if (!thumb) return;
    const which = thumb.dataset.thumb;
    const big = limits.step * 5;
    const moves = {
      ArrowRight: values[which] + limits.step, ArrowUp: values[which] + limits.step,
      ArrowLeft: values[which] - limits.step, ArrowDown: values[which] - limits.step,
      PageUp: values[which] + big, PageDown: values[which] - big,
      Home: limits.min, End: limits.max,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setValue(which, moves[event.key]);
    emit(true);
  });
  render();
}

// ── La lista: escucha range:change y se filtra.
const coffees = [
  { name: 'Ánimas (Guerrero)', price: 175 }, { name: 'Veracruz', price: 185 },
  { name: 'Chiapas', price: 210 }, { name: 'Oaxaca', price: 240 },
  { name: 'Nayarit', price: 290 }, { name: 'Pluma Hidalgo (geisha)', price: 380 },
];
function renderProducts({ min, max }) {
  const visible = coffees.filter((coffee) => coffee.price >= min && coffee.price <= max);
  document.querySelector('#products').replaceChildren(...visible.map((coffee) => {
    const item = document.createElement('li');
    item.append(coffee.name, ` $${coffee.price}`);
    return item;
  }));
  document.querySelector('#count').textContent = `${visible.length} de ${coffees.length} cafés`;
  document.querySelector('#range-output').textContent = `$${min} – $${max}`;
  return visible.length;
}
document.addEventListener('range:change', (event) => {
  const shown = renderProducts(event.detail);
  if (event.detail.committed) logLine(`💲 $${event.detail.min} – $${event.detail.max} → ${shown} cafés`);
});

createRange(document.querySelector('#price-range'));
renderProducts({ min: 100, max: 400 });
logLine('Listo: arrastra los tiradores; o Tab hasta uno y usa las flechas, RePág/AvPág, Inicio y Fin');
```
