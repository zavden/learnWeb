---
example_description: "Solución: Zone y Speed como uniones de literales destaparon las erratas 'nacional' y 'expres' (TS2367); el switch exhaustivo con assertNever trata pickup aparte y lanza un error con una zona desconocida; cinco comprobaciones ✓ y ningún error de tipos"
example_tags: "typescript|ejercicio|solucion|tipos-literales|switch|never"
example_stage: final-solution
example_importance: important
console: true
---

# TypeScript

```typescript
// Tarifas de envío de una tienda, en centavos:
//   local 6900 · national 14900 · pickup 0 (recoger en tienda)
//   express suma 10000 (salvo en pickup, que siempre es gratis)

type Zone = 'local' | 'national' | 'pickup';
type Speed = 'standard' | 'express';

function assertNever(value: never): never {
  throw new Error(`Valor no previsto: ${String(value)}`);
}

function shippingCents(zone: Zone, speed: Speed): number {
  const extra = speed === 'express' ? 10000 : 0; // ✅ 'expres' era TS2367
  switch (zone) {
    case 'local':
      return 6900 + extra;
    case 'national': // ✅ 'nacional' era TS2367
      return 14900 + extra;
    case 'pickup':
      return 0;
    default:
      return assertNever(zone); // en ejecución, una zona desconocida lanza aquí
  }
}

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
check('local estándar: $69', () => shippingCents('local', 'standard'), 6900);
check('national estándar: $149', () => shippingCents('national', 'standard'), 14900);
check('local express: $169', () => shippingCents('local', 'express'), 16900);
check('pickup express: gratis', () => shippingCents('pickup', 'express'), 0);
// Una zona que llega de fuera (JSON.parse devuelve any, así que compila):
const fromOutside = JSON.parse('"marte"');
check('una zona desconocida lanza un error', () => shippingCents(fromOutside, 'standard'), 'lanza un error');
```
