---
example_description: "Las funciones son valores: se asignan a variables, se guardan en objetos (tabla de despacho) y en arrays (lista de reglas)"
example_tags: "javascript|python|funciones|primera-clase|despacho"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Las funciones son VALORES de primera clase, igual que en Python.

// 1) En variables. Sin paréntesis es la función; con paréntesis, su resultado.
function formatEuros(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}
const format = formatEuros;   // otra referencia a la MISMA función (no la llama)
console.log('format(1999) →', format(1999));                    // '19.99 €'
console.log('format === formatEuros →', format === formatEuros); // true

// 2) En objetos: una «tabla de despacho» en vez de un if/else o un switch largo.
//    En Python sería un dict de funciones: {'add': lambda a, b: a + b, ...}
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};
for (const name of ['add', 'multiply', 'power']) {
  const operation = operations[name];
  console.log(`${name}(6, 3) →`, operation ? operation(6, 3) : 'operación desconocida');
}

// 3) En arrays: una lista de reglas que se aplican en orden.
//    Cada regla devuelve true si se cumple, o el mensaje de error.
const usernameRules = [
  (name) => name.length >= 3 || 'mínimo 3 caracteres',
  (name) => !name.includes(' ') || 'sin espacios',
  (name) => name === name.toLowerCase() || 'solo minúsculas',
];
for (const candidate of ['ana', 'Jo', 'Mar Tín']) {
  const errors = usernameRules
    .map((rule) => rule(candidate))
    .filter((result) => result !== true);
  console.log(`'${candidate}' →`, errors.length === 0 ? 'válido' : errors.join(', '));
}

// 4) Y también se pasan a otras funciones (callbacks, siguiente ejemplo)
//    y se devuelven desde funciones (lección «Closures»).
```
