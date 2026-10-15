---
example_description: "Informe semanal de ventas de una cadena de cafeterías: validación por registro, céntimos enteros, acumuladores con ?? y tabla alineada"
example_tags: "javascript|profesional|informe|validacion|dinero|consola"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// INFORME SEMANAL DE VENTAS de una cadena de cafeterías.
//
// Decisiones de diseño:
// - Los registros llegan como TEXTO (exportados de la caja): se convierten y validan
//   uno a uno. Un registro malo se aparta con su motivo; no tumba el informe.
// - El dinero se guarda en CÉNTIMOS enteros: así no aparecen errores de redondeo.
// - Los totales se acumulan en objetos usados como diccionarios, con ?? para el
//   primer valor de cada clave.
//
// Alcance: function se estudia en «Funciones y ámbito»; arrays, objetos y métodos de
// string (trim, replace, padStart, padEnd, repeat) en «Números, texto y colecciones».
// En producción formatearías el dinero con Intl.NumberFormat («Fechas e Intl»).

const REPORT_TITLE = 'INFORME DE VENTAS · semana 41 (5-11 de octubre de 2026)';

// Categorías admitidas → nombre que aparece en el informe.
const CATEGORY_NAMES = {
  bebidas: 'Bebidas',
  bolleria: 'Bollería',
  salado: 'Salado',
};

const rawSales = [
  { store: 'Centro', product: 'Café con leche', category: 'bebidas', units: '412', unitPrice: '1.80' },
  { store: 'Centro', product: 'Cruasán de mantequilla', category: 'bolleria', units: '238', unitPrice: '1,60' },
  { store: 'Centro', product: 'Tostada con tomate', category: 'salado', units: '190', unitPrice: '2.40' },
  { store: 'Ruzafa', product: 'Café con leche', category: 'bebidas', units: '356', unitPrice: '1.80' },
  { store: 'Ruzafa', product: 'Té chai', category: 'bebidas', units: '87', unitPrice: '2.20' },
  { store: 'Ruzafa', product: 'Bizcocho de limón', category: 'bolleria', units: '', unitPrice: '2.10' },
  { store: 'Ruzafa', product: 'Bocadillo vegetal', category: 'salado', units: '64', unitPrice: '4.50' },
  { store: 'Puerto', product: 'Café solo', category: 'bebidas', units: '298', unitPrice: '1.30' },
  { store: 'Puerto', product: 'Napolitana de chocolate', category: 'bolleria', units: '173', unitPrice: '1.70' },
  { store: 'Puerto', product: 'Zumo de naranja', category: 'zumos', units: '120', unitPrice: '2.90' },
  { store: 'Puerto', product: 'Empanadilla de atún', category: 'salado', units: '-5', unitPrice: '2.00' },
  { store: '', product: 'Café con leche', category: 'bebidas', units: '40', unitPrice: '1.80' },
];

// ── Conversión y validación ─────────────────────────────────────────────

function requireText(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`falta «${fieldName}»`);
  }
  return value.trim();
}

function parseUnits(text) {
  const units = Number(requireText(text, 'unidades')); // vacío ya descartado: Number('') sería 0
  if (!Number.isInteger(units) || units < 0) {
    throw new RangeError(`unidades no válidas («${text}»)`);
  }
  return units;
}

function parseCents(text) {
  const amount = Number(requireText(text, 'precio').replace(',', '.'));
  if (Number.isNaN(amount) || amount < 0) {
    throw new RangeError(`precio no válido («${text}»)`);
  }
  return Math.round(amount * 100);
}

function normalizeSale(raw) {
  const category = requireText(raw.category, 'categoría');
  // typeof en lugar de «=== undefined»: un objeto literal hereda propiedades como
  // toString, y CATEGORY_NAMES['toString'] sería una función («Objetos y prototipos»).
  if (typeof CATEGORY_NAMES[category] !== 'string') {
    throw new RangeError(`categoría desconocida («${category}»)`);
  }
  const units = parseUnits(raw.units);
  return {
    store: requireText(raw.store, 'tienda'),
    product: requireText(raw.product, 'producto'),
    category: category,
    units: units,
    revenueCents: units * parseCents(raw.unitPrice),
  };
}

// ── Formato ─────────────────────────────────────────────────────────────

// 123456 céntimos → '1.234,56 €' (separador de miles español).
function formatEuros(cents) {
  const euros = String(Math.floor(cents / 100));
  const decimals = String(cents % 100).padStart(2, '0');
  let grouped = '';
  let digitsInGroup = 0;
  for (let i = euros.length - 1; i >= 0; i--) {
    if (digitsInGroup === 3) {
      grouped = '.' + grouped;
      digitsInGroup = 0;
    }
    grouped = euros[i] + grouped;
    digitsInGroup++;
  }
  return `${grouped},${decimals} €`;
}

function formatShare(partCents, totalCents) {
  return `${(partCents / totalCents * 100).toFixed(1).replace('.', ',')} %`;
}

// ── Acumulación ─────────────────────────────────────────────────────────

const byCategory = {}; // { bebidas: { units, cents }, … }
const byStore = {};    // { Centro: cents, … }
const byProduct = {};  // { 'Café con leche': cents, … }
let totalCents = 0;
let totalUnits = 0;
let rejectedReport = '';
let rejectedCount = 0;
let rowNumber = 0;

for (const raw of rawSales) {
  rowNumber++;
  let sale;
  try {
    sale = normalizeSale(raw);
  } catch (error) {
    rejectedCount++;
    rejectedReport += `  fila ${rowNumber} (${raw.product || 'sin producto'}): ${error.message}\n`;
    continue;
  }

  const categoryTotals = byCategory[sale.category] ?? { units: 0, cents: 0 };
  categoryTotals.units += sale.units;
  categoryTotals.cents += sale.revenueCents;
  byCategory[sale.category] = categoryTotals;

  byStore[sale.store] = (byStore[sale.store] ?? 0) + sale.revenueCents;
  byProduct[sale.product] = (byProduct[sale.product] ?? 0) + sale.revenueCents;
  totalUnits += sale.units;
  totalCents += sale.revenueCents;
}

// Producto estrella: el de mayor facturación sumando todas las tiendas.
let topProduct = null;
for (const product in byProduct) {
  if (topProduct === null || byProduct[product] > byProduct[topProduct]) {
    topProduct = product;
  }
}

// ── Informe ─────────────────────────────────────────────────────────────

const LINE = '─'.repeat(50);
console.log(`${REPORT_TITLE}\n${LINE}`);
console.log(`${'Categoría'.padEnd(12)}${'Unidades'.padStart(10)}${'Importe'.padStart(16)}${'Cuota'.padStart(10)}`);
for (const category in byCategory) {
  const totals = byCategory[category];
  console.log(
    CATEGORY_NAMES[category].padEnd(12) +
    String(totals.units).padStart(10) +
    formatEuros(totals.cents).padStart(16) +
    formatShare(totals.cents, totalCents).padStart(10),
  );
}
console.log(LINE);
console.log(`${'TOTAL'.padEnd(12)}${String(totalUnits).padStart(10)}${formatEuros(totalCents).padStart(16)}`);

console.log('\nPor tienda:');
for (const store in byStore) {
  console.log(`  ${store.padEnd(10)}${formatEuros(byStore[store]).padStart(14)}`);
}

if (topProduct !== null) {
  console.log(`\nProducto estrella: ${topProduct} (${formatEuros(byProduct[topProduct])})`);
}

if (rejectedCount > 0) {
  console.warn(`${rejectedCount} registros apartados para revisar:\n${rejectedReport}`);
}
```
