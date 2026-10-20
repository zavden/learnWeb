---
example_description: "Bus de eventos hecho con closures: oyentes en un Map de Set, función de baja, once, oyentes que fallan sin tumbar a los demás y un método que pierde this hasta que se usa bind"
example_tags: "javascript|integracion|closures|this|bind|map|set"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// BUS DE EVENTOS: las partes de una tienda se avisan sin conocerse entre sí.
// Integra: closures y estado privado («Closures»), rest y spread («Parámetros»),
// once como función de orden superior, this y bind («La palabra clave this»),
// Map y Set («Map, Set y WeakMap») y try/catch («Errores y excepciones»).

function createEventBus() {
  const handlers = new Map(); // nombre del evento → Set de oyentes (privado)

  function on(eventName, handler) {
    if (!handlers.has(eventName)) handlers.set(eventName, new Set());
    handlers.get(eventName).add(handler);
    return () => handlers.get(eventName).delete(handler); // función de baja
  }
  function once(eventName, handler) {
    const unsubscribe = on(eventName, (...args) => {
      unsubscribe(); // se da de baja antes de ejecutarse
      handler(...args);
    });
    return unsubscribe;
  }
  function emit(eventName, ...args) {
    // Copia: un oyente puede darse de baja mientras recorremos la lista.
    const current = [...(handlers.get(eventName) ?? [])];
    for (const handler of current) {
      try {
        handler(...args);
      } catch (error) {
        console.log(`  ⚠️ un oyente de «${eventName}» ha fallado: ${error.message}`);
      }
    }
    return current.length;
  }
  const listenerCount = (eventName) => handlers.get(eventName)?.size ?? 0;

  return { on, once, emit, listenerCount };
}

const bus = createEventBus();

// Módulo «insignia del carrito»: un objeto con estado y un método que usa this.
const cartBadge = {
  count: 0,
  onItemAdded(product) {
    this.count += 1;
    console.log(`  🛒 insignia: ${this.count} (${product.name})`);
  },
};

// 🐛 Pasar el método tal cual: el bus lo llama como función simple → this es window.
const unsubscribeBroken = bus.on('item-added', cartBadge.onItemAdded);
bus.emit('item-added', { sku: 'TE-01', name: 'Té verde sencha' });
console.log('🐛 cartBadge.count →', cartBadge.count, '| window.count →', window.count);
unsubscribeBroken();

// ✅ bind fija this (también valdría una flecha: (p) => cartBadge.onItemAdded(p)).
bus.on('item-added', cartBadge.onItemAdded.bind(cartBadge));

// Módulo «analítica»: un contador privado en un closure.
const eventsSeen = (() => {
  let total = 0;
  bus.on('item-added', () => {
    total += 1;
  });
  return () => total;
})();

// Módulo «stock»: falla con un producto desconocido, pero no tumba a los demás.
const stock = new Map([['TE-01', 12], ['CA-07', 3]]);
bus.on('item-added', (product) => {
  if (!stock.has(product.sku)) throw new Error(`sin stock registrado para ${product.sku}`);
  stock.set(product.sku, stock.get(product.sku) - 1);
});

// Cupón de bienvenida: solo la PRIMERA compra.
bus.once('order-paid', (order) => console.log(`  🎁 cupón de bienvenida para ${order.email}`));

console.log('▶ añadir productos');
bus.emit('item-added', { sku: 'TE-01', name: 'Té verde sencha' });
bus.emit('item-added', { sku: 'XX-99', name: 'Producto fantasma' });
console.log('▶ pagar dos pedidos');
bus.emit('order-paid', { id: 'P-1', email: 'ana@example.com' });
bus.emit('order-paid', { id: 'P-2', email: 'ana@example.com' }); // ya no hay cupón

console.log('✅ insignia →', cartBadge.count, '| analítica →', eventsSeen(), '| stock TE-01 →', stock.get('TE-01'));
console.log('oyentes: item-added →', bus.listenerCount('item-added'), '| order-paid →', bus.listenerCount('order-paid'));
```
