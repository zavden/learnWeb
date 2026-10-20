---
example_description: "Ejercicio: el cálculo de envíos recibe la zona y la velocidad como string y compara con textos mal escritos ('nacional', 'expres') sin que TypeScript pueda avisar. Cámbialos por uniones de literales, deja que el verificador encuentre las erratas y reescribe la lógica con un switch exhaustivo y assertNever"
example_tags: "typescript|ejercicio|tipos-literales|uniones|switch|never|exhaustividad"
exercise: true
exercise_title: "Envíos sin strings sueltos"
exercise_instructions: "Al abrirlo, tres comprobaciones salen ✗: las zonas y velocidades se comparan con textos mal escritos y nadie lo detecta || Declara type Zone = 'local' | 'national' | 'pickup' y type Speed = 'standard' | 'express', y úsalos en los parámetros de shippingCents || TypeScript marcará las comparaciones imposibles (TS2367): son las erratas || Reescribe el cálculo con un switch sobre zone, con default: return assertNever(zone), para que una zona desconocida lance un error || En «pickup» (recoger en tienda) el envío es gratis, también con express || El objetivo: las cinco comprobaciones ✓ y ningún error de tipos (editor o franja del diálogo «▶ Run»)"
exercise_hints: "Tarifas: local $69, national $149, pickup gratis; express suma $100 a local y national || Con zone: Zone, dentro de cada case TypeScript sabe qué zona es; el default solo recibe never si cubres las tres || La última comprobación usa JSON.parse, que devuelve any: así simula una zona que llega de fuera sin romper los tipos"
exercise_solution_example: 09-ej-envios-sin-strings-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# TypeScript

```typescript
// Tarifas de envío de una tienda, en centavos:
//   local 6900 · national 14900 · pickup 0 (recoger en tienda)
//   express suma 10000 (salvo en pickup, que siempre es gratis)

// TODO 1: declara type Zone y type Speed como uniones de literales.

function assertNever(value: never): never {
  throw new Error(`Valor no previsto: ${String(value)}`);
}

// TODO 2: cambia string por Zone y Speed. TypeScript señalará las erratas.
// TODO 3: reescribe el cálculo con un switch (zone) exhaustivo.
function shippingCents(zone: string, speed: string): number {
  let cents = 0;
  if (zone === 'local') cents = 6900;
  else if (zone === 'nacional') cents = 14900;
  if (speed === 'expres') cents += 10000;
  return cents;
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
