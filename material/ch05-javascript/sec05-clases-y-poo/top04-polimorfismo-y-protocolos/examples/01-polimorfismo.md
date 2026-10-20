---
example_description: "Polimorfismo: objetos de clases distintas responden al mismo mensaje (fee, describe) y el código que los usa no pregunta por el tipo; comparación con un switch por tipo"
example_tags: "javascript|python|clases|polimorfismo|herencia|sobrescritura"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Sin polimorfismo: una función que pregunta por el tipo. Cada medio de pago
// nuevo obliga a tocar este switch (y todos los parecidos repartidos por el código).
function feeWithSwitch(payment, cents) {
  switch (payment.kind) {
    case 'card': return Math.round(cents * 0.035);
    case 'transfer': return 0;
    default: throw new TypeError(`Medio desconocido: ${payment.kind}`);
  }
}
console.log('con switch →', feeWithSwitch({ kind: 'card' }, 120000));

// Con polimorfismo: cada clase sabe calcular SU comisión.
class PaymentMethod {
  fee() {
    return 0;
  }
  describe(cents) {
    const fee = this.fee(cents); // ← la versión de la subclase
    return `${this.label}: $${(cents / 100).toFixed(2)} + comisión $${(fee / 100).toFixed(2)}`;
  }
}
class Card extends PaymentMethod {
  label = '💳 Tarjeta';
  fee(cents) {
    return Math.round(cents * 0.035); // 3.5 %
  }
}
class Transfer extends PaymentMethod {
  label = '🏦 Transferencia'; // usa el fee() heredado: sin comisión
}
class CashOnDelivery extends PaymentMethod {
  label = '💵 Contra entrega';
  fee() {
    return 4500; // tarifa fija
  }
}

// El mismo código para todos: ni un if sobre el tipo.
const methods = [new Card(), new Transfer(), new CashOnDelivery()];
for (const method of methods) {
  console.log(method.describe(120000));
}
const cheapest = methods.reduce((best, method) => (method.fee(120000) < best.fee(120000) ? method : best));
console.log('más barato →', cheapest.label);

// Añadir un medio de pago = añadir una clase. El resto del código no cambia.

// > Desde Python: idéntico. Las llamadas self.fee(cents) se resuelven en
//   tiempo de ejecución según la clase del objeto, en los dos lenguajes.
```
