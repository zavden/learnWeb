---
example_description: "Map.groupBy y Object.groupBy agrupan un array con una función: el equivalente de un defaultdict(list) de Python"
example_tags: "javascript|python|map|groupBy|arrays"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
const orders = [
  { id: 101, customer: 'Ana', total: 25 },
  { id: 102, customer: 'Luis', total: 12 },
  { id: 103, customer: 'Ana', total: 40 },
  { id: 104, customer: 'Marta', total: 8 },
];

// Las funciones flecha se estudian en el módulo 3: lee `order => order.customer` como `lambda order: order.customer`.

// Object.groupBy devuelve un objeto cuyas claves son strings.
const byCustomer = Object.groupBy(orders, (order) => order.customer);
console.log('Object.groupBy →', byCustomer);

// Map.groupBy devuelve un Map: la clave puede ser de cualquier tipo (aquí, un boolean).
const bySize = Map.groupBy(orders, (order) => order.total >= 20);
console.log('pedidos grandes →', bySize.get(true).map((order) => order.id));   // [101, 103]
console.log('pedidos pequeños →', bySize.get(false).map((order) => order.id)); // [102, 104]

// El mismo resultado a mano, como harías con un defaultdict(list):
const manual = new Map();
for (const order of orders) {
  if (!manual.has(order.customer)) manual.set(order.customer, []);
  manual.get(order.customer).push(order.id);
}
console.log('a mano →', manual);
```
