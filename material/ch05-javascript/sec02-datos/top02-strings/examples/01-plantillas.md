---
example_description: "Plantillas con comillas invertidas: las f-strings de JavaScript, sin mini-lenguaje de formato"
example_tags: "javascript|python|strings|plantillas|template-literals"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Las plantillas (template literals) van entre comillas invertidas y usan ${…}:
// son las f-strings de Python. Dentro de ${} cabe cualquier EXPRESIÓN.
const product = 'Auriculares';
const unitPrice = 24.5;
const quantity = 2;
console.log(`Has añadido ${quantity} × ${product}`);
console.log(`Total: ${(unitPrice * quantity).toFixed(2)} €`);   // f"{price * qty:.2f}"
console.log(`Envío: ${quantity >= 2 ? 'gratis' : '3,99 €'}`);   // un ternario dentro

// No hay mini-lenguaje de formato ({x:>8}, {x:.2f}): se usan métodos.
// padEnd y padStart rellenan hasta una longitud (ljust y rjust de Python).
console.log(`|${product.padEnd(14, '.')}|${String(quantity).padStart(4)}|`);

// Pueden ocupar varias líneas: los saltos de línea y los espacios se conservan.
const ticket = `Pedido 1042
  ${quantity} × ${product}
  Total: ${unitPrice * quantity} €`;
console.log(ticket);

// ${} convierte el valor con String(valor)… y algunos resultados no sirven:
console.log('array →', `${['rojo', 'azul']}`); // 'rojo,azul'
console.log('objeto →', `${{ id: 7 }}`);      // '[object Object]' 🐛
console.log('null →', `${null}`);             // 'null'
// (En Python, f"{['rojo', 'azul']}" da "['rojo', 'azul']" y f"{None}" da 'None'.)

// Las comillas simples y dobles NO interpolan: ${…} queda como texto.
console.log('Total: ${quantity}'); // 'Total: ${quantity}'

// Escapes: \n (salto de línea), \t (tabulador), \' y \", \u{…} (code point).
console.log('Línea 1\nLínea 2\tcon tabulador \u{1F44B}');
```
