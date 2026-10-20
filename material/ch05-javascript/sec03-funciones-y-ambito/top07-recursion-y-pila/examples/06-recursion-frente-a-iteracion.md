---
example_description: "El mismo recorrido de un árbol con recursión y con un bucle y una pila explícita; con 20 000 niveles de anidamiento, solo la versión iterativa aguanta"
example_tags: "javascript|python|recursion|iteracion|pila-explicita|arboles"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un menú con categorías anidadas: cada elemento puede tener children.
const menu = [
  { name: 'Inicio' },
  {
    name: 'Tienda',
    children: [
      { name: 'Libros', children: [{ name: 'Novela' }, { name: 'Ensayo' }] },
      { name: 'Papelería' },
    ],
  },
  { name: 'Contacto' },
];

// Versión RECURSIVA: corta y fiel a la forma de los datos.
function countRecursive(items) {
  return items.reduce((count, item) => count + 1 + countRecursive(item.children ?? []), 0);
}

// Versión ITERATIVA: un bucle y una pila PROPIA (un array con push y pop).
// La pila explícita vive en la memoria normal, no en la pila de llamadas.
function countIterative(items) {
  const pending = [...items];
  let count = 0;
  while (pending.length > 0) {
    const item = pending.pop();
    count += 1;
    if (item.children) pending.push(...item.children);
  }
  return count;
}
console.log('recursiva →', countRecursive(menu)); // 7
console.log('iterativa →', countIterative(menu)); // 7

// Un anidamiento EXTREMO: 20 000 niveles (como un hilo de respuestas a respuestas).
function buildDeepThread(levels) {
  let node = { name: 'última respuesta' };
  for (let level = levels - 1; level >= 0; level--) {
    node = { name: `respuesta ${level}`, children: [node] };
  }
  return [node];
}
const deepThread = buildDeepThread(20_000);

try {
  console.log('recursiva →', countRecursive(deepThread));
} catch (error) {
  console.log('🐛 recursiva →', error.name, '|', error.message);
}
console.log('✅ iterativa →', countIterative(deepThread)); // 20001

// Regla práctica: la recursión es más clara para datos anidados de profundidad
// razonable (menús, carpetas, JSON). Si la profundidad la controla el usuario
// o puede ser enorme, usa un bucle con una pila explícita.
```
