---
example_description: "Aplicación parcial: fijar algunos argumentos con bind, con una flecha o con un partial genérico (el functools.partial de Python)"
example_tags: "javascript|python|orden-superior|aplicacion-parcial|bind|partial"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// APLICACIÓN PARCIAL: fijar algunos argumentos de una función y obtener otra
// que solo espera el resto.
function applyVat(rate, cents) {
  return Math.round(cents * (1 + rate));
}

// 1) Con bind. Su primer argumento es el this (aquí no se usa: null);
//    los siguientes se fijan DELANTE de los que lleguen después.
const withGeneralVat = applyVat.bind(null, 0.21);
const withReducedVat = applyVat.bind(null, 0.1);
console.log('general →', withGeneralVat(1000)); // 1210
console.log('reducido →', withReducedVat(1000)); // 1100
console.log('name →', withGeneralVat.name);      // 'bound applyVat'

// 2) Con una flecha: más flexible, puedes fijar CUALQUIER argumento, no solo los primeros.
const vatOnAThousand = (rate) => applyVat(rate, 1000);
console.log('distintos tipos →', [0.04, 0.1, 0.21].map(vatOnAThousand)); // [1040, 1100, 1210]

// 3) Un partial genérico, con rest y spread (lección «Parámetros»).
const partial = (fn, ...fixed) => (...rest) => fn(...fixed, ...rest);

function formatLog(channel, level, message) {
  return `[${channel}] ${level}: ${message}`;
}
const logPayments = partial(formatLog, 'pagos');
const logPaymentErrors = partial(formatLog, 'pagos', 'ERROR');
console.log(logPayments('INFO', 'cobro aceptado'));
console.log(logPaymentErrors('tarjeta caducada'));

// Diferencia con el currying: el currying va de UN argumento en UN argumento;
// la aplicación parcial fija los que quieras de golpe y el resto llega junto.

// Un uso clásico: adaptar una función de varios argumentos a un callback de map.
const prices = [1250, 380, 4990];
console.log('con IVA →', prices.map((cents) => withGeneralVat(cents))); // [1513, 460, 6038]

// > Desde Python: functools.partial(apply_vat, 0.21) es exactamente
//   applyVat.bind(null, 0.21) o partial(applyVat, 0.21).
```
