---
example_description: "off con otra función no da de baja nada: bind y las flechas escritas en el sitio crean una función nueva cada vez, el oyente se queda y los avisos se duplican"
example_tags: "javascript|patrones|observador|eventos|bind|bug"
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
  off(eventName, listener) {
    this.#listeners.get(eventName)?.delete(listener); // busca ESA función exacta
  }
  emit(eventName, payload) {
    for (const listener of [...(this.#listeners.get(eventName) ?? [])]) listener(payload);
  }
  count(eventName) {
    return this.#listeners.get(eventName)?.size ?? 0;
  }
}

class PriceBadge {
  updates = 0;
  update(total) {
    this.updates += 1;
    this.total = total;
  }
}

// 🐛 bind (o una flecha escrita en el sitio) crea una función NUEVA cada vez:
// off busca una función que nunca se registró, y no quita nada.
const emitter = new EventEmitter();
const badge = new PriceBadge();
emitter.on('total', badge.update.bind(badge));
emitter.off('total', badge.update.bind(badge)); // ¡otra función distinta!
emitter.on('total', badge.update.bind(badge));  // al «volver a suscribirse»…
emitter.emit('total', 1999);
console.log('🐛 oyentes →', emitter.count('total'), '| avisos por un solo cambio →', badge.updates);
console.log('   ¿bind da la misma función? →', badge.update.bind(badge) === badge.update.bind(badge));

// ✅ Guarda la función que registras y usa ESA para darte de baja
//    (o haz que on devuelva la baja, como en el ejemplo anterior).
const fixedEmitter = new EventEmitter();
const fixedBadge = new PriceBadge();
const onTotal = fixedBadge.update.bind(fixedBadge);
fixedEmitter.on('total', onTotal);
fixedEmitter.off('total', onTotal);
fixedEmitter.on('total', onTotal);
fixedEmitter.emit('total', 1999);
console.log('✅ oyentes →', fixedEmitter.count('total'), '| avisos →', fixedBadge.updates);

// En el capítulo 6, removeEventListener del DOM tiene exactamente este problema.
```
