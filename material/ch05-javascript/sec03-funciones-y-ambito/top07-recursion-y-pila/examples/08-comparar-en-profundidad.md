---
example_description: "deepEqual recursivo: comparar objetos y arrays por contenido a cualquier profundidad, sin depender del orden de las claves como el truco de JSON"
example_tags: "javascript|python|recursion|igualdad|objetos|arrays"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// JavaScript no tiene un operador de igualdad de CONTENIDO («JSON y copias»):
// === entre objetos compara referencias. Lo escribimos con recursión.
function deepEqual(a, b) {
  if (a === b) return true; // mismo primitivo o mismo objeto
  const bothObjects = typeof a === 'object' && a !== null && typeof b === 'object' && b !== null;
  if (!bothObjects) return false; // primitivos distintos (o uno es objeto y el otro no)
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  // Caso recursivo: cada propiedad puede ser, a su vez, un objeto o un array.
  return keysA.every((key) => keysB.includes(key) && deepEqual(a[key], b[key]));
}

const savedOrder = {
  id: 'PED-0042',
  customer: { name: 'Lucía', address: { city: 'Sevilla', zip: '41003' } },
  lines: [{ sku: 'BK-01', qty: 2 }, { sku: 'MG-07', qty: 1 }],
};
// Mismo contenido, otras referencias y otro orden de claves:
const editedOrder = {
  lines: [{ qty: 2, sku: 'BK-01' }, { sku: 'MG-07', qty: 1 }],
  customer: { address: { zip: '41003', city: 'Sevilla' }, name: 'Lucía' },
  id: 'PED-0042',
};

console.log('=== →', savedOrder === editedOrder);                              // false
console.log('mismo JSON →', JSON.stringify(savedOrder) === JSON.stringify(editedOrder)); // false: orden de claves
console.log('deepEqual →', deepEqual(savedOrder, editedOrder));               // true

const changedOrder = structuredClone(savedOrder);
changedOrder.lines[1].qty = 3;
console.log('deepEqual tras cambiar una cantidad →', deepEqual(savedOrder, changedOrder)); // false

// Límites de esta versión (las librerías los cubren): NaN no es igual a NaN,
// no entiende Date, Map ni Set, y una referencia circular (un objeto que se
// contiene a sí mismo) la haría recurrir sin fin hasta desbordar la pila.
// > Desde Python: es lo que hace == con dicts y listas anidados.
```
