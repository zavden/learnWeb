---
example_description: "Un script TypeScript es un módulo ES como los del capítulo 5: import { … } from './tienda/precios.js' carga un archivo JavaScript de assets/ y funciona en ejecución. Pero el verificador de LearnWeb no puede leer ese archivo, así que todo lo importado es any"
example_tags: "typescript|modulos|import|export|assets|any"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/tienda/precios.js (ábrelo con «Assets»): un módulo JavaScript normal.
import { formatPrice, withVat, VAT_RATE } from './tienda/precios.js';
import * as prices from './tienda/precios.js';

type CartLine = { name: string; cents: number; qty: number };
const lines: CartLine[] = [
  { name: 'Mole negro', cents: 16500, qty: 2 },
  { name: 'Café de Chiapas', cents: 21000, qty: 1 },
];

const subtotal = lines.reduce((sum, line) => sum + line.cents * line.qty, 0);
for (const line of lines) console.log(`${line.qty} × ${line.name} · ${formatPrice(line.cents)}`);
console.log(`subtotal ${formatPrice(subtotal)} · con IVA (${VAT_RATE * 100} %) ${formatPrice(withVat(subtotal))}`);
console.log('en dólares →', formatPrice(1250, 'USD'));
console.log('exporta →', Object.keys(prices));

// Funciona en ejecución. Pero el verificador de LearnWeb no lee archivos de assets/:
// para él, formatPrice, withVat y VAT_RATE son any (el ejemplo siguiente lo enseña).
```
