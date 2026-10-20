---
example_description: "Parámetros rest tipados (...prices: number[]): cualquier número de argumentos del mismo tipo, y spread de un array al llamar; una tupla se puede repartir entre parámetros fijos"
example_tags: "typescript|python|funciones|rest|spread|tuplas"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
// El rest recoge los argumentos sobrantes en un array: su tipo es un array.
// Python: def total_of(*prices: float) -> float
function totalOf(...prices: number[]): number {
  return prices.reduce((sum, price) => sum + price, 0);
}

console.log('3 precios →', totalOf(45, 120, 89));
console.log('ninguno →', totalOf());

// Con spread se pasa un array como argumentos sueltos:
const cart = [210, 35, 189];
console.log('carrito →', totalOf(...cart));

// Parámetros fijos y un rest al final:
function logLine(level: 'info' | 'aviso', ...parts: string[]): void {
  console.log(`[${level}]`, parts.join(' · '));
}
logLine('info', 'pedido P-2001', 'pagado', 'enviado');

// Una TUPLA sí se puede repartir entre parámetros fijos: TypeScript sabe
// cuántos elementos tiene y de qué tipo es cada uno.
function stayLabel(guest: string, nights: number): string {
  return `${guest}: ${nights} noches`;
}
const booking: [string, number] = ['Lucía Méndez', 3];
console.log(stayLabel(...booking));
```
