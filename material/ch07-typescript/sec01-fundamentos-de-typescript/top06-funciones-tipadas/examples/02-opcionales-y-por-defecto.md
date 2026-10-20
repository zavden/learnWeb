---
example_description: "Parámetros opcionales (title?: string, que dentro vale string | undefined) frente a parámetros con valor por defecto (nights = 1, cuyo tipo se infiere y dentro nunca es undefined); undefined explícito usa el valor por defecto"
example_tags: "typescript|python|funciones|parametros-opcionales|valores-por-defecto"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Opcional con ?: se puede omitir; dentro, title es string | undefined.
function formatGuest(name: string, title?: string): string {
  return title === undefined ? name : `${title} ${name}`;
}

// Con valor por defecto: el tipo se infiere del valor (number, boolean) y,
// dentro de la función, nunca es undefined.
function stayLabel(guest: string, nights = 1, breakfast = false): string {
  const extras = breakfast ? ' con desayuno' : '';
  return `${guest}: ${nights} ${nights === 1 ? 'noche' : 'noches'}${extras}`;
}

console.log(formatGuest('Carmen Vidal'));
console.log(formatGuest('Carmen Vidal', 'Dra.'));
console.log(stayLabel('Iván Soto'));
console.log(stayLabel('Iván Soto', 3, true));
// Para saltarse un parámetro intermedio, undefined usa su valor por defecto:
console.log(stayLabel('Iván Soto', undefined, true));

// > Desde Python: def stay_label(guest: str, nights: int = 1, breakfast: bool = False)
//   y def format_guest(name: str, title: str | None = None). En TypeScript, el
//   «?» es el equivalente del «= None», con undefined en lugar de None.
```
