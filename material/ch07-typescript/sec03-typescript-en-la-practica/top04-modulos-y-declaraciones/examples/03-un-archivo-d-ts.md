---
example_description: "Qué hay en un archivo .d.ts: assets/carrito tiene el código fuente (carrito.ts), el JavaScript que genera tsc (carrito.js) y sus declaraciones (carrito.d.ts, con declaration: true). El ejemplo importa carrito.js y copia carrito.d.ts en un declare module: solo firmas, sin cuerpos, y hasta los miembros privados"
example_tags: "typescript|modulos|d-ts|declaraciones|declaration|declare-module|clases"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Abre con «Assets» los tres archivos de assets/carrito/:
//   carrito.ts   → el código fuente, en TypeScript
//   carrito.js   → lo que genera tsc y se ejecuta (es lo que importa este ejemplo)
//   carrito.d.ts → lo que genera tsc con declaration: true: solo los tipos
import { Cart, formatPrice, type CartLine } from './carrito/carrito.js';

// El contenido de carrito.d.ts, copiado tal cual (sin los comentarios y sin la palabra
// `declare`, que dentro de este bloque ya va implícita).
declare module './carrito/carrito.js' {
  export type CartLine = { sku: string; name: string; qty: number; cents: number };
  export class Cart {
    #private; // hay campos #privados, sin decir cuáles
    private readonly currency; // privado: sin tipo, pero existe (para comprobar accesos)
    constructor(currency?: 'MXN' | 'USD');
    add(line: CartLine): this;
    get count(): number;
    get totalCents(): number;
    summary(): string;
  }
  export function formatPrice(cents: number, currency?: 'MXN' | 'USD'): string;
}

const mole: CartLine = { sku: 'MOL-01', name: 'Mole negro', qty: 1, cents: 16500 };
const cart = new Cart('MXN').add(mole).add({ ...mole, qty: 2 }).add({ sku: 'CAF-02', name: 'Café de Chiapas', qty: 1, cents: 21000 });

console.log('resumen →', cart.summary());
console.log('unidades →', cart.count, '| total →', formatPrice(cart.totalCents));
console.log('en dólares →', new Cart('USD').add({ ...mole, qty: 2, cents: 950 }).summary());
// cart.currency sería TS2341 (es private); cart.add({ sku: 'X' }) sería TS2345 (faltan campos).
```
