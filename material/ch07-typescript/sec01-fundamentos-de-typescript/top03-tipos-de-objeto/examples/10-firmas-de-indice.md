---
example_description: "Firmas de índice ({ [sku: string]: number }) para objetos usados como diccionario: cualquier clave string, valores comprobados (TS2322); pero leer una clave que no existe da undefined con tipo number, sin aviso (lo mismo que un índice fuera de un array)"
example_tags: "typescript|python|firma-de-indice|diccionario|undefined|ts2322|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// Un objeto usado como diccionario: las claves no se conocen de antemano.
// Python: stock: dict[str, int]
type Stock = { [sku: string]: number };

const stock: Stock = { 'TLA-01': 12, 'MOL-02': 0 };
stock['TAS-03'] = 7; // ✅ cualquier clave string, con valor number
stock['TAS-04'] = 'siete'; // ❌ Error TS2322 a propósito: los valores son number

for (const [sku, units] of Object.entries(stock)) {
  console.log(`${sku}: ${units}`);
}

// 🐛 Leer una clave que no existe: el tipo dice number, el valor es undefined.
const missing = stock['XYZ-99']; // tipo: number (¡sin | undefined!)
try {
  console.log(missing.toFixed(0)); // sin rojo… y falla al ejecutar
} catch (error) {
  console.log('⛔', String(error));
}

// Lo mismo con un índice fuera de un array: prices[10] es «number».
const prices = [45, 120];
console.log('🐛 prices[10] →', prices[10]);

// ✅ Comprueba que la clave existe (o usa un Map: get devuelve number | undefined).
const units = stock['XYZ-99'];
console.log('✅', units === undefined ? 'SKU desconocido' : `${units} unidades`);
```
