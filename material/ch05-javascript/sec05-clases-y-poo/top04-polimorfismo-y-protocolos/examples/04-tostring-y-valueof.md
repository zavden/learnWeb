---
example_description: "toString da el texto y valueOf el número, pero con + y == JavaScript prefiere valueOf: «Total: » + price imprime centavos; sort() sin comparador ordena por texto"
example_tags: "javascript|python|protocolos|tostring|valueof|coercion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
class Money {
  constructor(cents) {
    this.cents = cents;
  }
  toString() {
    return `$${(this.cents / 100).toFixed(2)}`; // para mostrar: el __str__
  }
  valueOf() {
    return this.cents; // para operar: el __int__/__float__
  }
}

const price = new Money(1999);

// toString gana cuando el contexto pide TEXTO:
console.log('plantilla →', `Total: ${price}`);   // $19.99
console.log('String() →', String(price));         // $19.99

// 🐛 Pero + y == no piden texto ni número («default»), y para eso JavaScript
// prueba primero valueOf. La concatenación usa los centavos:
console.log('🐛 concatenación →', 'Total: ' + price); // Total: 1999

// valueOf gana cuando el contexto pide NÚMERO (y aquí es lo que queremos):
console.log('aritmética →', price * 2, '| comparar →', price > 1000, '| +price →', +price);

// 🐛 sort() sin comparador convierte cada elemento a TEXTO y compara letras:
const prices = [new Money(1000), new Money(900), new Money(25000)];
console.log('🐛 sort() →', prices.slice().sort().map(String)); // '$10.00' < '$250.00' < '$9.00'
console.log('✅ sort((a, b) => a - b) →', prices.slice().sort((a, b) => a - b).map(String)); // a - b usa valueOf

// ✅ Para texto, usa siempre plantillas o String(): no dependen de valueOf.
console.log('✅ plantilla →', `Total: ${price}`);

// Si defines valueOf, es casi imposible que + haga lo que esperas en todos los
// casos. Muchas clases definen solo toString (y métodos explícitos para operar),
// o controlan cada caso con Symbol.toPrimitive (ejemplo siguiente).
// > Desde Python: str(price) llama a __str__ y price + 1 a __add__; nunca se
//   mezclan. En JavaScript, + decide según los tipos y llama a valueOf.
```
