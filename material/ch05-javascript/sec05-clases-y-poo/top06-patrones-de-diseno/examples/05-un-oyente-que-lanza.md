---
example_description: "Un oyente que lanza un error corta el bucle de emit y los siguientes no se enteran; una subclase que aísla a cada oyente con try/catch y devuelve los fallos"
example_tags: "javascript|patrones|observador|eventos|errores|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
class EventEmitter {
  #listeners = new Map();
  on(eventName, listener) {
    if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, new Set());
    this.#listeners.get(eventName).add(listener);
  }
  // Las subclases no ven #listeners: este método les da una copia.
  listenersOf(eventName) {
    return [...(this.#listeners.get(eventName) ?? [])];
  }
  emit(eventName, payload) {
    for (const listener of this.listenersOf(eventName)) listener(payload);
  }
}

function subscribeAll(emitter, delivered) {
  emitter.on('paid', ({ order }) => delivered.push(`correo del pedido ${order}`));
  emitter.on('paid', () => {
    throw new Error('el servicio de analítica no responde');
  });
  emitter.on('paid', ({ order }) => delivered.push(`factura del pedido ${order}`));
}

// 🐛 El error del segundo oyente sale de emit: el tercero nunca se ejecuta.
const checkout = new EventEmitter();
const received = [];
subscribeAll(checkout, received);
try {
  checkout.emit('paid', { order: 1042 });
} catch (error) {
  console.log('🐛 emit se corta →', error.message, '| recibieron:', received);
}

// ✅ Un emisor que aísla a cada oyente: un fallo se apunta y los demás siguen.
class SafeEventEmitter extends EventEmitter {
  emit(eventName, payload) {
    const failures = [];
    for (const listener of this.listenersOf(eventName)) {
      try {
        listener(payload);
      } catch (error) {
        failures.push(error.message);
      }
    }
    return failures; // quien emite decide qué hacer con los fallos
  }
}
const safeCheckout = new SafeEventEmitter();
const delivered = [];
subscribeAll(safeCheckout, delivered);
const failures = safeCheckout.emit('paid', { order: 1042 });
console.log('✅ recibieron →', delivered, '| fallos →', failures);
```
