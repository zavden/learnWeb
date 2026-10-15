---
example_description: "Un proxy, incluso sin trampas, rompe los métodos que usan #privados y los de Map, Set y Date: se ejecutan con this = el proxy, que no tiene los privados ni las ranuras internas del objetivo; la solución es enlazar los métodos al objetivo"
example_tags: "javascript|proxy|privados|map|ranuras-internas|this|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
class Wallet {
  #balanceCents = 0;
  deposit(cents) {
    this.#balanceCents += cents;
    return this;
  }
  get balance() {
    return `$${(this.#balanceCents / 100).toFixed(2)}`;
  }
}

// 🐛 Un proxy SIN ninguna trampa: «debería» comportarse igual que el objetivo.
const wallet = new Proxy(new Wallet().deposit(50000), {});
try {
  console.log(wallet.balance);
} catch (error) {
  console.log('🐛 wallet.balance →', error.name, '|', error.message);
}
try {
  wallet.deposit(1000);
} catch (error) {
  console.log('🐛 wallet.deposit() →', error.name, '|', error.message);
}
// El getter y el método se ejecutan con this = el proxy, y los #privados NO son
// propiedades (lección «Encapsulación»): viven en el objeto original y el proxy
// no puede reenviarlos.

// 🐛 Lo mismo con Map, Set o Date: guardan sus datos en «ranuras internas» del
//    objeto, que tampoco son propiedades.
const stock = new Proxy(new Map([['café', 12], ['pan', 30]]), {});
for (const [code, run] of Object.entries({ 'stock.get()': () => stock.get('café'), 'stock.size': () => stock.size })) {
  try {
    console.log(code, '→', run());
  } catch (error) {
    console.log(`🐛 ${code} → ${error.name} | ${error.message}`);
  }
}

// ✅ Que los métodos y getters se ejecuten con this = el OBJETIVO.
const bindToTarget = {
  get(target, key) {
    const value = Reflect.get(target, key, target);                 // getters con this = objetivo
    return typeof value === 'function' ? value.bind(target) : value; // métodos enlazados
  },
};
const safeWallet = new Proxy(new Wallet().deposit(50000), bindToTarget);
safeWallet.deposit(1000);
console.log('✅ wallet →', safeWallet.balance);
const safeStock = new Proxy(new Map([['café', 12], ['pan', 30]]), bindToTarget);
console.log('✅ stock →', safeStock.get('café'), '| size →', safeStock.size);

// El precio: dentro de esos métodos, this ya no es el proxy, así que sus
// lecturas internas no pasan por las trampas (justo lo contrario del ejemplo
// anterior). Los arrays no tienen este problema: sus elementos y su length
// son propiedades normales.
```
