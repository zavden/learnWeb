---
example_description: "Un EventEmitter completo (on con baja, once, off, emit que aísla errores y los reemite como evento error, aviso de fugas por exceso de oyentes) que usa un monitor de stock por composición"
example_tags: "javascript|integracion|clases|observador|eventos|privados|errores"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UN MONITOR DE STOCK que avisa a varias partes de una tienda.
// Integra: el observador y sus dos bugs («Patrones de diseño»), privados y
// static («Encapsulación»), un campo con una flecha como manejador («Clases»)
// y composición en lugar de herencia («Composición y mixins»).

class EventEmitter {
  static MAX_LISTENERS = 3; // más oyentes de un evento suele ser una fuga
  #listeners = new Map();

  on(eventName, listener) {
    const set = this.#listeners.get(eventName) ?? new Set();
    set.add(listener);
    this.#listeners.set(eventName, set);
    if (set.size > EventEmitter.MAX_LISTENERS) {
      console.warn(`⚠️ ${set.size} oyentes de «${eventName}»: ¿alguien se suscribe sin darse de baja?`);
    }
    return () => this.off(eventName, listener);
  }

  once(eventName, listener) {
    const off = this.on(eventName, (payload) => {
      off();
      listener(payload);
    });
    return off;
  }

  off(eventName, listener) {
    this.#listeners.get(eventName)?.delete(listener);
  }

  emit(eventName, payload) {
    const listeners = [...(this.#listeners.get(eventName) ?? [])];
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (error) {
        // Un oyente roto no detiene a los demás: el fallo se convierte en otro evento.
        if (eventName !== 'error' && this.listenerCount('error') > 0) this.emit('error', { eventName, error });
        else console.warn(`⚠️ oyente de «${eventName}» sin gestionar: ${error.message}`);
      }
    }
    return listeners.length;
  }

  listenerCount(eventName) {
    return this.#listeners.get(eventName)?.size ?? 0;
  }
}

class StockMonitor {
  events = new EventEmitter(); // composición: el monitor TIENE un emisor
  #stock = new Map();
  #lowThreshold;

  constructor(lowThreshold = 3) {
    this.#lowThreshold = lowThreshold;
  }

  set(sku, units) {
    const before = this.#stock.get(sku) ?? 0;
    this.#stock.set(sku, units);
    if (units === 0) this.events.emit('out-of-stock', { sku });
    else if (units <= this.#lowThreshold) this.events.emit('low-stock', { sku, units });
    else if (before === 0) this.events.emit('restock', { sku, units });
  }
}

class Dashboard {
  alerts = [];
  // Campo con una flecha: this es siempre el panel, aunque se pase como callback.
  showAlert = ({ sku, units = 0 }) => {
    this.alerts.push(`${sku}: ${units} uds`);
  };
}

const monitor = new StockMonitor();
const dashboard = new Dashboard();
monitor.events.on('low-stock', dashboard.showAlert);
monitor.events.on('out-of-stock', dashboard.showAlert);
monitor.events.once('restock', ({ sku }) => console.log(`  📧 aviso a quien esperaba ${sku}: ¡ya hay!`));
monitor.events.on('out-of-stock', () => {
  throw new Error('el servicio de analítica no responde');
});
monitor.events.on('error', ({ eventName, error }) => console.log(`  🧯 fallo en «${eventName}»: ${error.message}`));

console.log('▶ movimientos de stock');
monitor.set('CAF-CHIA-500', 2);   // stock bajo
monitor.set('MOL-RUTA-01', 0);    // agotado: un oyente falla, los demás siguen
monitor.set('MOL-RUTA-01', 12);   // repuesto: once avisa una sola vez
monitor.set('MOL-RUTA-01', 0);
monitor.set('MOL-RUTA-01', 8);    // repuesto otra vez: once ya no está
console.log('panel →', dashboard.alerts);

// 🐛 El bug de la baja con otra función, detectado por el aviso de fugas:
console.log('▶ un componente que se suscribe con bind en cada render');
const widget = { count: 0, refresh() { this.count += 1; } };
for (let render = 1; render <= 3; render += 1) {
  monitor.events.off('low-stock', widget.refresh.bind(widget)); // quita OTRA función: nada
  monitor.events.on('low-stock', widget.refresh.bind(widget));
}
monitor.set('CAF-CHIA-500', 1);
console.log('veces que se refrescó el widget por UN cambio →', widget.count);
```
