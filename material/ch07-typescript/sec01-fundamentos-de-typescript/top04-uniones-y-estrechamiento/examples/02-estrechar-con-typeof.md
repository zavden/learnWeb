---
example_description: "Estrechamiento con typeof: dentro de un if (o tras un return temprano, o en un ternario) TypeScript sabe cuál de los tipos de la unión tiene el valor y deja usar sus métodos; es análisis del flujo del código, no magia en ejecución"
example_tags: "typescript|python|estrechamiento|narrowing|typeof|uniones"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
function shout(ref: string | number): string {
  if (typeof ref === 'string') {
    // Aquí dentro, ref es string: el if lo ha ESTRECHADO.
    return ref.toUpperCase();
  }
  // Si era string, la función ya terminó: aquí solo queda number.
  return `PEDIDO-${ref.toString().padStart(6, '0')}`;
}

console.log(shout('web-2026-001'));
console.log(shout(1042));

// También en un ternario, y con más de dos tipos:
function formatWeight(weight: number | string | null): string {
  if (weight === null) return 'peso sin indicar'; // quita null
  return typeof weight === 'number'
    ? `${weight.toFixed(1)} kg` // number
    : weight.trim(); // string
}

console.log(formatWeight(1.25));
console.log(formatWeight('  medio kilo '));
console.log(formatWeight(null));

// TypeScript lee los if, return, ternarios, && y || como lees tú el código.
// En ejecución no hay nada nuevo: es el typeof de JavaScript de siempre.
// > Desde Python: mypy hace lo mismo con isinstance(ref, str).
```
