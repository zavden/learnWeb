---
example_description: "Solución: el CustomEvent burbujea y lleva detail, el estado cambia antes del aviso, addEventListener en lugar de onclick, focusin para la ayuda, la rueda con passive: false y preventDefault() antes del primer await"
example_tags: "javascript|eventos|ejercicio|depuracion|customevent|passive|preventdefault|focusin|bug"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <article id="card" class="card" data-sku="CAF-500">
    <h1>Café de Chiapas 500 g · $210.00</h1>
    <button type="button" id="add">Añadir al carrito</button>
    <button type="button" id="buy">Comprar ya</button>
    <p>En el carrito: <output id="cart-count">0</output></p>
  </article>
  <div id="map" class="map" aria-label="Mapa de la finca (rueda para hacer zoom)">Zoom: <output id="zoom">100 %</output></div>
  <form id="checkout" class="checkout" action="/pagar">
    <label>Correo <input name="email" type="email" data-help="Te enviaremos el recibo aquí"></label>
    <label>Cupón <input name="coupon" data-help="Prueba VERANO10" value="VERANO10"></label>
    <p id="help" class="help" aria-live="polite">Elige un campo.</p>
    <button type="submit">Pagar</button>
  </form>
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
  display: grid;
  gap: 0.75rem;
  max-width: 30rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.1rem;
  margin-top: 0;
}
.card,
.checkout {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.checkout {
  display: grid;
  gap: 0.4rem;
}
.map {
  padding: 1.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: repeating-linear-gradient(45deg, #ecfdf5 0 12px, #d1fae5 12px 24px);
}
.help {
  margin: 0;
  color: #52606d;
}
input,
button {
  font: inherit;
}
button:focus-visible,
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// SOLUCIÓN: los seis bloques corregidos (✅).
const card = document.querySelector('#card');
const cart = { count: 0, lastSku: null };
const order = { id: 'P-2077', status: 'pendiente' };
const seen = { paidStatus: null, analytics: 0, payments: 0, zoom: 100 };

// El carrito escucha en document.
document.addEventListener('cart:add', (event) => {
  cart.count += 1;
  cart.lastSku = event.detail?.sku ?? null;
  document.querySelector('#cart-count').textContent = cart.count;
});

// ✅ 1: bubbles: true para que suba hasta document, y los datos en detail.
document.querySelector('#add').addEventListener('click', () => {
  card.dispatchEvent(new CustomEvent('cart:add', { bubbles: true, detail: { sku: card.dataset.sku } }));
});

// ✅ 2: dispatchEvent es síncrono: primero cambia el estado, luego avisa.
const orders = new EventTarget();
orders.addEventListener('order:paid', (event) => {
  seen.paidStatus = event.detail.status;
});
function markPaid() {
  order.status = 'pagado';
  orders.dispatchEvent(new CustomEvent('order:paid', { detail: order }));
}

// ✅ 3: addEventListener acumula; onclick se pisaba.
const buyButton = document.querySelector('#buy');
buyButton.addEventListener('click', () => { seen.analytics += 1; }); // la analítica
buyButton.addEventListener('click', () => { seen.payments += 1; });  // el pago

// ✅ 4: focus no burbujea; focusin sí (también valdría focus con capture: true).
const checkout = document.querySelector('#checkout');
checkout.addEventListener('focusin', (event) => {
  document.querySelector('#help').textContent = event.target.dataset.help;
});

// ✅ 5: un listener pasivo ignora preventDefault(): passive: false.
document.querySelector('#map').addEventListener('wheel', (event) => {
  event.preventDefault();
  seen.zoom += event.deltaY < 0 ? 10 : -10;
  document.querySelector('#zoom').textContent = `${seen.zoom} %`;
}, { passive: false });

// ✅ 6: preventDefault() antes del primer await (el navegador no espera).
const checkCoupon = (code) => new Promise((resolve) => setTimeout(resolve, 50, code === 'VERANO10'));
checkout.addEventListener('submit', async (event) => {
  event.preventDefault();
  const valid = await checkCoupon(event.target.elements.coupon.value);
  document.querySelector('#help').textContent = valid ? 'Cupón aplicado: −10 %' : 'Cupón no válido';
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Simulan los eventos con dispatchEvent. El submit simulado no burbujea, para
// que la vista previa de LearnWeb no lo intercepte en window.
function check(description, compute, expected) {
  let actual;
  try {
    actual = compute();
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

check('1. «Añadir» avisa al carrito con el SKU', () => {
  click(document.querySelector('#add'));
  return `${cart.count} · ${cart.lastSku}`;
}, '1 · CAF-500');
check('2. order:paid llega con el pedido ya pagado', () => {
  markPaid();
  return seen.paidStatus;
}, 'pagado');
check('3. «Comprar ya» ejecuta la analítica y el pago', () => {
  click(buyButton);
  return `analítica ${seen.analytics} · pagos ${seen.payments}`;
}, 'analítica 1 · pagos 1');
check('4. enfocar el correo muestra su ayuda', () => {
  const email = checkout.elements.email;
  email.dispatchEvent(new FocusEvent('focus'));                  // como el navegador:
  email.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); // focus y focusin
  return document.querySelector('#help').textContent;
}, 'Te enviaremos el recibo aquí');
check('5. la rueda sobre el mapa cancela el desplazamiento', () => {
  const wheel = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
  document.querySelector('#map').dispatchEvent(wheel);
  return `${wheel.defaultPrevented} · zoom ${seen.zoom}`;
}, 'true · zoom 110');
check('6. el envío se cancela en el acto, antes del await', () => {
  const submit = new SubmitEvent('submit', { cancelable: true });
  checkout.dispatchEvent(submit);
  return submit.defaultPrevented;
}, true);
```
