---
example_description: "La cadena de ámbitos: un nombre se busca de dentro hacia fuera hasta el ámbito global; hacia dentro no se ve nada"
example_tags: "javascript|ambito|cadena-de-ambitos|funciones-anidadas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const storeName = 'Librería El Aljibe';         // ámbito GLOBAL

function createInvoice(customer) {              // ámbito de createInvoice
  const invoiceNumber = 'F-2026-0187';

  function formatLine(product, cents) {         // ámbito de formatLine (anidado)
    const price = (cents / 100).toFixed(2);
    // Desde aquí se ve TODO lo que hay hacia fuera:
    //   price, product, cents   → ámbito de formatLine
    //   invoiceNumber, customer → ámbito de createInvoice
    //   storeName               → ámbito global
    return `${invoiceNumber} | ${customer} | ${product}: ${price} € (${storeName})`;
  }

  for (const [product, cents] of [['Atlas', 2450], ['Diccionario', 1895]]) {
    // Un bloque también es un eslabón para let/const: product y cents viven aquí.
    console.log(formatLine(product, cents));
  }
}
createInvoice('CEIP Rosalía de Castro');

// Hacia DENTRO no se ve nada: desde fuera, formatLine e invoiceNumber no existen.
// (typeof no lanza error con nombres que no existen: devuelve 'undefined'.)
console.log('typeof formatLine →', typeof formatLine);       // 'undefined'
console.log('typeof invoiceNumber →', typeof invoiceNumber); // 'undefined'

// Si el nombre no aparece en NINGÚN eslabón de la cadena: ReferenceError.
function applyCoupon(cents) {
  return cents - couponCents; // couponCents no está declarada en ningún sitio
}
try {
  applyCoupon(5000);
} catch (error) {
  console.log('applyCoupon →', error.name, '|', error.message);
}

// La búsqueda se detiene en el PRIMER eslabón que tiene el nombre:
// si formatLine declarara su propio storeName, la global quedaría tapada.
```
