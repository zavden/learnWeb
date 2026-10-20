---
example_description: "Sobrecargas: varias firmas para una función cuyo tipo de retorno depende de lo que recibe (un texto → number, un array → number[]) y una implementación que no se puede llamar desde fuera; con una unión, ninguna firma encaja (TS2769). Equivale a @overload de Python"
example_tags: "typescript|python|funciones|sobrecargas|overload|ts2769"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
// Las firmas de sobrecarga: lo que ven quienes llaman (sin cuerpo).
function parsePrice(text: string): number;
function parsePrice(texts: string[]): number[];
// La implementación: un cuerpo que cubre todas las firmas. No se ve desde fuera.
function parsePrice(input: string | string[]): number | number[] {
  const clean = (text: string) => Number(text.replaceAll('$', '').replaceAll(',', ''));
  return Array.isArray(input) ? input.map(clean) : clean(input);
}

const one = parsePrice('$1,250.50'); // number (no number | number[])
const many = parsePrice(['$35', '$1,099']); // number[]
console.log('uno →', one.toFixed(2));
console.log('varios →', many.map((price) => price.toFixed(2)));

// 🐛 Un valor que puede ser string O string[] no encaja en NINGUNA firma:
//    cada sobrecarga se comprueba por separado, y la implementación no cuenta.
function readField(multiple: boolean): string | string[] {
  return multiple ? ['$10', '$20'] : '$10';
}
const field = readField(true);
console.log('🐛', parsePrice(field)); // ❌ Error TS2769 a propósito: ninguna sobrecarga acepta la unión

// En el JavaScript generado solo queda la implementación: las firmas se borran.
console.log('sobrecargas en ejecución →', parsePrice.length, 'parámetro');
```
