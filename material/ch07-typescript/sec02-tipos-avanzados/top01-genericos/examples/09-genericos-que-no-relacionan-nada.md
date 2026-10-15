---
example_description: "Genéricos que no relacionan nada: un T que aparece una sola vez es unknown con otro nombre, un T con restricción de unión debería ser la unión, y un T que solo está en el retorno es un as disfrazado (parseJson<Order> no comprueba nada y falla al ejecutar)"
example_tags: "typescript|python|genericos|unknown|json|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// 🐛 1. T aparece una sola vez: no relaciona la entrada con nada.
function logPrice<T>(price: T): void {
  console.log('precio →', price);
}
// ✅ Lo mismo, sin ceremonia: function logPrice(price: unknown): void

// 🐛 2. Un T restringido a una unión que no se usa en ningún otro sitio.
function formatAmount<T extends number | string>(amount: T): string {
  return `$${amount} MXN`;
}
// ✅ Lo mismo: function formatAmount(amount: number | string): string

logPrice(349);
console.log(formatAmount(349), '|', formatAmount('1,299.00'));

// 🐛 3. T solo aparece en el RETORNO: quien llama elige el tipo… y nadie lo comprueba.
function parseJson<T>(text: string): T {
  return JSON.parse(text); // any → T, sin mirar nada
}

type Order = { id: string; total: number };
// Parece seguro (ni any ni as a la vista), pero es una aserción disfrazada:
const order = parseJson<Order>('{"id": "P-7", "total": "89.90"}');
try {
  console.log(order.total.toFixed(2)); // sin rojo… y falla al ejecutar
} catch (error) {
  console.log('🐛 parseJson<Order> →', String(error));
}

// ✅ Si no sabes qué llega, devuelve unknown y obliga a comprobarlo (lección 6).
function parseJsonSafe(text: string): unknown {
  return JSON.parse(text);
}
const raw = parseJsonSafe('{"id": "P-7", "total": "89.90"}');
// raw.total sería un error TS18046 ('raw' is of type 'unknown'): hay que estrechar.
if (typeof raw === 'object' && raw !== null && 'total' in raw) {
  console.log('✅ total →', Number(raw.total).toFixed(2));
}
```
