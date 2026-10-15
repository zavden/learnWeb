---
example_description: "Tipos de función ((cents: number) => number): un alias para las reglas de precio, arrays de funciones, funciones que devuelven funciones; las flechas asignadas a ese tipo no necesitan anotar sus parámetros. Equivale a Callable de Python"
example_tags: "typescript|python|funciones|tipos-de-funcion|callable|closures"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// El tipo de una función: (parámetros) => retorno.
// Python: PriceRule = Callable[[int], int]
type PriceRule = (cents: number) => number;

// Al asignar a un PriceRule, cents ya es number sin anotarlo (tipado contextual).
const addTax: PriceRule = (cents) => Math.round(cents * 1.16);
const memberDiscount: PriceRule = (cents) => Math.max(0, cents - 2000);

// Una función que DEVUELVE una función (un closure, como en el capítulo 5):
function percentOff(percent: number): PriceRule {
  return (cents) => Math.round(cents * (1 - percent / 100));
}

// Un array de funciones y una función que las recibe:
const rules: PriceRule[] = [percentOff(10), memberDiscount, addTax];

function applyRules(cents: number, ruleList: PriceRule[]): number {
  return ruleList.reduce((current, rule) => rule(current), cents);
}

const base = 45000; // centavos: $450.00
console.log('precio base →', base / 100);
console.log('con reglas →', applyRules(base, rules) / 100);
// Los nombres de los parámetros del tipo solo documentan: no tienen que coincidir.
const roundToPeso: PriceRule = (amount) => Math.round(amount / 100) * 100;
console.log('redondeado →', roundToPeso(applyRules(base, rules)) / 100);
```
