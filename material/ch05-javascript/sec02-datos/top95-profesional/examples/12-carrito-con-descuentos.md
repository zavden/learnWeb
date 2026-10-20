---
example_description: "Carrito con promociones 3x2, descuento por producto, cupones de un Map, envío gratis desde un umbral y desglose del IVA por tipo sin perder un céntimo"
example_tags: "javascript|profesional|dinero|redondeo|map|interfaz"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <h1>Tu cesta</h1>

  <section class="card" aria-labelledby="products-title">
    <h2 id="products-title">Productos</h2>
    <ul id="products" class="products"></ul>
  </section>

  <section class="card summary" aria-labelledby="summary-title">
    <h2 id="summary-title">Resumen</h2>
    <form id="coupon-form" class="coupon" novalidate>
      <label for="coupon">Cupón</label>
      <div class="coupon-row">
        <input id="coupon" name="coupon" type="text" value=" bienvenida5" autocomplete="off" aria-describedby="coupon-message">
        <button type="submit">Aplicar</button>
      </div>
      <p id="coupon-message" class="coupon-message" aria-live="polite"></p>
      <p class="hint">Prueba BIENVENIDA5, CAFE10 o ENVIOGRATIS.</p>
    </form>
    <dl id="totals" class="totals" aria-live="polite"></dl>
    <details class="vat">
      <summary>Desglose del IVA (incluido)</summary>
      <table>
        <thead>
          <tr><th scope="col">Tipo</th><th scope="col" class="num">Base</th><th scope="col" class="num">Cuota</th><th scope="col" class="num">Total</th></tr>
        </thead>
        <tbody id="vat-body"></tbody>
      </table>
    </details>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --field-border: #8a929c;
  --accent: #0b5cad;
  --accent-bg: #e7f0fa;
  --ok: #1a6b3c;
  --ok-bg: #e3f4ea;
  --danger: #9b1c1c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.products {
  margin: 0;
  padding: 0;
  list-style: none;
}

.product {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.25rem 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--accent-bg);
}

.product-name {
  font-weight: 600;
}

.product-meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.promo {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: var(--ok-bg);
  color: var(--ok);
  font-size: 0.8rem;
  font-weight: 600;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.line-total {
  grid-column: 1 / -1;
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

input,
button {
  font: inherit;
}

input {
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--field-border);
  border-radius: 0.5rem;
  color: var(--text);
  background: var(--surface);
}

.quantity input {
  width: 4.5rem;
}

button {
  padding: 0.45rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.coupon label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.coupon-row {
  display: flex;
  gap: 0.5rem;
}

.coupon-row input {
  flex: 1;
  min-width: 0;
}

.coupon-message {
  margin: 0.4rem 0 0;
  font-weight: 600;
}

.coupon-message[data-state='ok'] {
  color: var(--ok);
}

.coupon-message[data-state='error'] {
  color: var(--danger);
}

.hint {
  margin: 0.25rem 0 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.totals {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.35rem 1rem;
  font-variant-numeric: tabular-nums;
}

.totals dt {
  color: var(--muted);
}

.totals dd {
  margin: 0;
  text-align: right;
}

.totals .discount {
  color: var(--ok);
}

.totals .grand {
  padding-top: 0.5rem;
  border-top: 2px solid var(--text);
  color: var(--text);
  font-size: 1.2rem;
  font-weight: 700;
}

.vat {
  margin-top: 1rem;
}

.vat summary {
  cursor: pointer;
  color: var(--accent);
  font-weight: 600;
}

table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid var(--accent-bg);
  text-align: left;
}

.num {
  text-align: right;
}

@media (width >= 50rem) {
  .app {
    grid-template-columns: 3fr 2fr;
    align-items: start;
  }

  h1 {
    grid-column: 1 / -1;
  }
}
```

# JavaScript

```javascript
// CESTA DE LA COMPRA con promociones, cupones e IVA incluido.
//
// Reglas de negocio (y de redondeo) de la tienda:
// - Los precios llevan el IVA incluido, como exige la ley para vender a particulares.
// - Todo se calcula en CÉNTIMOS enteros; cada descuento se redondea a céntimos en cuanto
//   aparece (Math.round), línea a línea.
// - El cupón de importe fijo se REPARTE entre las líneas en proporción a su importe,
//   porque cada línea puede tener un IVA distinto (4 %, 10 % o 21 %). Los céntimos que
//   sobran del reparto van a la línea más cara: la suma cuadra siempre.
// - Desglose del IVA por tipo: base = Math.round(total / (1 + tipo)) y cuota = total − base,
//   así base + cuota es exactamente el total.
//
// Alcance: function y las flechas, en «Funciones y ámbito»; querySelector, textContent,
// createElement, append y addEventListener, en el capítulo 6 (el DOM y los eventos).

const PRODUCTS = new Map([
  ['CAF-ETI', { name: 'Café de Etiopía 250 g', priceCents: 1190, vat: 10 }],
  ['TE-SEN', { name: 'Té verde sencha 100 g', priceCents: 650, vat: 10, promo: { type: '3x2' } }],
  ['TAZ-CER', { name: 'Taza de cerámica', priceCents: 1250, vat: 21 }],
  ['MOL-MAN', { name: 'Molinillo manual', priceCents: 3490, vat: 21, promo: { type: 'percent', percent: 15 } }],
  ['LIB-BAR', { name: 'Libro «El oficio del barista»', priceCents: 2200, vat: 4 }],
]);

const COUPONS = new Map([
  ['BIENVENIDA5', { type: 'fixed', cents: 500, minCents: 3000, label: '5 € de bienvenida' }],
  ['CAFE10', { type: 'percent', percent: 10, skus: new Set(['CAF-ETI']), label: '10 % en café' }],
  ['ENVIOGRATIS', { type: 'shipping', label: 'envío gratis' }],
]);

const SHIPPING_CENTS = 495;
const SHIPPING_VAT = 21;
const FREE_SHIPPING_FROM_CENTS = 5000;

// ── Lógica (no toca el DOM) ─────────────────────────────────────────────

function promoDiscountCents(product, quantity) {
  if (!product.promo) return 0;
  if (product.promo.type === '3x2') return Math.floor(quantity / 3) * product.priceCents; // 1 de cada 3, gratis
  return Math.round(product.priceCents * quantity * product.promo.percent / 100);
}

// Reparte «amount» céntimos entre las líneas en proporción a weights. Devuelve enteros
// que suman EXACTAMENTE amount (los sobrantes, a la línea de mayor peso).
function distribute(amount, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const shares = weights.map((weight) => Math.floor(amount * weight / total));
  const leftover = amount - shares.reduce((sum, share) => sum + share, 0);
  const biggest = weights.indexOf(Math.max(...weights));
  return shares.with(biggest, shares[biggest] + leftover);
}

function resolveCoupon(rawCode, subtotalCents, lines) {
  const code = rawCode.trim().toUpperCase();
  if (code === '') return { coupon: null, message: '' };
  if (!COUPONS.has(code)) return { coupon: null, message: `El cupón «${code}» no existe o ha caducado.`, error: true };
  const coupon = COUPONS.get(code);
  if (coupon.minCents && subtotalCents < coupon.minCents) {
    const missing = euros(coupon.minCents - subtotalCents);
    return { coupon: null, message: `${code} necesita una compra mínima de ${euros(coupon.minCents)}: te faltan ${missing}.`, error: true };
  }
  if (coupon.skus && !lines.some((line) => coupon.skus.has(line.sku))) {
    return { coupon: null, message: `${code} no se aplica a ningún producto de tu cesta.`, error: true };
  }
  return { coupon, code, message: `Cupón ${code} aplicado: ${coupon.label}.` };
}

// [tipo, total con IVA] → { rate, base, vat, gross }, con base + vat === gross.
function vatRow([rate, gross]) { // los parámetros también se pueden desestructurar
  const base = Math.round(gross / (1 + rate / 100));
  return { rate, base, vat: gross - base, gross };
}

function computeCart(quantities, rawCoupon) {
  // 1. Líneas con promoción.
  const lines = [];
  for (const [sku, quantity] of quantities) {
    if (quantity === 0) continue;
    const product = PRODUCTS.get(sku);
    const grossCents = product.priceCents * quantity;
    const promoCents = promoDiscountCents(product, quantity);
    lines.push({ sku, quantity, product, grossCents, promoCents, netCents: grossCents - promoCents });
  }
  const subtotalCents = lines.reduce((sum, line) => sum + line.netCents, 0);

  // 2. Cupón (sobre el subtotal ya rebajado).
  const couponResult = resolveCoupon(rawCoupon, subtotalCents, lines);
  const coupon = couponResult.coupon;
  let couponShares = lines.map(() => 0);
  if (coupon?.type === 'fixed') {
    couponShares = distribute(Math.min(coupon.cents, subtotalCents), lines.map((line) => line.netCents));
  } else if (coupon?.type === 'percent') {
    couponShares = lines.map((line) => (coupon.skus.has(line.sku) ? Math.round(line.netCents * coupon.percent / 100) : 0));
  }
  const couponCents = couponShares.reduce((sum, share) => sum + share, 0);
  const goodsCents = subtotalCents - couponCents;

  // 3. Envío: gratis desde el umbral (sobre lo que se paga por los productos) o con cupón.
  const freeShipping = goodsCents >= FREE_SHIPPING_FROM_CENTS || coupon?.type === 'shipping';
  const shippingCents = lines.length === 0 || freeShipping ? 0 : SHIPPING_CENTS;

  // 4. IVA por tipo: un Map tipo → total pagado con ese tipo.
  const grossByVat = new Map();
  for (const [index, line] of lines.entries()) {
    const paid = line.netCents - couponShares[index];
    grossByVat.set(line.product.vat, (grossByVat.get(line.product.vat) ?? 0) + paid);
  }
  if (shippingCents > 0) {
    grossByVat.set(SHIPPING_VAT, (grossByVat.get(SHIPPING_VAT) ?? 0) + shippingCents);
  }
  const vatRows = [...grossByVat].toSorted((a, b) => a[0] - b[0]).map((entry) => vatRow(entry));

  return {
    lines, subtotalCents, couponResult, couponCents, shippingCents,
    missingForFreeShipping: freeShipping ? 0 : FREE_SHIPPING_FROM_CENTS - goodsCents,
    totalCents: goodsCents + shippingCents,
    vatRows,
  };
}

// ── Formatos ────────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const percent = new Intl.NumberFormat('es-ES', { style: 'percent' });
function euros(cents) {
  return money.format(cents / 100);
}

// ── Interfaz ────────────────────────────────────────────────────────────

const quantities = new Map([['CAF-ETI', 2], ['TE-SEN', 3], ['TAZ-CER', 1], ['MOL-MAN', 0], ['LIB-BAR', 1]]);
const productList = document.querySelector('#products');
const couponForm = document.querySelector('#coupon-form');
const couponInput = document.querySelector('#coupon');
const couponMessage = document.querySelector('#coupon-message');
const totalsList = document.querySelector('#totals');
const vatBody = document.querySelector('#vat-body');
const lineTotals = new Map(); // sku → párrafo con el importe de la línea
let appliedCoupon = couponInput.value;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildProducts() {
  for (const [sku, product] of PRODUCTS) {
    const item = element('li', 'product');
    const info = element('div');
    const name = element('span', 'product-name', product.name);
    if (product.promo) {
      name.append(element('span', 'promo', product.promo.type === '3x2' ? '3x2' : `−${product.promo.percent} %`));
    }
    info.append(name, element('p', 'product-meta', `${euros(product.priceCents)} · IVA ${percent.format(product.vat / 100)} incluido`));

    const quantity = element('div', 'quantity');
    const input = element('input');
    input.type = 'number';
    input.min = '0';
    input.max = '20';
    input.step = '1';
    input.value = String(quantities.get(sku));
    input.id = `qty-${sku}`;
    const label = element('label', '', 'Uds.');
    label.htmlFor = input.id; // htmlFor es el atributo for de <label>
    input.addEventListener('input', handleQuantityInput);
    quantity.append(label, input);

    const total = element('p', 'line-total');
    lineTotals.set(sku, total);
    item.append(info, quantity, total);
    productList.append(item);
  }
}

// event.target es el campo que ha cambiado; su id es 'qty-' + sku (capítulo 6: eventos).
function handleQuantityInput(event) {
  const sku = event.target.id.slice('qty-'.length);
  const value = Number(event.target.value);
  // Un campo vacío o fuera de rango cuenta como 0 hasta que se corrija.
  quantities.set(sku, Number.isInteger(value) && value >= 0 && value <= 20 ? value : 0);
  render();
}

function addTotal(term, value, className) {
  const dt = element('dt', className, term);
  const dd = element('dd', className, value);
  totalsList.append(dt, dd);
}

function render() {
  const cart = computeCart(quantities, appliedCoupon);

  for (const [sku, paragraph] of lineTotals) {
    const line = cart.lines.find((item) => item.sku === sku);
    if (line === undefined) {
      paragraph.textContent = '';
    } else if (line.promoCents > 0) {
      paragraph.textContent = `${euros(line.grossCents)} − ${euros(line.promoCents)} = ${euros(line.netCents)}`;
    } else {
      paragraph.textContent = euros(line.netCents);
    }
  }

  const { message, error } = cart.couponResult;
  couponMessage.textContent = message;
  couponMessage.setAttribute('data-state', error ? 'error' : 'ok');

  totalsList.textContent = '';
  const promoCents = cart.lines.reduce((sum, line) => sum + line.promoCents, 0);
  addTotal('Productos', euros(cart.subtotalCents + promoCents));
  if (promoCents > 0) addTotal('Promociones', `−${euros(promoCents)}`, 'discount');
  if (cart.couponCents > 0) addTotal(`Cupón ${cart.couponResult.code}`, `−${euros(cart.couponCents)}`, 'discount');
  const shippingNote = cart.missingForFreeShipping > 0 ? ` (gratis si añades ${euros(cart.missingForFreeShipping)})` : '';
  addTotal(`Envío${shippingNote}`, cart.shippingCents === 0 ? 'Gratis' : euros(cart.shippingCents));
  addTotal('Total', euros(cart.totalCents), 'grand');

  vatBody.textContent = '';
  for (const row of cart.vatRows) {
    const tr = element('tr');
    tr.append(element('td', '', percent.format(row.rate / 100)), element('td', 'num', euros(row.base)),
      element('td', 'num', euros(row.vat)), element('td', 'num', euros(row.gross)));
    vatBody.append(tr);
  }
  return cart;
}

function handleCouponSubmit(event) {
  event.preventDefault(); // el formulario no recarga la página
  appliedCoupon = couponInput.value;
  render();
}
couponForm.addEventListener('submit', handleCouponSubmit);

buildProducts();
const initial = render();

// Comprobación de cuadre: la suma del desglose del IVA es exactamente el total.
const vatSum = initial.vatRows.reduce((sum, row) => sum + row.base + row.vat, 0);
console.log('total →', euros(initial.totalCents), '| ¿cuadra el desglose? →', vatSum === initial.totalCents);
// ({ … }): la flecha devuelve un objeto («Funciones y ámbito»).
console.table(initial.vatRows.map((row) => ({ tipo: `${row.rate} %`, base: euros(row.base), cuota: euros(row.vat), total: euros(row.gross) })));
console.log('reparto del cupón de 5 € →', distribute(500, initial.lines.map((line) => line.netCents)));
```
