---
example_description: "Con strict, el error de un catch es unknown (TS18046 al leer error.message): en JavaScript se lanza de todo, y a un mismo catch llegan un texto, un TypeError de red, una DOMException por un plazo agotado, un error propio con status o un SyntaxError de JSON. Una función describe(error: unknown) los distingue con instanceof"
example_tags: "typescript|errores|catch|unknown|instanceof|domexception|timeouterror|ts18046|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
class HttpError extends Error {
  override name = 'HttpError';
  constructor(readonly status: number, what: string) {
    super(`HTTP ${status} al pedir ${what}`);
  }
}

// Una biblioteca antigua que lanza textos en vez de errores (es JavaScript válido).
async function reserveStock(sku: string): Promise<void> {
  throw `Sin existencias de ${sku}`;
}

try {
  await reserveStock('MOL-01');
} catch (error) {
  console.log('🐛 error.message →', error.message); // ❌ Error TS18046 a propósito: error es unknown… y aquí es un string
}

// ✅ Todo lo que puede llegar a un catch, y una función que lo distingue.
function describe(error: unknown): string {
  if (error instanceof HttpError) return `HttpError ${error.status}: ${error.message}`; // status: number
  if (error instanceof DOMException) return `DOMException «${error.name}»: ${error.message}`; // antes que Error: también lo es
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return `no es un Error: ${JSON.stringify(error)}`;
}

const attempts: Array<[label: string, run: () => Promise<unknown>]> = [
  ['biblioteca antigua', () => reserveStock('MOL-01')],
  ['sin servidor', () => fetch('http://localhost:59999/')],
  ['plazo de 50 ms', () => fetch('/api/demo/echo?delay=500', { signal: AbortSignal.timeout(50) })],
  ['pedido inexistente', async () => {
    const response = await fetch('/api/demo/echo?status=404');
    if (!response.ok) throw new HttpError(response.status, 'el pedido P-9999');
  }],
  ['JSON roto', async () => JSON.parse('{"sku": "MOL-01",}')],
];

for (const [label, run] of attempts) {
  try {
    await run();
    console.log(`✅ ${label}`);
  } catch (error) {
    console.log(`⚠️ ${label} → ${describe(error)}`);
  }
}
```
