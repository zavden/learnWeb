---
example_description: "class Cart extends EventTarget: un carrito que no es un elemento del DOM emite eventos change con CustomEvent; quien escucha usa addEventListener con once y signal gratis. Es el EventEmitter del módulo de clases, pero el del navegador"
example_tags: "javascript|eventos|eventtarget|clases|customevent|observador|signal"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Cualquier clase puede emitir eventos heredando de EventTarget: trae
// addEventListener, removeEventListener y dispatchEvent.
class Cart extends EventTarget {
  #items = new Map(); // sku → cantidad

  add(sku, quantity = 1) {
    this.#items.set(sku, (this.#items.get(sku) ?? 0) + quantity);
    // Avisa DESPUÉS de cambiar el estado (ejemplo 03).
    this.dispatchEvent(new CustomEvent('change', {
      detail: { sku, quantity: this.#items.get(sku), count: this.count },
    }));
  }

  get count() {
    let total = 0;
    for (const quantity of this.#items.values()) total += quantity;
    return total;
  }
}

const cart = new Cart();

// La insignia del carrito: escucha siempre.
cart.addEventListener('change', (event) => {
  console.log(`🛒 insignia → ${event.detail.count} · target === cart: ${event.target === cart}`);
});
// Un aviso de bienvenida: solo la primera vez (once).
cart.addEventListener('change', () => console.log('🎁 primer producto: envío gratis'), { once: true });
// La analítica: hasta que el usuario la rechace (signal).
const consent = new AbortController();
cart.addEventListener('change', (event) => {
  console.log(`📊 analítica → ${event.detail.sku} × ${event.detail.quantity}`);
}, { signal: consent.signal });

cart.add('CAF-500');
cart.add('CAC-250', 2);
consent.abort(); // el usuario rechaza la analítica
cart.add('CAF-500');

console.log('cart instanceof EventTarget →', cart instanceof EventTarget);
console.log('¿tiene on y emit? →', 'on' in cart, 'emit' in cart);

// Comparado con el EventEmitter del módulo «Clases y POO»:
//   on(nombre, fn)  → addEventListener(tipo, fn, opciones)
//   off(nombre, fn) → removeEventListener(tipo, fn)   (o signal)
//   emit(nombre, x) → dispatchEvent(new CustomEvent(tipo, { detail: x }))
// Un EventTarget que no está en el DOM no tiene antepasados: bubbles no
// cambia nada, y nadie más que sus listeners se entera.
```
