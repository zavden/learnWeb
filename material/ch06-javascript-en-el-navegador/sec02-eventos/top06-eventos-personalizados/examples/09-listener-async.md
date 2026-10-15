---
example_description: "El navegador no espera a un listener async: un preventDefault() después de un await llega tarde (el formulario ya se envió, aunque defaultPrevented diga true) y un error tras el await es un rechazo sin manejar, que recoge el evento unhandledrejection de window"
example_tags: "javascript|eventos|async|await|preventdefault|unhandledrejection|formularios|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Pedido P-2077 · $640.00</h1>
  <form id="pay-buggy" class="pay" action="/pagar">
    <h2>🐛 preventDefault después del await</h2>
    <label for="coupon-buggy">Cupón</label>
    <input id="coupon-buggy" name="coupon" value="VERANO10">
    <button type="submit">Pagar</button>
  </form>
  <form id="pay-fixed" class="pay" action="/pagar">
    <h2>✅ preventDefault antes del await</h2>
    <label for="coupon-fixed">Cupón</label>
    <input id="coupon-fixed" name="coupon" value="VERANO10">
    <button type="submit">Pagar</button>
  </form>
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
  flex-basis: 100%;
  font-size: 0.95rem;
  margin: 0;
}
.pay {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
input {
  font: inherit;
  padding: 0.3rem 0.5rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
input:focus-visible,
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// La red de seguridad para las promesas rechazadas que nadie maneja
// (te la anunciamos en la lección «Promesas»).
window.addEventListener('unhandledrejection', (event) => {
  logLine(`🛟 unhandledrejection → ${event.reason.message}`);
});

// El servidor, simulado: el cupón vale $64 y la tarjeta se rechaza.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchDiscount(code) {
  await wait(200);
  return code === 'VERANO10' ? 64 : 0;
}
async function chargeCard(amount) {
  await wait(200);
  throw new Error(`tarjeta **** 0002 rechazada ($${amount.toFixed(2)})`);
}

document.querySelector('#pay-buggy').addEventListener('submit', async (event) => {
  logLine('🐛 compruebo el cupón…');
  const discount = await fetchDiscount(event.target.elements.coupon.value);
  // 🐛 El navegador NO esperó a esta función: en el primer await recibió una
  //    promesa, dio el listener por terminado y siguió con el envío.
  event.preventDefault();
  logLine(`🐛 preventDefault() tras el await → defaultPrevented: ${event.defaultPrevented}, pero el formulario ya se envió`);
  // 🐛 Y nadie espera la promesa del listener: este error queda sin manejar.
  await chargeCard(640 - discount);
});

document.querySelector('#pay-fixed').addEventListener('submit', async (event) => {
  event.preventDefault(); // ✅ lo primero, antes de cualquier await
  const form = event.currentTarget; // ✅ guardado antes del await (lección «Propagación»)
  try {
    const discount = await fetchDiscount(form.elements.coupon.value);
    await chargeCard(640 - discount);
  } catch (error) {
    logLine(`✅ atrapado → ${error.message}: lo muestro junto al formulario`);
  }
});
logLine('Listo: pulsa los dos «Pagar»');

// En una página normal, el formulario 🐛 habría navegado a /pagar en cuanto
// terminó el evento, y el resto de la función ni siquiera se ejecutaría.
// En LearnWeb, la vista previa bloquea la navegación y la describe en la
// consola («Form submitted…»): esa línea es la prueba de que se envió.
```
