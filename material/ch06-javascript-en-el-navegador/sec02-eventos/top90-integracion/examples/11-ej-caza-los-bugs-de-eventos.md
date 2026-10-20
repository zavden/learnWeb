---
example_description: "Ejercicio: la ficha de un producto tiene seis bugs del Bestiario del módulo (un CustomEvent que no burbujea y sin detail, un aviso antes de cambiar el estado, un onclick pisado, un listener de focus que no recibe nada, una rueda pasiva y un preventDefault después de un await); las comprobaciones simulan los eventos y los delatan"
example_tags: "javascript|eventos|ejercicio|depuracion|customevent|passive|preventdefault|focusin|bug"
exercise: true
exercise_title: "Caza los seis bugs de eventos"
exercise_instructions: "Cada bloque marcado con BUG tiene UN error del Bestiario de este módulo; ninguno detiene el script, pero las comprobaciones (que simulan los eventos con dispatchEvent) los delatan || La tarjeta debe avisar al carrito con un cart:add que llegue a document y lleve el SKU en detail || Los listeners de order:paid deben ver el pedido ya pagado || El botón «Comprar» debe ejecutar la analítica Y el pago || La ayuda debe cambiar al enfocar cualquier campo del formulario || La rueda sobre el mapa debe hacer zoom sin desplazar la página || El envío del formulario debe cancelarse aunque el cupón se compruebe con await || No toques las comprobaciones"
exercise_hints: "Un CustomEvent nace con bubbles: false y detail: null || dispatchEvent ejecuta los listeners en el acto: cambia el estado antes de avisar || Una asignación a onclick sustituye a la anterior; addEventListener acumula || focus no burbujea: focusin sí (o focus con capture: true) || Con passive: true, preventDefault() se ignora || El navegador no espera a un listener async: preventDefault() va antes del primer await"
exercise_solution_example: 11-ej-caza-los-bugs-de-eventos-solucion.md
exercise_locked_files: index.html
example_stage: exercise
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
// EJERCICIO: seis bugs, uno por bloque marcado con BUG.
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

// BUG 1: el aviso no llega a document y no dice qué producto es.
document.querySelector('#add').addEventListener('click', () => {
  card.dispatchEvent(new CustomEvent('cart:add'));
});

// BUG 2: los listeners de order:paid ven el pedido sin pagar.
const orders = new EventTarget();
orders.addEventListener('order:paid', (event) => {
  seen.paidStatus = event.detail.status;
});
function markPaid() {
  orders.dispatchEvent(new CustomEvent('order:paid', { detail: order }));
  order.status = 'pagado';
}

// BUG 3: dos partes del código conectan el mismo botón.
const buyButton = document.querySelector('#buy');
buyButton.onclick = () => { seen.analytics += 1; };   // la analítica
buyButton.onclick = () => { seen.payments += 1; };    // el pago

// BUG 4: la ayuda no cambia al enfocar un campo.
const checkout = document.querySelector('#checkout');
checkout.addEventListener('focus', (event) => {
  document.querySelector('#help').textContent = event.target.dataset.help;
});

// BUG 5: la rueda hace zoom… y además desplaza la página.
document.querySelector('#map').addEventListener('wheel', (event) => {
  event.preventDefault();
  seen.zoom += event.deltaY < 0 ? 10 : -10;
  document.querySelector('#zoom').textContent = `${seen.zoom} %`;
}, { passive: true });

// BUG 6: el formulario se envía aunque el listener llama a preventDefault().
const checkCoupon = (code) => new Promise((resolve) => setTimeout(resolve, 50, code === 'VERANO10'));
checkout.addEventListener('submit', async (event) => {
  const valid = await checkCoupon(event.target.elements.coupon.value);
  event.preventDefault();
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
