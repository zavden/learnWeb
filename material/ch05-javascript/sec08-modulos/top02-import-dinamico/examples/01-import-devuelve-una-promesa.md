---
example_description: "import() carga un módulo cuando el código lo pide y devuelve una promesa de su espacio de nombres; funciona también en un script clásico, sin type=\"module\""
example_tags: "javascript|python|modulos|import-dinamico|promesas"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Archivo que usa: assets/01-factura/invoice.js (avisa cuando se evalúa).
// Este script NO es un módulo: no tiene import estático ni await de nivel
// superior. Aun así puede usar import(), que es una expresión, no una declaración.

console.log('1. el script empieza: invoice.js ni se ha pedido');

const invoicePromise = import('./01-factura/invoice.js');
console.log('2. import() devuelve →', invoicePromise);

invoicePromise.then((invoiceModule) => {
  console.log('4. módulo listo; sus exportaciones →', Object.keys(invoiceModule));
  const order = { id: 'P-1042', customer: 'Mariana Gómez', totalCents: 48720 };
  console.log('5.', invoiceModule.createInvoice(order));
});

console.log('3. el script sigue sin esperar a la descarga');

// import(ruta) pide el módulo AHORA (no antes de empezar, como el import
// estático), lo descarga con sus dependencias, lo evalúa y cumple la promesa
// con su espacio de nombres: el mismo objeto que daría import * as.
// > Desde Python: importlib.import_module('invoice') es síncrono: el programa
//   espera. import() es asíncrono, como un fetch: nada se detiene.
```
