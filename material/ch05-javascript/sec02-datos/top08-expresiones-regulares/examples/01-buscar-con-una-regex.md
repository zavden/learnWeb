---
example_description: "Una regex literal /patrón/flags y los métodos para buscar: test, search, match sin g (la primera, con detalles) y con g (todas), matchAll y exec"
example_tags: "javascript|regex|expresiones-regulares|test|match|matchall|python"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una expresión regular describe un PATRÓN de texto. Se escribe entre barras,
// como un string entre comillas, y los flags van detrás: /patrón/flags.
const sku = /CAF-\d{3}/; // «CAF-» y tres cifras (\d = una cifra; {3} = tres veces)
console.log('typeof →', typeof sku, '| source →', sku.source);

const order = 'Pedido: CAF-500 x2, CAC-250 x1, CAF-120 x3';

// test: ¿aparece en algún sitio? → true/false
console.log('test →', sku.test(order));
// search: ¿dónde aparece por primera vez? → índice, o -1 (como indexOf)
console.log('search →', order.search(sku));

// match SIN g: la PRIMERA coincidencia, con detalles (o null si no hay)
const first = order.match(sku);
console.log('match →', first);
console.log('first[0] →', first[0], '| index →', first.index);
// exec es lo mismo, pero es un método de la regex: sku.exec(order)
console.log('exec →', sku.exec(order)[0]);

// match CON g (global): TODAS las coincidencias, solo el texto
const anyCode = /CA[FC]-\d{3}/g; // [FC] = una F o una C
console.log('flags →', anyCode.flags);
console.log('match g →', order.match(anyCode));
// Si no hay ninguna, null (no un array vacío): protégete con ?? []
console.log('sin coincidencias →', 'Pedido vacío'.match(anyCode));
console.log('cuántas →', ('Pedido vacío'.match(anyCode) ?? []).length);

// matchAll (necesita g): todas, CON detalles. Devuelve un iterador (módulo
// «Iteradores, generadores y metaprogramación»); [...] lo convierte en array.
const all = [...order.matchAll(anyCode)];
console.log('matchAll →', all.map((match) => `${match[0]} en ${match.index}`));

// El flag i ignora mayúsculas y minúsculas
console.log('sin i →', /caf-\d{3}/.test('CAF-500'), '| con i →', /caf-\d{3}/i.test('CAF-500'));
```
