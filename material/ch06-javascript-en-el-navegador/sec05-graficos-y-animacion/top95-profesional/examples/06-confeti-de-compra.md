---
example_description: "La confirmación de una compra: el formulario se valida y se envía como JSON al servidor de prueba (con plazo y un error simulable), y solo si el servidor responde 201 sale un estallido de confeti desde el botón: un pool de partículas en un canvas superpuesto que no captura clics, termina solo y, con «reducir movimiento», se sustituye por un mensaje"
example_tags: "javascript|canvas|particulas|fetch|formularios|aria-live|prefers-reduced-motion|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="checkout">
  <h1>Tu pedido</h1>
  <p id="sandbox-note" class="checkout__note" hidden>Esta tarjeta es un iframe aislado (origen null) y no envía formularios: ábrela con ▶ o en el editor.</p>
  <form id="order" class="checkout__form" novalidate>
    <p class="checkout__product">☕ Café de Chiapas, bolsa de 500 g · <strong>$210</strong></p>
    <label>Cantidad
      <input name="quantity" type="number" min="1" max="10" value="2" required></label>
    <label>Nombre
      <input name="name" autocomplete="name" required></label>
    <label>Correo electrónico
      <input name="email" type="email" autocomplete="email" required></label>
    <label class="checkout__check"><input name="fail" type="checkbox"> Simular un error del servidor</label>
    <p id="total" class="checkout__total" aria-live="polite"></p>
    <button id="pay" type="submit">Confirmar pedido</button>
  </form>
  <p id="status" class="checkout__status" role="status"></p>
  <canvas id="confetti" class="checkout__confetti" aria-hidden="true"></canvas>
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
.checkout {
  position: relative;
  max-width: 26rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.checkout__form {
  display: grid;
  gap: 0.6rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}
.checkout__form label {
  display: grid;
  gap: 0.2rem;
}
.checkout__form .checkout__check {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.9rem;
}
.checkout__product,
.checkout__total {
  margin: 0;
}
.checkout__total {
  font-weight: 700;
}
input,
button {
  font: inherit;
  padding: 0.35rem 0.6rem;
}
input:user-invalid {
  border-color: #b91c1c;
}
button {
  border: 0;
  border-radius: 0.5rem;
  background: #0e7490;
  color: #ffffff;
  font-weight: 600;
}
button:disabled {
  background: #9aa5b1;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.checkout__note {
  padding: 0.5rem;
  border-radius: 0.4rem;
  background: #fef3c7;
}
.checkout__note[hidden] {
  display: none;
}
.checkout__status {
  min-height: 1.5em;
  font-weight: 600;
}
/* Encima de todo, pero transparente a los clics */
.checkout__confetti {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

# JavaScript

```javascript
// Confirmación de compra con confeti.
//
// Decisiones de diseño:
// - El confeti celebra lo que el SERVIDOR confirma: sale tras un 201, nunca al pulsar.
// - El envío: validación nativa (checkValidity) + mensaje propio, JSON al servidor de prueba,
//   plazo con AbortSignal.timeout y el botón desactivado mientras tanto (sin dobles envíos).
// - Partículas: un pool de 160 objetos, dibujo por lotes por color, un bucle que se detiene
//   solo cuando no queda ninguna. El canvas cubre la página con pointer-events: none.
// - Con «reducir movimiento» no hay confeti: el mensaje de la región role="status" basta.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, formularios, red y este módulo.

const PRICE = 210;
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const shippingFor = (subtotal) => (subtotal >= 500 ? 0 : 60);
const orderTotal = (quantity) => quantity * PRICE + shippingFor(quantity * PRICE);
console.log(`2 bolsas → ${money.format(orderTotal(2))} (envío ${money.format(shippingFor(420))}) · 3 bolsas → ${money.format(orderTotal(3))} (envío gratis)`);

// ── Confeti ──────────────────────────────────────────────────────────────
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const COLORS = ['#e11d48', '#f59e0b', '#16a34a', '#2563eb', '#9333ea'];
const pool = Array.from({ length: 160 }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, spin: 0, color: 0 }));
function burst(x, y, random) {
  let launched = 0;
  for (const p of pool) {
    if (launched === 120) break;
    if (p.active) continue;
    Object.assign(p, { active: true, x, y, vx: (random() - 0.5) * 360, vy: -220 - random() * 260, spin: random() * 6 });
    p.life = 1.4 + random() * 0.8;
    p.color = Math.floor(random() * COLORS.length);
    launched += 1;
  }
}
function update(dt) {
  let alive = 0;
  for (const p of pool) {
    if (!p.active) continue;
    p.vy += 700 * dt;
    p.vx *= 0.99;                                   // un poco de aire
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) p.active = false;
    else alive += 1;
  }
  return alive;
}
burst(150, 300, mulberry32(7));
const counts = [];
for (let i = 1; i <= 150; i++) {
  const alive = update(1 / 60);
  if (i % 50 === 0) counts.push(alive);
}
console.log(`confeti simulado (120 piezas) → vivas a 0.83 s, 1.67 s y 2.5 s: ${counts.join(', ')}`);

const canvas = document.querySelector('#confetti');
const ctx = canvas.getContext('2d');
let frameId = null;
let previous = null;
function fitCanvas() {
  const dpr = window.devicePixelRatio;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  COLORS.forEach((color, c) => {
    ctx.beginPath();
    for (const p of pool) if (p.active && p.color === c) ctx.rect(p.x - 3, p.y - 2, 6, 4);
    ctx.fillStyle = color;
    ctx.fill();
  });
}
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
  previous = now;
  const alive = update(dt);
  draw();
  if (alive === 0) {
    frameId = null;
    return;                                         // el bucle termina solo
  }
  frameId = requestAnimationFrame(frame);
}
const liveRandom = mulberry32(Date.now());
function celebrate(fromElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // matchMedia: módulo siguiente
  fitCanvas();
  const box = canvas.getBoundingClientRect();
  const button = fromElement.getBoundingClientRect();
  burst(button.left + button.width / 2 - box.left, button.top - box.top, liveRandom);
  if (frameId === null) {
    previous = null;
    frameId = requestAnimationFrame(frame);
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && frameId !== null) {        // al ocultarse, se acaba la fiesta
    cancelAnimationFrame(frameId);
    frameId = null;
    pool.forEach((p) => { p.active = false; });
    draw();
  }
});

// ── Formulario y envío ───────────────────────────────────────────────────
const form = document.querySelector('#order');
const statusLine = document.querySelector('#status');
const payButton = document.querySelector('#pay');
function updateTotal() {
  const quantity = form.elements.quantity.valueAsNumber;
  document.querySelector('#total').textContent = Number.isInteger(quantity) && quantity >= 1
    ? `Total: ${money.format(orderTotal(quantity))}${shippingFor(quantity * PRICE) ? ' (con envío)' : ' (envío gratis)'}`
    : 'Indica una cantidad de 1 a 10.';
}
form.addEventListener('input', updateTotal);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    const firstInvalid = form.querySelector(':invalid');
    statusLine.textContent = `Revisa el campo «${firstInvalid.closest('label').firstChild.textContent.trim()}».`;
    firstInvalid.focus();
    return;
  }
  const order = {
    product: 'cafe-chiapas-500',
    quantity: form.elements.quantity.valueAsNumber,
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
  };
  payButton.disabled = true;
  statusLine.textContent = 'Enviando el pedido…';
  try {
    const status = form.elements.fail.checked ? 503 : 201;
    const response = await fetch(`/api/demo/echo?status=${status}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      signal: AbortSignal.timeout(5000),
    });
    if (response.status !== 201) throw new Error(`el servidor respondió ${response.status}`);
    const echo = await response.json();
    statusLine.textContent = `🎉 ¡Gracias, ${echo.body.name}! Pedido de ${echo.body.quantity} bolsa(s) confirmado: ${money.format(orderTotal(echo.body.quantity))}.`;
    celebrate(payButton);
  } catch (error) {
    statusLine.textContent = `No se pudo confirmar el pedido (${error.name === 'TimeoutError' ? 'sin respuesta' : error.message}). Inténtalo de nuevo.`;
  } finally {
    payButton.disabled = false;
    console.log(statusLine.textContent);
  }
});

if (location.origin === 'null') document.querySelector('#sandbox-note').hidden = false;
updateTotal();
console.log('Listo: escribe tu nombre y correo y pulsa «Confirmar pedido»; luego marca «Simular un error del servidor»');
```
