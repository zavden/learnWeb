---
example_description: "Errores que Python lanza y JavaScript no: undefined, Infinity y NaN que fallan lejos de su origen"
example_tags: "javascript|python|errores|undefined|nan|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Muchas operaciones que en Python lanzan una excepción, en JavaScript
// devuelven un valor especial y el programa sigue.
const user = { name: 'Ada' };
const scores = [7, 9];

console.table({
  'user.emial':     { js: user.emial,     python: 'KeyError / AttributeError' },
  'scores[10]':     { js: scores[10],     python: 'IndexError' },
  '1 / 0':          { js: 1 / 0,          python: 'ZeroDivisionError' },
  "'5' - 'x'":      { js: '5' - 'x',      python: 'TypeError' },
  'Math.sqrt(-1)':  { js: Math.sqrt(-1),  python: 'ValueError (math.sqrt)' },
  "Number('hola')": { js: Number('hola'), python: 'ValueError (float)' },
});

// 🐛 La errata «emial» no avisa: el undefined viaja hasta que algo se rompe lejos.
const email = user.emial;           // ninguna queja aquí…
try {
  console.log(email.toLowerCase()); // …el error salta aquí, en otra línea
} catch (error) {
  console.log('🐛 error tardío →', error.name, '|', error.message);
}

// ✅ Valida los datos en cuanto los recibes y lanza TÚ un error claro.
function getEmail(account) {
  if (typeof account.email !== 'string') {
    throw new TypeError(`La cuenta de ${account.name} no tiene email`);
  }
  return account.email;
}
try {
  getEmail(user);
} catch (error) {
  console.log('✅ error temprano y claro →', error.name, '|', error.message);
}
```
