---
example_description: "Con target[key] en la trampa get, un getter se ejecuta con this = el objetivo y sus lecturas internas se saltan el proxy; Reflect.get(target, key, receiver) lo ejecuta con this = el proxy"
example_tags: "javascript|proxy|reflect|receiver|getters|this|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un producto con un getter que lee OTRAS propiedades a través de this.
class Product {
  constructor(name, cents) {
    this.name = name;
    this.cents = cents;
  }
  get label() {
    return `${this.name} · ${(this.cents / 100).toFixed(2)} ${this.currency}`;
  }
}
const storeDefaults = { currency: 'MXN', vatRate: 0.16 };
const coffee = new Product('Café de Chiapas', 21000);

// 🐛 La trampa devuelve target[key]: el getter se ejecuta con this = coffee
//    (el objetivo), y su lectura de this.currency ya no pasa por el proxy.
const broken = new Proxy(coffee, {
  get(target, key) {
    return key in target ? target[key] : storeDefaults[key];
  },
});
console.log('🐛 currency →', broken.currency); // la trampa funciona…
console.log('🐛 label →', broken.label);       // …pero el getter no la ve

// ✅ Reflect.get(target, key, receiver) ejecuta el getter con this = receiver,
//    es decir, el proxy: sus lecturas internas también pasan por la trampa.
const fixed = new Proxy(coffee, {
  get(target, key, receiver) {
    return key in target ? Reflect.get(target, key, receiver) : storeDefaults[key];
  },
});
console.log('✅ label →', fixed.label);

// Lo mismo, visto con un proxy que apunta cada lectura:
function traceReads(target, readValue) {
  const reads = [];
  const proxy = new Proxy(target, {
    get(t, key, receiver) {
      reads.push(String(key));
      return readValue(t, key, receiver);
    },
  });
  proxy.label;
  return reads.join(', ');
}
console.log('🐛 con target[key] →', traceReads(coffee, (t, key) => t[key]));
console.log('✅ con Reflect.get →', traceReads(coffee, (t, key, receiver) => Reflect.get(t, key, receiver)));
// Un store reactivo que quiere saber de qué datos depende un getter necesita
// ver esas lecturas internas (ejemplo del mini store).

// La regla: en las trampas, reenvía con Reflect y pasa SIEMPRE el receiver.
```
