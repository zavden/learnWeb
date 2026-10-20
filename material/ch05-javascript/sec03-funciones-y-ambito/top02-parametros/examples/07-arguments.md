---
example_description: "El viejo objeto arguments: no es un array, las flechas no lo tienen (ven el de fuera) y en modo no estricto está enlazado con los parámetros"
example_tags: "javascript|funciones|parametros|arguments|rest|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// Antes de 2015 no había ...rest. Toda función con function tiene una variable
// implícita, arguments, con TODOS los argumentos de la llamada.
function oldSum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
console.log('oldSum(1, 2, 3) →', oldSum(1, 2, 3)); // 6

// 🐛 1. Parece un array, pero no lo es: no tiene map, filter ni reduce.
function averageOld() {
  console.log('  tipo →', Object.prototype.toString.call(arguments), '| ¿array?', Array.isArray(arguments));
  return arguments.reduce((total, n) => total + n, 0) / arguments.length;
}
try {
  averageOld(4, 8);
} catch (error) {
  console.log('🐛 averageOld →', error.name, '|', error.message);
}

// 🐛 2. Las flechas NO tienen arguments propio: ven el de la función de fuera.
function outer() {
  const inner = () => arguments[0]; // ← el arguments de outer, no el de inner
  return inner('soy de inner');
}
console.log('🐛 outer(\'soy de outer\') →', outer('soy de outer')); // 'soy de outer'

// 🐛 3. En modo no estricto, arguments y los parámetros están ENLAZADOS:
// cambiar uno cambia el otro.
function rename(name) {
  arguments[0] = 'Otro nombre';
  return name;
}
console.log('🐛 rename(\'Ana\') →', rename('Ana')); // 'Otro nombre'

// ✅ Usa parámetros rest: son un array de verdad, funcionan en flechas y no
// tienen enlaces raros. arguments solo aparece ya en código antiguo.
const average = (...numbers) => numbers.reduce((total, n) => total + n, 0) / numbers.length;
console.log('✅ average(4, 8) →', average(4, 8)); // 6
```
