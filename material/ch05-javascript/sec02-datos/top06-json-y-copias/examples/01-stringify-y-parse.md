---
example_description: "JSON.stringify convierte un valor en texto JSON y JSON.parse lo reconstruye; el tercer argumento de stringify indenta"
example_tags: "javascript|python|json|serializacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const order = {
  id: 1042,
  customer: 'Ana',
  items: [{ sku: 'CAF-01', qty: 2 }, { sku: 'TAZ-07', qty: 1 }],
  paid: true,
  coupon: null,
};

// Objeto → texto. Es lo que viaja por la red o se guarda en localStorage.
const text = JSON.stringify(order);
console.log('typeof text →', typeof text);   // 'string'
console.log(text);

// Con indentación (el tercer argumento), como json.dumps(order, indent=2) en Python.
console.log(JSON.stringify(order, null, 2));

// Texto → valor nuevo. Es una COPIA: no tiene nada que ver con el objeto original.
const copy = JSON.parse(text);
console.log('copy.items[0].sku →', copy.items[0].sku);
console.log('copy === order →', copy === order);   // false

// En JSON las claves van SIEMPRE entre comillas dobles y no hay comentarios ni undefined.
// > Desde Python: json.dumps / json.loads hacen lo mismo; None ↔ null, True ↔ true.
```
