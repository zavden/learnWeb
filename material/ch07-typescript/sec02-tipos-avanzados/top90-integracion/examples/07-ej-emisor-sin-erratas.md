---
example_description: "Ejercicio: el emisor de eventos de una tienda acepta cualquier nombre y cualquier dato (any), así que un oyente de 'chekout' nunca se dispara y dos propiedades mal escritas dan NaN sin ningún error. Hazlo genérico sobre un mapa de eventos y deja que el verificador encuentre las erratas"
example_tags: "typescript|ejercicio|genericos|keyof|tipos-indexados|eventos|any"
exercise: true
exercise_title: "Un emisor sin erratas"
exercise_instructions: "Al abrirlo, tres comprobaciones salen ✗ y no hay ni un error de tipos: con string y any, cualquier nombre de evento y cualquier propiedad son válidos || Declara type ShopEvents con tres eventos: added { sku: string; qty: number }, removed { sku: string; qty: number } y checkout { total: number } || Convierte Emitter en class Emitter<Events extends Record<string, unknown>>: el mapa de oyentes y los métodos on y emit usan E extends keyof Events y Events[E] || Crea la tienda con new Emitter<ShopEvents>(): el verificador marcará tres erratas (un nombre de evento y dos propiedades); corrígelas || El objetivo: las cuatro comprobaciones ✓ y ningún error de tipos (editor o franja del diálogo «▶ Run»)"
exercise_hints: "La firma de on queda así: on<E extends keyof Events>(event: E, listener: (payload: Events[E]) => void): void || Para el campo privado, un tipo mapeado: { [E in keyof Events]?: ((payload: Events[E]) => void)[] } || Mientras el nombre de un evento esté mal, su oyente también sale en rojo (TypeScript no sabe qué datos le llegan): corrige primero el nombre || TS2551 termina con «Did you mean…?»; TS2339 no sugiere nada, pero el tipo del mensaje enseña las propiedades que sí existen"
exercise_solution_example: 07-ej-emisor-sin-erratas-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# TypeScript

```typescript
// TODO 1: declara type ShopEvents (added, removed, checkout) con los datos de cada evento.

// TODO 2: haz el emisor genérico sobre un mapa de eventos: class Emitter<Events extends …>.
class Emitter {
  #listeners: Record<string, ((payload: any) => void)[]> = {};

  on(event: string, listener: (payload: any) => void): void {
    (this.#listeners[event] ??= []).push(listener);
  }

  emit(event: string, payload: any): void {
    for (const listener of this.#listeners[event] ?? []) listener(payload);
  }
}

// TODO 3: new Emitter<ShopEvents>() y corrige lo que marque el verificador.
const shop = new Emitter();
let units = 0;
let revenue = 0;
const receipts: string[] = [];

shop.on('added', (data) => (units += data.quantity));
shop.on('removed', (data) => (units -= data.qty));
shop.on('chekout', (data) => receipts.push(`ticket por $${data.total}`));
shop.on('checkout', (data) => (revenue += data.totl));

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
