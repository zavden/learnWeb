---
example_description: "Estrechar con if (valor) quita undefined, pero también descarta 0 y '' (son falsy): TypeScript no protesta y las existencias 0 o una nota vacía se tratan como «sin dato». Comparar con undefined o usar ?? lo corrige"
example_tags: "typescript|estrechamiento|truthiness|falsy|undefined|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type StockLine = { name: string; units?: number; note?: string };

// 🐛 if (line.units) quita el undefined… y también el 0, que es falsy.
function describeStock(line: StockLine): string {
  if (line.units) return `${line.name}: ${line.units} uds.`;
  return `${line.name}: sin dato de existencias`;
}

// 🐛 Lo mismo con un texto vacío: '' también es falsy.
function noteOf(line: StockLine): string {
  return line.note || '(sin nota)';
}

const soldOut: StockLine = { name: 'Mole negro', units: 0, note: '' };
console.log('🐛', describeStock(soldOut)); // debería decir 0 uds.
console.log('🐛', noteOf(soldOut)); // la nota existe, aunque esté vacía

// Para TypeScript, los dos son estrechamientos correctos: ningún error rojo.

// ✅ Compara con lo que de verdad quieres descartar:
function describeStockFixed(line: StockLine): string {
  if (line.units !== undefined) return `${line.name}: ${line.units} uds.`;
  return `${line.name}: sin dato de existencias`;
}
// ✅ ?? solo sustituye null y undefined (|| sustituye cualquier falsy):
function noteOfFixed(line: StockLine): string {
  return line.note ?? '(sin nota)';
}

console.log('✅', describeStockFixed(soldOut));
console.log('✅', JSON.stringify(noteOfFixed(soldOut)));
console.log('✅', describeStockFixed({ name: 'Tasajo' }));
```
