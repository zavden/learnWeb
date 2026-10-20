---
example_description: "Eventos tipados: un mapa nombre → datos (ShopEvents) da los nombres de los manejadores (onAdd, onRemove…) con una plantilla y Capitalize, y emit<E> exige los datos de ESE evento (TS2345 si falta qty o el nombre tiene una errata)"
example_tags: "typescript|template-literal-types|eventos|tipos-mapeados|keyof|genericos|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Un mapa de eventos: el nombre de cada evento y los datos que lleva.
type ShopEvents = {
  add: { sku: string; qty: number };
  remove: { sku: string };
  checkout: { total: number };
};

// Los manejadores, uno por evento: onAdd, onRemove, onCheckout.
type ShopHandlers = {
  [E in keyof ShopEvents as `on${Capitalize<E>}`]: (data: ShopEvents[E]) => void;
};

const handlers: ShopHandlers = {
  onAdd: (data) => console.log(`➕ ${data.sku} ×${data.qty}`), // data: { sku; qty }
  onRemove: (data) => console.log(`➖ ${data.sku}`),
  onCheckout: (data) => console.log(`💳 total $${data.total}`),
};

// emit<E>: el nombre decide qué datos hacen falta. Por dentro, TypeScript no sabe
// relacionar un nombre calculado con su manejador (de ahí los dos as); desde fuera es segura.
function emit<E extends keyof ShopEvents>(event: E, data: ShopEvents[E]): void {
  const name = `on${event.charAt(0).toUpperCase()}${event.slice(1)}` as `on${Capitalize<E>}`;
  const handler = handlers[name] as (data: ShopEvents[E]) => void;
  handler(data);
}

emit('add', { sku: 'MOL-01', qty: 2 });
emit('remove', { sku: 'MOL-01' });
emit('checkout', { total: 330 });
emit('add', { sku: 'CAF-02' }); // ❌ Error TS2345 a propósito: a un add le falta qty
try {
  emit('ad', { sku: 'CAF-02', qty: 1 }); // ❌ Error TS2345 a propósito: errata en el nombre
} catch (error) {
  console.log('🐛', String(error));
}
```
