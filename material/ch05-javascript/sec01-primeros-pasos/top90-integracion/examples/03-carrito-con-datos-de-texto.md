---
example_description: "Carrito cuyos precios y cantidades llegan como texto: conversión, validación por fila, céntimos enteros y cupones con switch"
example_tags: "javascript|integracion|coercion|switch|errores|dinero"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Integra: + con strings y conversión explícita (lección 5), for…of y switch (6),
// errores por fila sin detener el resto (7).
// function: módulo «Funciones y ámbito»; arrays y objetos: «Números, texto y colecciones».

// Así llegan los datos de un formulario: TODO es texto.
const cartRows = [
  { product: 'Café de Colombia 250 g', price: '7.90', quantity: '2' },
  { product: 'Taza de cerámica', price: '12.50', quantity: '1' },
  { product: 'Filtros de papel (100 u.)', price: '3.20', quantity: '' },
  { product: 'Molinillo manual', price: '34,90', quantity: '1' },
  { product: 'Tarjeta regalo', price: '25', quantity: '-1' },
];
const couponCode = ' verano ';

// 🐛 Recordatorio de por qué hay que convertir: + con strings concatena.
console.log("🐛 '7.90' + '12.50' →", cartRows[0].price + cartRows[1].price);

// Devuelve el importe en CÉNTIMOS (un entero). Con enteros no aparecen los
// errores de redondeo de los decimales (0.1 + 0.2, módulo «Números»).
function parsePriceInCents(text) {
  const normalized = text.trim().replace(',', '.'); // admite «34,90»
  if (normalized === '') {
    throw new TypeError('precio vacío');
  }
  const price = Number(normalized);
  if (Number.isNaN(price) || price < 0) {
    throw new RangeError(`precio no válido («${text}»)`);
  }
  return Math.round(price * 100);
}

function parseQuantity(text) {
  if (text.trim() === '') {
    throw new TypeError('falta la cantidad'); // Number('') sería 0
  }
  const quantity = Number(text);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError(`cantidad no válida («${text}»)`);
  }
  return quantity;
}

function discountRate(code) {
  // trim y toUpperCase: métodos de string («Números, texto y colecciones»).
  switch (code.trim().toUpperCase()) {
    case '':
      return 0;
    case 'VERANO':
    case 'SUMMER': // dos códigos, mismo descuento: fallthrough legítimo
      return 0.10;
    case 'BIENVENIDA':
      return 0.15;
    default:
      throw new RangeError(`el cupón «${code.trim()}» no existe`);
  }
}

function formatEuros(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}

let subtotalCents = 0;
console.group('Líneas del pedido');
for (const row of cartRows) {
  try {
    const priceCents = parsePriceInCents(row.price);
    const quantity = parseQuantity(row.quantity);
    const lineCents = priceCents * quantity;
    subtotalCents += lineCents;
    console.log(`${row.product}: ${quantity} × ${formatEuros(priceCents)} = ${formatEuros(lineCents)}`);
  } catch (error) {
    // Una fila mala no debe tumbar el pedido entero: avisamos y seguimos.
    console.warn(`Fila descartada («${row.product}»): ${error.message}`);
  }
}
console.groupEnd();

let rate = 0;
try {
  rate = discountRate(couponCode);
} catch (error) {
  console.warn(`Cupón ignorado: ${error.message}`);
}
const discountCents = Math.round(subtotalCents * rate);

console.log('Subtotal:  ', formatEuros(subtotalCents));
console.log(`Descuento (${rate * 100} %):`, '-' + formatEuros(discountCents));
console.log('Total:     ', formatEuros(subtotalCents - discountCents));
```
