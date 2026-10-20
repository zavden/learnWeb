---
example_description: "Las uniones dentro de una plantilla se multiplican: 5 tallas × 6 colores × 3 cortes son 90 SKU, pero un código postal de 5 dígitos son 100 000 y TypeScript se rinde (TS2590) y convierte el tipo en any, que acepta 'hola'. Esas reglas se validan en ejecución"
example_tags: "typescript|template-literal-types|uniones|any|ts2590|ts2322|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
const COLORS = ['negro', 'blanco', 'arena', 'vino', 'olivo', 'marino'] as const;
const FITS = ['regular', 'slim', 'oversize'] as const;

// 5 × 6 × 3 = 90 combinaciones: TypeScript las enumera todas.
type Sku = `${(typeof SIZES)[number]}-${(typeof COLORS)[number]}-${(typeof FITS)[number]}`;
const ok: Sku = 'M-vino-slim';
const typo: Sku = 'M-rojo-slim'; // ❌ Error TS2322 a propósito: 'rojo' no es un color (el mensaje lista los 90)
console.log('combinaciones de Sku →', SIZES.length * COLORS.length * FITS.length, '|', ok, typo);

// 🐛 Un código postal mexicano: 5 dígitos. 10 × 10 × 10 × 10 × 10 = 100 000 miembros.
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type PostalCode = `${Digit}${Digit}${Digit}${Digit}${Digit}`; // ❌ Error TS2590 a propósito: demasiadas combinaciones
// Al rendirse, TypeScript deja PostalCode como any: ahora cualquier cosa vale, sin más errores.
const zip: PostalCode = 'hola';
console.log('🐛 combinaciones de PostalCode →', 10 ** 5, '| acepta →', zip);

// ✅ Una regla así no es un tipo: se comprueba en ejecución (la lección 6 le da un tipo con marca).
function isPostalCode(text: string): boolean {
  return /^\d{5}$/.test(text);
}
for (const text of ['68000', 'hola', '6800']) console.log(`✅ ${text} → ${isPostalCode(text)}`);
```
