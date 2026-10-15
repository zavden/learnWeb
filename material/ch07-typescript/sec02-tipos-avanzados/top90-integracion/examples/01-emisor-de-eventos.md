---
example_description: "Un emisor de eventos tipado: una clase genérica sobre un mapa nombre → datos (genéricos, keyof, tipos indexados), un tipo mapeado opcional para las listas de oyentes, on() que devuelve la función de baja y connect() con manejadores onAdded/onRemoved derivados con una plantilla y Capitalize"
example_tags: "typescript|integracion|genericos|keyof|tipos-mapeados|template-literal-types|eventos|clases"
example_stage: intermediate
example_importance: critical
console: true
---

# TypeScript

```typescript
// ── Un emisor genérico: Events es el mapa «nombre del evento → datos» ──────
type Listener<T> = (payload: T) => void;
// Los manejadores con nombre: added → onAdded (plantilla + Capitalize, lección 5).
type Handlers<Events> = {
  [E in keyof Events & string as `on${Capitalize<E>}`]?: Listener<Events[E]>;
};

class TypedEmitter<Events extends Record<string, unknown>> {
  // Tipo mapeado (lección 3): una lista opcional de oyentes por cada evento.
  #listeners: { [E in keyof Events]?: Listener<Events[E]>[] } = {};

  on<E extends keyof Events>(event: E, listener: Listener<Events[E]>): () => void {
    const list = (this.#listeners[event] ??= []);
    list.push(listener);
    return () => { // la función de baja
      const index = list.indexOf(listener);
      if (index !== -1) list.splice(index, 1);
    };
  }

  emit<E extends keyof Events>(event: E, payload: Events[E]): number {
    const list = this.#listeners[event] ?? [];
    for (const listener of [...list]) listener(payload);
    return list.length; // cuántos oyentes lo recibieron
  }

  // Varios manejadores de una vez; devuelve una sola función de baja.
  connect(handlers: Handlers<Events>): () => void {
    const offs: (() => void)[] = [];
    for (const [name, handler] of Object.entries(handlers)) {
      // 'onAdded' → 'added': TypeScript no puede seguir esta conversión de texto, de ahí los as.
      const event = (name.charAt(2).toLowerCase() + name.slice(3)) as keyof Events;
      offs.push(this.on(event, handler as Listener<Events[keyof Events]>));
    }
    return () => offs.forEach((off) => off());
  }
}

// ── Una tienda de discos ──────────────────────────────────────────────────
type CartEvents = {
  added: { sku: string; title: string; qty: number };
  removed: { sku: string };
  cleared: { items: number };
};
const cart = new TypedEmitter<CartEvents>();
const lines = new Map<string, number>();

// Cada oyente recibe los datos de SU evento, sin anotar nada (tipado contextual).
cart.on('added', ({ sku, qty }) => lines.set(sku, (lines.get(sku) ?? 0) + qty));
cart.on('removed', ({ sku }) => lines.delete(sku));
const disconnect = cart.connect({
  onAdded: (item) => console.log(`➕ ${item.title} ×${item.qty}`),
  onCleared: ({ items }) => console.log(`🧹 carrito vacío (${items} líneas)`),
  // onAdedd: … sería un error: no existe un evento 'adedd'.
});

cart.emit('added', { sku: 'LP-104', title: 'Amor prohibido', qty: 1 });
cart.emit('added', { sku: 'LP-221', title: 'Re', qty: 2 });
cart.emit('removed', { sku: 'LP-104' });
console.log('líneas →', Object.fromEntries(lines));
disconnect();
console.log('oyentes de cleared tras disconnect →', cart.emit('cleared', { items: lines.size }));
// cart.emit('added', { sku: 'LP-9' }) sería un error: faltan title y qty.
```
