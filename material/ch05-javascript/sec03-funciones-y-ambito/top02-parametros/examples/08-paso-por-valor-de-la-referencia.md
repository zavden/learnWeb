---
example_description: "Los argumentos se pasan por valor, y el valor de un objeto es una referencia: reasignar el parámetro no afecta fuera, modificar el objeto sí (como en Python)"
example_tags: "javascript|python|funciones|parametros|referencias|mutacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Al llamar a una función, cada parámetro recibe una COPIA del valor del argumento.
// Si el valor es un objeto, lo que se copia es la REFERENCIA (la flecha), no el objeto.

// 1) Reasignar el parámetro solo cambia la variable LOCAL.
function resetScore(score) {
  score = 0;
}
let points = 120;
resetScore(points);
console.log('points →', points); // 120

function replaceCart(cart) {
  cart = { items: [] }; // el parámetro apunta a otro objeto; el de fuera, no
}
const myCart = { items: ['Libro'] };
replaceCart(myCart);
console.log('myCart.items →', myCart.items); // ['Libro']

// 2) MODIFICAR el objeto a través del parámetro SÍ se ve fuera:
//    las dos variables apuntan al MISMO objeto.
function addItem(cart, item) {
  cart.items.push(item);
}
addItem(myCart, 'Lámpara');
console.log('myCart.items tras addItem →', myCart.items); // ['Libro', 'Lámpara']

//   myCart ─────┐
//               ├──► { items: ['Libro', 'Lámpara'] }
//   cart  ──────┘   (dentro de addItem)

// 3) ✅ Si la función no debe tocar el original, que devuelva uno NUEVO.
//    (Es la base de la inmutabilidad: lección «Funciones de orden superior».)
function withItem(cart, item) {
  return { ...cart, items: [...cart.items, item] };
}
const updated = withItem(myCart, 'Taza');
console.log('updated.items →', updated.items); // ['Libro', 'Lámpara', 'Taza']
console.log('myCart.items intacto →', myCart.items); // ['Libro', 'Lámpara']

// > Desde Python: es EXACTAMENTE el mismo modelo («paso por asignación»):
//   def f(lista): lista = []        → no afecta fuera
//   def f(lista): lista.append(1)   → sí afecta fuera
```
