---
example_description: "Solución: con ShopEvents y un Emitter<Events> genérico (on/emit con E extends keyof Events y Events[E]), el verificador señaló 'chekout' (TS2345), data.quantity (TS2339) y data.totl (TS2551); corregidas, las cuatro comprobaciones salen ✓ sin errores de tipos"
example_tags: "typescript|ejercicio|solucion|genericos|keyof|tipos-indexados|eventos"
example_stage: final-solution
example_importance: important
console: true
---

# TypeScript

```typescript
type ShopEvents = {
  added: { sku: string; qty: number };
  removed: { sku: string; qty: number };
  checkout: { total: number };
};

class Emitter<Events extends Record<string, unknown>> {
  // Un tipo mapeado: cada evento tiene su lista de oyentes, con los datos de ESE evento.
  #listeners: { [E in keyof Events]?: ((payload: Events[E]) => void)[] } = {};

  on<E extends keyof Events>(event: E, listener: (payload: Events[E]) => void): void {
    (this.#listeners[event] ??= []).push(listener);
  }

  emit<E extends keyof Events>(event: E, payload: Events[E]): void {
    for (const listener of this.#listeners[event] ?? []) listener(payload);
  }
}

const shop = new Emitter<ShopEvents>();
let units = 0;
let revenue = 0;
const receipts: string[] = [];

shop.on('added', (data) => (units += data.qty)); // era data.quantity (TS2339)
shop.on('removed', (data) => (units -= data.qty));
shop.on('checkout', (data) => receipts.push(`ticket por $${data.total}`)); // era 'chekout' (TS2345)
shop.on('checkout', (data) => (revenue += data.total)); // era data.totl (TS2551)

shop.emit('added', { sku: 'MOL-01', qty: 2 });
shop.emit('added', { sku: 'CAF-02', qty: 3 });
shop.emit('removed', { sku: 'CAF-02', qty: 1 });
shop.emit('checkout', { total: 540 });

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description: string, compute: () => unknown, expected: unknown): void {
  let actual: unknown;
  try {
    actual = compute();
  } catch (error) {
    actual = 'lanza un error';
  }
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
check('unidades en el carrito: 2 + 3 − 1', () => units, 4);
check('el checkout genera un ticket', () => receipts.length, 1);
check('el ticket dice el total', () => receipts[0], 'ticket por $540');
check('los ingresos suman el total', () => revenue, 540);
```
