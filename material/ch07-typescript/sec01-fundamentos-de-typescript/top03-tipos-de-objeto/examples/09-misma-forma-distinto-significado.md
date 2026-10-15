---
example_description: "El tipado estructural acepta cualquier valor con la forma correcta, aunque signifique otra cosa: dos clases con un solo campo amount (pesos y dólares) son intercambiables sin error, y el total sale mal"
example_tags: "typescript|python|tipado-estructural|clases|nominal|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
class Pesos {
  amount: number;
  constructor(amount: number) {
    this.amount = amount;
  }
}

class Dollars {
  amount: number;
  constructor(amount: number) {
    this.amount = amount;
  }
}

function addShippingMxn(subtotal: Pesos): Pesos {
  return new Pesos(subtotal.amount + 99); // envío: 99 pesos
}

// 🐛 Dollars tiene la misma forma que Pesos ({ amount: number }), así que
//    TypeScript lo acepta: sin error, y se suman pesos a dólares.
const order = new Dollars(25);
const result = addShippingMxn(order);
console.log('🐛 total →', result.amount, '(¿pesos? ¿dólares?)');
console.log('🐛 ¿result es Pesos? →', result instanceof Pesos, '| ¿order es Pesos? →', order instanceof Pesos);

// ✅ Si dos tipos no deben mezclarse, haz que sus formas sean distintas:
//    por ejemplo, con un campo que diga qué son.
class PesosTagged {
  readonly currency = 'MXN';
  amount: number;
  constructor(amount: number) {
    this.amount = amount;
  }
}
const price = new PesosTagged(250);
console.log('✅', price.amount, price.currency);
// Pasar un Dollars donde se espera PesosTagged ya sería un error (le falta
// currency). Los «tipos con marca» (branded types) del módulo 2 generalizan
// esta idea. > Desde Python: allí Pesos y Dollars serían incompatibles para mypy.
```
