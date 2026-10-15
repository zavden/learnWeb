---
example_description: "Un bus de eventos sobre EventTarget para una tienda: nombres con espacio de nombres («cart:add»), comodines («cart:*» y «*») para registros y analítica, comprobación de los datos de cada evento según un esquema, errores de un oyente aislados (los demás siguen y el fallo se avisa con bus:error), y bajas con la función que devuelve on, con once o con una señal"
example_tags: "javascript|eventos|profesional|event-bus|eventtarget|customevent|observador|abortcontroller"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// Bus de eventos para los módulos de una tienda (programa de consola).
//
// Decisiones de diseño:
// - Por dentro, un EventTarget: once, signal y el orden de registro vienen de
//   serie. Por fuera, una API pequeña: on(nombre, oyente, opciones) → baja, y
//   emit(nombre, datos).
// - Nombres «espacio:acción». Un oyente de «cart:*» recibe todo lo del
//   carrito, y uno de «*», todo: emit despacha tres eventos, del más concreto
//   al más general. Cada oyente recibe (datos, nombre).
// - Cada nombre tiene un esquema: emitir un evento desconocido, o con datos
//   que no encajan, lanza un TypeError en quien emite (el fallo está en su
//   código, no en el de los oyentes).
// - Un oyente que falla no debe cortar a los demás ni llegar como «Uncaught»
//   a la consola: el bus lo atrapa y avisa con bus:error, que es un evento más
//   (un registro de errores se suscribe a él).
//
// Alcance: el capítulo de JavaScript y el módulo de eventos (sin DOM).

class EventBus {
  #target = new EventTarget();
  #schemas;

  constructor(schemas) {
    this.#schemas = new Map(Object.entries({ ...schemas, 'bus:error': { event: 'string', message: 'string' } }));
  }

  on(name, listener, { once = false, signal } = {}) {
    const wrapped = (event) => {
      try {
        listener(event.detail.data, event.detail.name);
      } catch (error) {
        if (event.detail.name === 'bus:error') throw error; // no entrar en bucle
        this.emit('bus:error', { event: event.detail.name, message: error.message });
      }
    };
    this.#target.addEventListener(name, wrapped, { once, signal });
    return () => this.#target.removeEventListener(name, wrapped);
  }

  emit(name, data = {}) {
    this.#validate(name, data);
    const namespace = name.split(':')[0];
    for (const type of [name, `${namespace}:*`, '*']) {
      this.#target.dispatchEvent(new CustomEvent(type, { detail: { name, data } }));
    }
  }

  #validate(name, data) {
    const schema = this.#schemas.get(name);
    if (!schema) throw new TypeError(`evento desconocido: ${name}`);
    for (const [field, type] of Object.entries(schema)) {
      if (typeof data[field] !== type) {
        throw new TypeError(`${name}: «${field}» debe ser ${type} y es ${typeof data[field]}`);
      }
    }
  }
}

const bus = new EventBus({
  'cart:add': { sku: 'string', quantity: 'number' },
  'cart:remove': { sku: 'string' },
  'order:paid': { id: 'string', total: 'number' },
});

// ── Los módulos de la tienda se suscriben sin conocerse.
const badge = { count: 0 };
bus.on('cart:add', ({ quantity }) => {
  badge.count += quantity;
  console.log(`  🛒 insignia → ${badge.count}`);
});
bus.on('cart:add', () => console.log('  🎁 primera compra: envío gratis'), { once: true });
const stopAnalytics = bus.on('cart:*', (data, name) => console.log(`  📊 analítica → ${name} ${data.sku}`));
const devTools = new AbortController();
bus.on('*', (_, name) => console.log(`  🔎 registro → ${name}`), { signal: devTools.signal });
bus.on('order:paid', ({ id }) => {
  throw new Error(`la impresora de tickets no responde (${id})`);
});
bus.on('order:paid', ({ id, total }) => console.log(`  🧾 factura de ${id} por $${total.toFixed(2)}`));
bus.on('bus:error', ({ event, message }) => console.log(`  ⚠️ bus:error en ${event}: ${message}`));

console.log('▶ emit cart:add (orden: exacto → cart:* → *)');
bus.emit('cart:add', { sku: 'CAF-500', quantity: 2 });
console.log('▶ emit cart:add otra vez (el aviso «once» ya no está)');
bus.emit('cart:add', { sku: 'CAC-250', quantity: 1 });
console.log('▶ emit cart:remove (solo comodines)');
bus.emit('cart:remove', { sku: 'CAF-500' });
console.log('▶ emit order:paid (un oyente falla; los demás siguen)');
bus.emit('order:paid', { id: 'P-2077', total: 640 });

console.log('▶ datos que no encajan con el esquema');
for (const [name, data] of [['cart:add', { sku: 'CAF-500', quantity: '2' }], ['cart:empty', {}]]) {
  try {
    bus.emit(name, data);
  } catch (error) {
    console.log(`  ⛔ ${error.name}: ${error.message}`);
  }
}

console.log('▶ bajas: la función de on y abort()');
stopAnalytics();
devTools.abort();
bus.emit('cart:add', { sku: 'VAI-001', quantity: 1 });

console.log('resumen → insignia:', badge.count, '· ¿es un EventTarget por dentro? sí, pero no lo expone:', !(bus instanceof EventTarget));
```
