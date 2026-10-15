---
example_description: "Desestructurar un parámetro sin = {} lanza TypeError cuando se llama a la función sin el objeto de opciones"
example_tags: "javascript|funciones|parametros|desestructuracion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 Los defaults de DENTRO del patrón solo actúan si el objeto existe.
function formatPrice(cents, { currency = 'EUR', locale = 'es-ES' }) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

console.log(formatPrice(1999, { currency: 'USD', locale: 'en-US' })); // '$19.99'
console.log(formatPrice(1999, {}));                                   // '19,99 €'

try {
  // Sin segundo argumento, el patrón intenta leer currency… de undefined.
  console.log(formatPrice(1999));
} catch (error) {
  console.log('🐛 formatPrice(1999) →', error.name, '|', error.message);
}

// Es lo mismo que escribir esto, que falla por la misma razón:
//   const { currency = 'EUR' } = undefined;   // TypeError

// ✅ Añade = {} al patrón: si falta el objeto, se desestructura un objeto vacío
// y entonces SÍ actúan los defaults de dentro.
function formatPriceSafe(cents, { currency = 'EUR', locale = 'es-ES' } = {}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
console.log('✅ formatPriceSafe(1999) →', formatPriceSafe(1999)); // '19,99 €'
console.log('✅ con MXN →', formatPriceSafe(149950, { currency: 'MXN', locale: 'es-MX' })); // '$1,499.50'

// Dos niveles de default, dos preguntas distintas:
//   { currency = 'EUR' }   ← ¿y si el objeto no trae currency?
//   = {}                   ← ¿y si no hay objeto?
// (Intl.NumberFormat da formato de moneda: lo viste en «Fechas e Intl».)
```
