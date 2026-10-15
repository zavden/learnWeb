---
example_description: "Inventario que llega como JSON: parse con reviver y try/catch, alertas de stock con filter, agrupación, reposición sin mutar y pedido serializado con replacer"
example_tags: "javascript|integracion|json|arrays|objetos|fechas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// INVENTARIO de una tienda de té y café, tal como lo devuelve el servidor (texto JSON).
// Integra: JSON.parse con reviver y try/catch («JSON y copias»), filter/map/reduce
// («Arrays»), spread y Object.groupBy («Objetos literales») y Date + Intl («Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const responseText = `{
  "updatedAt": "2026-10-12T08:30:00Z",
  "items": [
    { "sku": "TE-0421", "name": "Té verde sencha 100 g", "category": "té", "priceCents": 650, "stock": 42, "minStock": 10, "lastRestock": "2026-09-28T09:00:00Z" },
    { "sku": "TE-0107", "name": "Rooibos con vainilla 100 g", "category": "té", "priceCents": 590, "stock": 6, "minStock": 10, "lastRestock": "2026-08-14T09:00:00Z" },
    { "sku": "CA-0012", "name": "Café de Etiopía 250 g", "category": "café", "priceCents": 1190, "stock": 3, "minStock": 8, "lastRestock": "2026-09-02T09:00:00Z" },
    { "sku": "CA-0033", "name": "Café descafeinado 250 g", "category": "café", "priceCents": 990, "stock": 15, "minStock": 8, "lastRestock": "2026-10-01T09:00:00Z" },
    { "sku": "AC-0300", "name": "Tetera de hierro 0,8 l", "category": "accesorios", "priceCents": 3450, "stock": 2, "minStock": 2, "lastRestock": "2026-06-20T09:00:00Z" }
  ]
}`;

// Lo que viene de fuera puede estar mal formado: JSON.parse SIEMPRE dentro de try/catch.
// El reviver convierte en Date los campos de fecha (JSON solo trae strings).
function parseInventory(text) {
  try {
    return JSON.parse(text, (key, value) => (key === 'updatedAt' || key === 'lastRestock' ? new Date(value) : value));
  } catch (error) {
    console.warn(`Inventario ilegible (${error.name}): se mantiene el anterior`);
    return null;
  }
}

parseInventory('{ "items": [], }'); // coma final: SyntaxError atrapado
const { updatedAt, items } = parseInventory(responseText);

// Alertas: stock en el mínimo o por debajo, con la última reposición en tiempo relativo.
const daysAgo = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
const lowStock = items.filter((item) => item.stock <= item.minStock);
console.log(`⚠ ${lowStock.length} productos con poco stock:`);
for (const item of lowStock) {
  const days = Math.floor((updatedAt - item.lastRestock) / (24 * 60 * 60 * 1000)); // restar fechas da ms
  console.log(`  ${item.sku} ${item.name}: ${item.stock}/${item.minStock} · repuesto ${daysAgo.format(-days, 'day')}`);
}

// Valor del almacén en céntimos (enteros exactos) y unidades por categoría.
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const valueCents = items.reduce((sum, item) => sum + item.priceCents * item.stock, 0);
console.log('valor del almacén →', money.format(valueCents / 100));
const byCategory = Object.groupBy(items, (item) => item.category);
const unitsByCategory = Object.fromEntries(
  Object.entries(byCategory).map(([category, group]) => [category, group.reduce((sum, item) => sum + item.stock, 0)]),
);
console.log('unidades por categoría →', unitsByCategory);

// Reposición SIN mutar: map + spread crean objetos nuevos; el inventario original no cambia.
const restockDate = new Date('2026-10-13T09:00:00Z');
const restocked = items.map((item) =>
  item.stock <= item.minStock ? { ...item, stock: item.minStock * 3, lastRestock: restockDate } : item,
);
console.log('original TE-0107 →', items[1].stock, '| repuesto →', restocked[1].stock);
console.log('¿mismo objeto TE-0421? →', items[0] === restocked[0]); // sin cambios: se reutiliza

// Avisar a la tienda online de los cambios: el replacer (array de claves) deja solo lo que
// necesita. La Date se escribe sola como string ISO (toJSON).
const changed = restocked.filter((item) => item.lastRestock === restockDate);
console.log(JSON.stringify({ syncedAt: restockDate, items: changed }, ['syncedAt', 'items', 'sku', 'stock'], 2));
```
