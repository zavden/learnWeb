---
example_description: "Currying: convertir f(a, b, c) en f(a)(b)(c) para fijar la configuración primero y los datos al final; un currificador genérico con fn.length"
example_tags: "javascript|python|orden-superior|currying|closures"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// CURRYING: transformar una función de varios argumentos en una cadena de
// funciones de UN argumento. Cada paso es un closure que recuerda los anteriores.
const add = (a, b) => a + b;
const addCurried = (a) => (b) => a + b;

console.log('add(2, 3) →', add(2, 3));               // 5
console.log('addCurried(2)(3) →', addCurried(2)(3)); // 5
const addTen = addCurried(10);                       // fija a = 10
console.log('map(addTen) →', [1, 2, 3].map(addTen)); // [11, 12, 13]

// Uso real: la configuración primero, los datos al final. Así cada paso
// produce una función reutilizable (y el formateador se crea una sola vez).
const moneyFormatter = (locale) => (currency) => {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  return (cents) => formatter.format(cents / 100);
};
const formatInSpain = moneyFormatter('es-ES');
const formatEuros = formatInSpain('EUR');
const formatDollarsInSpain = formatInSpain('USD');
console.log('euros →', [1999, 45000].map(formatEuros));       // ['19,99 €', '450,00 €']
console.log('dólares →', formatDollarsInSpain(1999));          // '19,99 US$'

// Un currificador GENÉRICO: va acumulando argumentos hasta tener tantos como
// declara la función (fn.length) y entonces la llama.
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}
const between = curry((min, max, value) => value >= min && value <= max);
const isWorkingHour = between(9, 18);
console.log('horas laborables →', [8, 9, 13, 19].filter((hour) => isWorkingHour(hour))); // [9, 13]
console.log('between(1)(5)(3) →', between(1)(5)(3)); // true
console.log('between(1, 5, 9) →', between(1, 5, 9)); // false

// > Desde Python: el currying no es habitual en Python; para fijar argumentos
//   se usa functools.partial (siguiente ejemplo).
```
