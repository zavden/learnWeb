---
example_description: "Un total de carrito que cuenta hasta su nuevo valor: una interpolación con rAF y suavizado envuelta en una promesa; si llega otro cambio a mitad, el AbortController cancela la animación en curso y la nueva arranca desde el valor que se estaba mostrando; el lector de pantalla solo oye el valor final"
example_tags: "javascript|requestanimationframe|promesas|abortcontroller|animacion|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="cart">
  <h1>Tu carrito</h1>
  <p class="total">
    Total:
    <span id="total-visual" aria-hidden="true">$0.00</span>
    <span id="total-live" class="visually-hidden" aria-live="polite">$0.00</span>
  </p>
  <p class="actions">
    <button type="button" data-cents="21000">Añadir café de Chiapas ($210.00)</button>
    <button type="button" data-cents="9500">Añadir cajeta ($95.00)</button>
  </p>
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
.cart {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.total {
  font-size: 1.6rem;
  font-variant-numeric: tabular-nums;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (cents) => pesos.format(Math.round(cents) / 100);
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// tween: anima un número de `from` a `to` y devuelve una promesa.
function tween({ from, to, duration, onUpdate, signal }) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    let start = null;
    let frameId = requestAnimationFrame(function step(now) {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      onUpdate(progress === 1 ? to : from + (to - from) * easeOutCubic(progress)); // el final, exacto
      if (progress < 1) frameId = requestAnimationFrame(step);
      else resolve(to);
    });
    signal?.addEventListener('abort', () => { // addEventListener: capítulo 6
      cancelAnimationFrame(frameId);
      reject(signal.reason);
    }, { once: true });
  });
}

// querySelector, textContent y dataset: capítulo 6.
const visual = document.querySelector('#total-visual');
const live = document.querySelector('#total-live');

// El total animado: cada set() cancela la animación anterior y parte del
// valor que se está mostrando en ese momento.
const animatedTotal = {
  shown: 0,
  target: 0,
  controller: null,
  async set(target) {
    this.target = target;
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    try {
      await tween({
        from: this.shown, to: target, duration: 400, signal: controller.signal,
        onUpdate: (value) => {
          this.shown = value;
          visual.textContent = money(value);
        },
      });
      live.textContent = money(target); // el lector de pantalla oye solo el final
      return 'terminada';
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
      return 'interrumpida';
    }
  },
};

for (const button of document.querySelectorAll('[data-cents]')) {
  button.addEventListener('click', () => animatedTotal.set(animatedTotal.target + Number(button.dataset.cents)));
}

async function demo() {
  console.log('▶ añadir un café');
  console.log('  animación →', await animatedTotal.set(21000), '| se muestra', money(animatedTotal.shown));

  console.log('▶ dos productos casi a la vez');
  const first = animatedTotal.set(30500); // + cajeta
  await wait(150);
  const shownWhenInterrupted = animatedTotal.shown;
  const second = animatedTotal.set(51500); // + otro café, a mitad de la animación
  console.log('  la primera →', await first);
  console.log('  se interrumpió en un valor intermedio →', shownWhenInterrupted > 21000 && shownWhenInterrupted < 30500);
  console.log('  la segunda →', await second, '| se muestra', money(animatedTotal.shown));
  console.log('  sin saltos hacia atrás: arrancó desde el valor que se veía');
}
demo();

// El número que se anima está oculto para los lectores de pantalla
// (aria-hidden): oírlo cambiar 25 veces por segundo sería insoportable. Una
// región aria-live, invisible, anuncia solo el valor final.
```
