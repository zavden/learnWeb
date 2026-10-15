---
example_description: "El patrón observador con un EventEmitter propio: on devuelve una función para darse de baja, once escucha una sola vez y emit avisa a todos los oyentes; un carrito lo usa por composición"
example_tags: "javascript|python|patrones|observador|eventos|emitter"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class EventEmitter {
  #listeners = new Map(); // nombre del evento → Set de funciones

  on(eventName, listener) {
    if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, new Set());
    this.#listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener); // la baja, ya preparada
  }

  off(eventName, listener) {
    this.#listeners.get(eventName)?.delete(listener);
  }

  once(eventName, listener) {
    const off = this.on(eventName, (payload) => {
      off();             // se da de baja antes de ejecutarse
      listener(payload);
    });
    return off;
  }

  emit(eventName, payload) {
    // Copia: un oyente puede darse de baja (o añadir otros) durante el aviso.
    for (const listener of [...(this.#listeners.get(eventName) ?? [])]) {
      listener(payload);
    }
  }
}

// El carrito TIENE un emisor (composición) y avisa de lo que cambia.
class Cart {
  #items = new Map();
  events = new EventEmitter();

  add(name, cents) {
    this.#items.set(name, cents);
    this.events.emit('change', { action: 'add', name, total: this.total });
  }
  remove(name) {
    this.#items.delete(name);
    this.events.emit('change', { action: 'remove', name, total: this.total });
  }
  get total() {
    return [...this.#items.values()].reduce((sum, cents) => sum + cents, 0);
  }
}

const cart = new Cart();

// Tres partes de la app que no se conocen entre sí, ni conocen al carrito por dentro:
const stopBadge = cart.events.on('change', ({ total }) => console.log(`  🛒 contador: $${(total / 100).toFixed(2)}`));
cart.events.on('change', ({ action, name }) => console.log(`  📊 analítica: ${action} «${name}»`));
cart.events.once('change', () => console.log('  🎉 ¡primer producto! Envío gratis en tu primera compra'));

console.log('add Café de Chiapas');
cart.add('Café de Chiapas', 21000);
console.log('add Molinillo');
cart.add('Molinillo', 38900);

stopBadge(); // el contador se da de baja
console.log('remove Molinillo');
cart.remove('Molinillo');

// El navegador trae su propio sistema de eventos (EventTarget, CustomEvent)
// para el DOM: lo verás en el capítulo 6. La idea es exactamente esta.
// > Desde Python: no hay uno en la biblioteca estándar; se usa una lista de
//   callbacks o librerías como blinker. Funciona igual.
```
