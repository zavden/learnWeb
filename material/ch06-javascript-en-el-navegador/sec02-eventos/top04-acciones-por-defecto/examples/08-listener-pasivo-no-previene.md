---
example_description: "Un listener con { passive: true } no puede cancelar: preventDefault() se ignora (defaultPrevented → false); los de wheel y touch en window/document/body son pasivos POR DEFECTO. Dos mapas con zoom con la rueda: con passive la página se desplaza a la vez"
example_tags: "javascript|eventos|passive|preventdefault|wheel|scroll|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mapas de las sucursales</h1>
  <p>Pon el puntero sobre cada mapa y gira la rueda (o desliza dos dedos en el trackpad).</p>
  <div class="maps">
    <section class="map" id="map-a">
      <h2>🐛 passive: true</h2>
      <p>Zoom: <output>100 %</output></p>
      <button type="button" data-step="-10" aria-label="Alejar">−</button>
      <button type="button" data-step="10" aria-label="Acercar">+</button>
    </section>
    <section class="map" id="map-b">
      <h2>✅ passive: false</h2>
      <p>Zoom: <output>100 %</output></p>
      <button type="button" data-step="-10" aria-label="Alejar">−</button>
      <button type="button" data-step="10" aria-label="Acercar">+</button>
    </section>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="spacer">(Espacio para que la página se pueda desplazar.)</p>
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
  font-size: 0.95rem;
  margin: 0;
}
.maps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}
.map {
  padding: 1.5rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: repeating-linear-gradient(45deg, #ecfdf5 0 12px, #d1fae5 12px 24px);
}
button {
  font: inherit;
  min-width: 2rem;
  padding: 0.2rem 0.5rem;
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
.spacer {
  height: 120vh;
  color: #52606d;
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
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 1. Simulado, al cargar: un listener pasivo llama a preventDefault() y no pasa nada.
const probe = document.createElement('div');
probe.addEventListener('check', (event) => event.preventDefault(), { passive: true });
const checkEvent = new Event('check', { cancelable: true });
probe.dispatchEvent(checkEvent); // dispatchEvent lo entrega ahora mismo (lección «Eventos personalizados»)
logLine(`simulado · passive: true → defaultPrevented: ${checkEvent.defaultPrevented}`);

// 2. Simulado: en window, document y body, los listeners de wheel, touchstart
//    y touchmove son pasivos aunque no lo pidas (Chrome lo decidió para que el
//    scroll no espere a JavaScript).
function cancelWheel(event) {
  event.preventDefault();
}
document.addEventListener('wheel', cancelWheel);
const wheelA = new WheelEvent('wheel', { cancelable: true });
document.dispatchEvent(wheelA);
logLine(`simulado · wheel en document sin opciones → defaultPrevented: ${wheelA.defaultPrevented}`);
document.removeEventListener('wheel', cancelWheel); // quitarlo antes: si no, el siguiente add sería un duplicado
document.addEventListener('wheel', cancelWheel, { passive: false });
const wheelB = new WheelEvent('wheel', { cancelable: true });
document.dispatchEvent(wheelB);
logLine(`simulado · wheel en document con passive: false → defaultPrevented: ${wheelB.defaultPrevented}`);
document.removeEventListener('wheel', cancelWheel);

// 3. De verdad: dos mapas que hacen zoom con la rueda.
function makeZoomable(map, options) {
  let zoom = 100;
  let lastReport = -Infinity;
  const show = (step) => {
    zoom = Math.min(400, Math.max(50, zoom + step));
    map.querySelector('output').textContent = `${zoom} %`;
  };
  map.addEventListener('wheel', (event) => {
    event.preventDefault(); // «no desplaces la página: la rueda es para el zoom»
    show(event.deltaY < 0 ? 10 : -10);
    if (event.timeStamp - lastReport > 1500) { // como mucho un aviso cada 1,5 s
      lastReport = event.timeStamp;
      logLine(`#${map.id} · passive: ${options.passive} → defaultPrevented: ${event.defaultPrevented}`);
    }
  }, options);
  // La alternativa de teclado: los botones − y +.
  map.addEventListener('click', (event) => {
    const button = event.target.closest('[data-step]');
    if (button) show(Number(button.dataset.step));
  });
}
makeZoomable(document.querySelector('#map-a'), { passive: true });
makeZoomable(document.querySelector('#map-b'), { passive: false });
logLine('Listo: gira la rueda sobre cada mapa; con el A, la página también se desplaza');

// En DevTools de Chrome, cada preventDefault() ignorado imprime un aviso
// («Unable to preventDefault inside passive event listener…»); la consola de
// LearnWeb no recibe esos avisos del navegador.
```
