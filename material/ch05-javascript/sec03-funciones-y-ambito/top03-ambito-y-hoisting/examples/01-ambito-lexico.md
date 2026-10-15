---
example_description: "Ámbito léxico: una función ve las variables del sitio donde está escrita, no las de quien la llama"
example_tags: "javascript|python|ambito|lexico|funciones"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Cada función crea su propio ÁMBITO: sus parámetros y variables solo existen dentro.
// Y es LÉXICO: una función ve las variables del sitio donde está ESCRITA
// (su «léxico», el texto del programa), no las del sitio desde donde se LLAMA.
const currency = 'EUR';

function formatPrice(amount) {
  // ¿Qué currency es esta? La que rodea a formatPrice EN EL TEXTO: la global.
  return `${amount.toFixed(2)} ${currency}`;
}

function printMexicanReceipt() {
  const currency = 'MXN'; // variable LOCAL de printMexicanReceipt
  console.log('currency aquí dentro →', currency);              // 'MXN'
  console.log('formatPrice(250) →', formatPrice(250));          // '250.00 EUR' ← ¡no MXN!
}
printMexicanReceipt();

// formatPrice no puede ver las variables de quien la llama.
// Si necesita la moneda, hay que pasársela como argumento:
function formatPriceIn(amount, currencyCode) {
  return `${amount.toFixed(2)} ${currencyCode}`;
}
console.log('formatPriceIn(250, \'MXN\') →', formatPriceIn(250, 'MXN'));

// Hacia fuera de una función, sus variables no existen.
function computeTax(cents) {
  const taxRate = 0.16;
  return Math.round(cents * taxRate);
}
console.log('computeTax(1000) →', computeTax(1000)); // 160
try {
  console.log(taxRate);
} catch (error) {
  console.log('fuera de computeTax →', error.name, '|', error.message);
}

// > Desde Python: igual. Python también tiene ámbito léxico (la regla LEGB:
//   Local, Enclosing, Global, Built-in). Lo raro sería lo contrario, el
//   «ámbito dinámico», que casi ningún lenguaje moderno usa.
```
