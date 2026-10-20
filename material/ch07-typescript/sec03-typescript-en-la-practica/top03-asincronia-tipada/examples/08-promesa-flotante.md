---
example_description: "Un await olvidado: si se USA el valor, TypeScript lo detecta (Promise<number> + 1 es TS2365); si se ignora, no dice nada, la página anuncia «pedido confirmado» antes de saber nada y el error escapa del try/catch como Uncaught (in promise). Solución: await dentro del try, o void con su propio catch si de verdad no se espera"
example_tags: "typescript|async|await|promesa-flotante|unhandledrejection|ts2365|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Order = { id: string; lines: { sku: string; qty: number }[] };
const order: Order = { id: 'P-1042', lines: [{ sku: 'MOL-01', qty: 2 }, { sku: 'CAF-02', qty: 1 }] };

class HttpError extends Error {
  override name = 'HttpError';
  constructor(readonly status: number, what: string) {
    super(`HTTP ${status} al ${what}`);
  }
}

async function countUnits(pending: Order): Promise<number> {
  return pending.lines.reduce((sum, line) => sum + line.qty, 0);
}
// El servidor de prueba contesta 500: guardar el pedido falla.
async function saveOrder(pending: Order): Promise<void> {
  const response = await fetch('/api/demo/echo?status=500', { method: 'POST', body: JSON.stringify(pending) });
  if (!response.ok) throw new HttpError(response.status, `guardar el pedido ${pending.id}`);
}

// 1. Usar el valor sin await: TypeScript sí lo detecta.
const units = countUnits(order);
console.log('🐛 unidades + 1 →', units + 1); // ❌ Error TS2365 a propósito: units es una Promise<number>
console.log('✅ unidades + 1 →', (await countUnits(order)) + 1);

// 2. ✅ Con await DENTRO del try, el fallo llega al catch.
try {
  await saveOrder(order);
  console.log('✅ pedido confirmado');
} catch (error) {
  console.log('✅ catch →', String(error));
}

// 3. 🐛 Ignorar la promesa: ningún error de tipos (es una «promesa flotante»).
async function checkout(pending: Order): Promise<void> {
  saveOrder(pending); // sin await: la función sigue sin esperar
  console.log('🐛 ¡pedido confirmado! (sin saber si se guardó)');
}
try {
  await checkout(order);
  console.log('🐛 el try terminó sin errores');
} catch (error) {
  console.log('nunca llega aquí', error);
}
// …y unos milisegundos después, el rechazo aparece como «Uncaught (in promise)».
// Si de verdad no quieres esperar, dilo y trata el fallo ahí mismo:
//   void saveOrder(pending).catch((error) => console.warn('no se guardó', error));
```
