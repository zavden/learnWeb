---
example_description: "Parámetros y retorno tipados: TypeScript comprueba el número de argumentos (TS2554, también los de más) y que el retorno anotado se cumpla en todos los caminos (TS2366); las flechas se anotan igual"
example_tags: "typescript|funciones|parametros|retorno|ts2554|ts2366"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
function stayTotal(nights: number, nightlyRate: number): number {
  return nights * nightlyRate;
}
// Las funciones flecha se anotan igual:
const withTax = (amount: number): number => Math.round(amount * 1.16);

console.log('✅', withTax(stayTotal(3, 1450)));
// En JavaScript sobra o falta cualquier argumento sin aviso; en TypeScript, no.
console.log('🐛', stayTotal(3)); // ❌ Error TS2554 a propósito: falta nightlyRate → NaN
console.log('🐛', stayTotal(3, 1450, 0.16)); // ❌ Error TS2554 a propósito: sobra un argumento

// El retorno anotado se comprueba en TODOS los caminos del cuerpo:
function discountFor(nights: number): number { // ❌ Error TS2366 a propósito: si nights < 3 no hay return
  if (nights >= 7) return 0.15;
  if (nights >= 3) return 0.05;
}
console.log('🐛 1 noche →', discountFor(1)); // undefined, aunque el tipo diga number
console.log('✅ 7 noches →', discountFor(7));
// ✅ Arreglo: un return final (return 0;) para el resto de los casos.
```
