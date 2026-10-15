---
example_description: "Si el consumidor deja de iterar antes del final (break, return, un error, una desestructuración parcial), for…of llama al método return() del iterador: el sitio para liberar recursos"
example_tags: "javascript|python|iteradores|return|break|limpieza"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Un lector de líneas que «abre» un archivo y debe cerrarlo pase lo que pase.
function lineReader(text, fileName) {
  const lines = text.split('\n');
  let index = 0;
  console.log(`  📂 abro ${fileName}`);
  return {
    [Symbol.iterator]() {
      return this;
    },
    next() {
      if (index < lines.length) return { value: lines[index++], done: false };
      console.log(`  📁 fin de ${fileName}`);
      return { value: undefined, done: true };
    },
    // return() es OPCIONAL. Si existe, se llama cuando el consumidor se va antes
    // de tiempo. Debe devolver un objeto { value, done: true }.
    return() {
      console.log(`  🧹 cierro ${fileName} (líneas leídas: ${index})`);
      return { value: undefined, done: true };
    },
  };
}

const sales = 'fecha,producto,unidades\n2026-10-01,café,12\n2026-10-01,pan,30\n2026-10-02,café,9';

console.log('▶ recorrido completo: return() NO se llama');
for (const line of lineReader('a\nb', 'corto.csv'));

console.log('▶ break');
for (const line of lineReader(sales, 'ventas.csv')) {
  if (line.includes('pan')) break;
}

console.log('▶ desestructuración parcial: solo necesita la cabecera');
const [header] = lineReader(sales, 'ventas.csv');
console.log('  cabecera →', header);

console.log('▶ un error dentro del bucle');
try {
  for (const line of lineReader(sales, 'ventas.csv')) {
    if (line.endsWith(',30')) throw new RangeError(`cantidad sospechosa: ${line}`);
  }
} catch (error) {
  console.log(`  ⛔ ${error.name}: ${error.message}`);
}

console.log('▶ return dentro de una función');
function firstSaleOf(product) {
  for (const line of lineReader(sales, 'ventas.csv')) {
    if (line.includes(`,${product},`)) return line;
  }
}
console.log('  primera venta de café →', firstSaleOf('café'));

// > Desde Python: un iterador escrito a mano no tiene nada parecido; Python lo
//   resuelve con los gestores de contexto (with open(…) as f). Los generadores
//   sí tienen close(), que es el return() de los generadores de JavaScript.
```
