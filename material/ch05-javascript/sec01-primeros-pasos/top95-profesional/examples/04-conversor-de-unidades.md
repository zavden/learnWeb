---
example_description: "Conversor de unidades que entiende textos como '26,2 mi': tabla de unidades, dimensiones incompatibles, errores con cause"
example_tags: "javascript|profesional|conversion|errores|cause|consola"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// CONVERSOR DE UNIDADES de longitud, masa y volumen.
//
// Decisiones de diseño:
// - Cada unidad se describe con su DIMENSIÓN y su factor respecto a la unidad base
//   (metro, gramo, litro). Así se convierte cualquier par con dos operaciones y se
//   detecta un sinsentido como «kg → km».
// - El texto se analiza carácter a carácter: número (con coma o punto) + unidad.
// - Los errores de bajo nivel se envuelven con { cause } para que el mensaje final
//   diga QUÉ conversión falló sin perder POR QUÉ.
//
// Alcance: function se estudia en «Funciones y ámbito»; objetos y métodos de string
// (slice, trim, replace) en «Números, texto y colecciones».

const UNITS = {
  mm: { dimension: 'longitud', factor: 0.001 },
  cm: { dimension: 'longitud', factor: 0.01 },
  m: { dimension: 'longitud', factor: 1 },
  km: { dimension: 'longitud', factor: 1000 },
  in: { dimension: 'longitud', factor: 0.0254 },
  ft: { dimension: 'longitud', factor: 0.3048 },
  mi: { dimension: 'longitud', factor: 1609.344 },
  g: { dimension: 'masa', factor: 1 },
  kg: { dimension: 'masa', factor: 1000 },
  oz: { dimension: 'masa', factor: 28.349523125 },
  lb: { dimension: 'masa', factor: 453.59237 },
  ml: { dimension: 'volumen', factor: 0.001 },
  l: { dimension: 'volumen', factor: 1 },
  gal: { dimension: 'volumen', factor: 3.785411784 }, // galón estadounidense
};

function findUnit(symbol) {
  const unit = UNITS[symbol];
  // typeof y no «=== undefined»: UNITS hereda propiedades como toString.
  if (typeof unit !== 'object') {
    throw new RangeError(`unidad desconocida «${symbol}»`);
  }
  return unit;
}

// '26,2 mi' → { value: 26.2, symbol: 'mi' }
function parseQuantity(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new TypeError('no hay cantidad que convertir');
  }
  const clean = text.trim();
  // La unidad empieza en el primer carácter que no forma parte del número.
  let unitStart = 0;
  for (const ch of clean) {
    const isNumberPart = (ch >= '0' && ch <= '9') || ch === '.' || ch === ',' || ch === '-';
    if (!isNumberPart) {
      break;
    }
    unitStart++;
  }
  const numberText = clean.slice(0, unitStart);
  const symbol = clean.slice(unitStart).trim();
  const value = Number(numberText.replace(',', '.'));
  if (numberText === '' || Number.isNaN(value)) {
    throw new TypeError(`«${clean}» no empieza por un número`);
  }
  if (symbol === '') {
    throw new TypeError(`«${clean}» no indica la unidad`);
  }
  return { value: value, symbol: symbol };
}

function convert(text, targetSymbol) {
  try {
    const quantity = parseQuantity(text);
    const from = findUnit(quantity.symbol);
    const to = findUnit(targetSymbol);
    if (from.dimension !== to.dimension) {
      throw new TypeError(`no se puede pasar ${from.dimension} (${quantity.symbol}) a ${to.dimension} (${targetSymbol})`);
    }
    const result = quantity.value * from.factor / to.factor;
    return Math.round(result * 1000) / 1000; // 3 decimales bastan para mostrar
  } catch (error) {
    throw new Error(`no se pudo convertir «${text}» a ${targetSymbol}`, { cause: error });
  }
}

// ── Peticiones de ejemplo ───────────────────────────────────────────────

const requests = [
  { text: '26,2 mi', to: 'km' },   // una maratón
  { text: '12.5 km', to: 'mi' },
  { text: '5 lb', to: 'kg' },
  { text: '330 ml', to: 'l' },
  { text: '1 gal', to: 'l' },
  { text: '72kg', to: 'lb' },      // sin espacio también vale
  { text: '3 kg', to: 'm' },       // dimensiones distintas
  { text: 'tres km', to: 'm' },
  { text: '10 furlong', to: 'm' },
  { text: '', to: 'm' },
];

for (const request of requests) {
  try {
    console.log(`✅ ${request.text} = ${convert(request.text, request.to)} ${request.to}`);
  } catch (error) {
    console.log(`❌ ${error.message}\n   motivo: ${error.cause.message}`);
  }
}
```
