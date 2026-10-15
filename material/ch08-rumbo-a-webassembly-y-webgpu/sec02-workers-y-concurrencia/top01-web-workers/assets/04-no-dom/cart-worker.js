// WORKER DEL EJEMPLO 04 (de módulo): calcula el total de un carrito.

// Al arrancar, cuenta qué hay en su ámbito global (self) y qué no.
const names = ['document', 'window', 'localStorage', 'alert', 'fetch', 'setTimeout', 'indexedDB', 'crypto', 'TextEncoder', 'OffscreenCanvas'];
self.postMessage({
  type: 'inventory',
  present: names.filter((name) => name in self),
  missing: names.filter((name) => !(name in self)),
});

self.addEventListener('message', (event) => {
  const { type, lines } = event.data;
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  if (type === 'render') {
    // 🐛 Como se haría en la página… pero un worker no tiene document:
    // ReferenceError, y el worker no llega a la línea siguiente.
    document.querySelector('#total').textContent = total;
  } else {
    // ✅ El worker calcula y devuelve el número; quien tiene el DOM, la página, lo escribe.
    self.postMessage({ type: 'total', total });
  }
});
