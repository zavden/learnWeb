---
example_description: "Infinity y desbordamiento; isNaN e isFinite globales convierten antes de mirar, Number.isNaN y Number.isFinite no"
example_tags: "javascript|python|numeros|nan|infinity|coercion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Infinity aparece al dividir entre 0 o al salirse del rango (desbordamiento).
console.log('1 / 0 →', 1 / 0);                             // Infinity
console.log('Number.MAX_VALUE →', Number.MAX_VALUE);       // 1.7976931348623157e+308
console.log('1e308 * 10 →', 1e308 * 10);                   // Infinity (Python: inf)
console.log('Infinity - Infinity →', Infinity - Infinity); // NaN

// 🐛 Las funciones GLOBALES isNaN e isFinite convierten su argumento a number
// antes de mirar: no responden «¿es NaN?», sino «¿daría NaN al convertirlo?».
console.table({
  "'hola'":    { isNaN: isNaN('hola'),    'Number.isNaN': Number.isNaN('hola') },
  "''":        { isNaN: isNaN(''),        'Number.isNaN': Number.isNaN('') },
  'undefined': { isNaN: isNaN(undefined), 'Number.isNaN': Number.isNaN(undefined) },
  'null':      { isNaN: isNaN(null),      'Number.isNaN': Number.isNaN(null) },
  'NaN':       { isNaN: isNaN(NaN),       'Number.isNaN': Number.isNaN(NaN) },
});
// isNaN('hola') es true aunque 'hola' no es NaN (es un string), e isNaN('') es
// false porque '' se convierte en 0.

console.log("isFinite('42') →", isFinite('42'));               // true 🐛 ('42' es un string)
console.log("Number.isFinite('42') →", Number.isFinite('42')); // false
console.log('isFinite(null) →', isFinite(null));               // true 🐛 (null → 0)

// ✅ Usa siempre las versiones de Number: no convierten nada.
// ✅ Para validar un dato de texto, conviértelo TÚ y comprueba el resultado:
// Number.isFinite descarta a la vez NaN, Infinity y -Infinity.
const inputs = ['42', '12abc', '1e400', ''];
for (const text of inputs) {
  const value = Number(text);
  const valid = text.trim() !== '' && Number.isFinite(value);
  console.log(`«${text}» →`, value, valid ? '✅ válido' : '❌ no válido');
}
// (trim quita los espacios de los extremos: lección «Strings».)
// En Python, math.isnan('hola') lanza TypeError: no adivina.
```
