---
example_description: "`${number}px` describe longitudes CSS en píxeles: 'px' o '1,5px' son errores (TS2322), pero el patrón ${number} acepta todo lo que Number() entiende, incluidos '16 px' y '0x10px', que CSS rechaza (CSS.supports da false en Chrome)"
example_tags: "typescript|template-literal-types|css|number|ts2322|bug"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
// Un patrón: ${number} es «cualquier texto que sea un número», seguido de 'px'.
type Px = `${number}px`;
type Length = `${number}${'px' | 'rem' | '%'}`;

const gap: Length = '1.5rem'; // ✅
const border: Px = '-2px'; // ✅ también negativos
const empty: Px = 'px'; // ❌ Error TS2322 a propósito: falta el número
const comma: Px = '1,5px'; // ❌ Error TS2322 a propósito: la coma no es un decimal en JavaScript

// 🐛 Pero ${number} acepta lo que acepta Number(): espacios, hexadecimal, exponentes…
const spaced: Px = '16 px'; // sin error (Number('16 ') es 16)
const hex: Px = '0x10px'; // sin error (Number('0x10') es 16)
const exponent: Px = '1e3px'; // sin error (CSS también lo entiende: 1000px)

// CSS.supports pregunta al navegador si un valor es válido para una propiedad:
for (const value of [gap, border, empty, comma, spaced, hex, exponent]) {
  console.log(`margin-top: ${value} → ${CSS.supports('margin-top', value) ? '✅ válido' : '❌ CSS lo rechaza'}`);
}
// Un tipo de plantilla filtra los errores gordos; la validez real la decide el navegador.
```
