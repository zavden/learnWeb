---
example_description: "Fábricas de funciones: funciones que fabrican funciones configuradas (formateadores, validadores, generadores de ids)"
example_tags: "javascript|python|closures|fabricas|intl"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una FÁBRICA recibe la configuración una vez y devuelve una función lista para usar.

// 1) Formateador de moneda: el Intl.NumberFormat se crea UNA vez y el closure
//    lo reutiliza en cada llamada (crearlo cada vez sería más lento).
function makeMoneyFormatter(locale, currency) {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  return (cents) => formatter.format(cents / 100);
}
const formatEUR = makeMoneyFormatter('es-ES', 'EUR');
const formatMXN = makeMoneyFormatter('es-MX', 'MXN');
console.log('formatEUR(129900) →', formatEUR(129900)); // '1299,00 €'
console.log('formatMXN(129900) →', formatMXN(129900)); // '$1,299.00'

// 2) Validadores con los límites «horneados» dentro.
function makeRangeValidator(min, max, fieldName) {
  return (value) => {
    if (value < min) return `${fieldName}: mínimo ${min}`;
    if (value > max) return `${fieldName}: máximo ${max}`;
    return null; // sin error
  };
}
const validateAge = makeRangeValidator(18, 120, 'Edad');
const validateGuests = makeRangeValidator(1, 8, 'Comensales');
console.log('validateAge(16) →', validateAge(16));        // 'Edad: mínimo 18'
console.log('validateGuests(12) →', validateGuests(12));  // 'Comensales: máximo 8'
console.log('validateGuests(4) →', validateGuests(4));    // null

// 3) Generador de identificadores: cada fábrica lleva su propia cuenta.
function makeIdGenerator(prefix) {
  let next = 1;
  return () => `${prefix}-${String(next++).padStart(4, '0')}`;
}
const nextOrderId = makeIdGenerator('PED');
const nextInvoiceId = makeIdGenerator('FAC');
console.log(nextOrderId(), nextOrderId(), nextInvoiceId()); // PED-0001 PED-0002 FAC-0001

// > Desde Python: lo mismo que una función que devuelve una función interior,
//   o que functools.partial cuando solo fijas argumentos.
```
