---
example_description: "Una animación con rAF envuelta en una promesa: animate() se cumple al terminar y se rechaza si su AbortSignal se cancela; con await, varias animaciones se encadenan en orden, y un plazo con AbortSignal.timeout corta la última a mitad"
example_tags: "javascript|requestanimationframe|promesas|async|abortsignal|animacion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="parcel-demo">
  <h1>Del almacén al cliente</h1>
  <div class="track" aria-hidden="true">
    <div class="parcel">📦</div>
  </div>
  <p id="status" role="status">Esperando…</p>
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
.parcel-demo {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.track {
  height: 3rem;
  border-bottom: 3px solid #9aa5b1;
}
.parcel {
  display: inline-block;
  font-size: 2rem;
}
```

# JavaScript

```javascript
// animate(): un bucle de rAF que devuelve una PROMESA.
//   onFrame(progreso) se llama en cada frame con un número de 0 a 1.
//   La promesa se cumple al llegar a 1 y se rechaza si se cancela la señal.
function animate({ duration, onFrame, signal }) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    let start = null;
    let frameId = requestAnimationFrame(function step(now) {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      onFrame(progress);
      if (progress < 1) frameId = requestAnimationFrame(step);
      else resolve();
    });
    // addEventListener: capítulo 6. Al cancelar, el bucle se detiene.
    signal?.addEventListener('abort', () => {
      cancelAnimationFrame(frameId);
      reject(signal.reason);
    }, { once: true });
  });
}

// querySelector, offsetWidth, style y textContent: capítulo 6.
const parcel = document.querySelector('.parcel');
const track = document.querySelector('.track');
const statusLine = document.querySelector('#status');
const say = (text) => {
  statusLine.textContent = text;
  console.log(text);
};

async function deliver() {
  const half = (track.offsetWidth - parcel.offsetWidth) / 2; // medio recorrido, en px
  say('1. el paquete sale del almacén');
  await animate({ duration: 400, onFrame: (p) => { parcel.style.translate = `${p * half}px 0`; } });
  say('2. llegó al centro de reparto');
  await animate({ duration: 300, onFrame: (p) => { parcel.style.scale = `${1 + 0.3 * Math.sin(p * Math.PI)}`; } });
  say('3. escaneado: sale hacia el cliente');
  try {
    // El último tramo tarda 1 s, pero solo le damos 300 ms.
    await animate({
      duration: 1000,
      onFrame: (p) => { parcel.style.translate = `${half + p * half}px 0`; },
      signal: AbortSignal.timeout(300),
    });
    say('4. entregado');
  } catch (error) {
    say(`4. ⏰ tramo cortado a mitad (${error.name}): el paquete se queda donde iba`);
  }
}
deliver();

// Con la animación convertida en promesa, encadenar pasos es escribir líneas
// con await, y cancelarla es pasar una señal: lo mismo que con una petición.
// (El capítulo 6 enseña la Web Animations API, element.animate(), que trae
// esta promesa de serie: animation.finished.)
```
