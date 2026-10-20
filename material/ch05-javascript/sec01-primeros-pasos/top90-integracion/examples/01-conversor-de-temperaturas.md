---
example_description: "Conversor de temperaturas que recibe texto: conversión explícita, NaN, switch por unidad y errores con mensaje claro"
example_tags: "javascript|integracion|coercion|switch|errores"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Integra: conversión explícita de tipos (lecciones 4 y 5), switch (6) y errores (7).
// function se estudia en el módulo «Funciones y ámbito»; aquí basta con la sintaxis básica.

const ABSOLUTE_ZERO_C = -273.15;

// Convierte un texto como '36,6' o ' 98.6 ' en número, o lanza un error claro.
function parseReading(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    // Number('') valdría 0: un campo vacío no debe convertirse en «0 grados».
    throw new TypeError('Falta la temperatura');
  }
  // trim y replace son métodos de string (módulo «Números, texto y colecciones»).
  const value = Number(text.trim().replace(',', '.'));
  // Number.isNaN(x) es true solo si x es NaN (lo verás en el mismo módulo).
  if (Number.isNaN(value)) {
    throw new TypeError(`«${text}» no es un número`);
  }
  return value;
}

function toCelsius(value, unit) {
  switch (unit) {
    case 'C':
      return value;
    case 'F':
      return (value - 32) * 5 / 9;
    case 'K':
      return value + ABSOLUTE_ZERO_C;
    default:
      throw new RangeError(`Unidad desconocida «${unit}» (usa C, F o K)`);
  }
}

function convert(text, unit) {
  const celsius = toCelsius(parseReading(text), unit);
  if (celsius < ABSOLUTE_ZERO_C) {
    throw new RangeError(`${text} ${unit} está por debajo del cero absoluto`);
  }
  const fahrenheit = celsius * 9 / 5 + 32;
  const kelvin = celsius - ABSOLUTE_ZERO_C;
  return `${celsius.toFixed(2)} °C | ${fahrenheit.toFixed(2)} °F | ${kelvin.toFixed(2)} K`;
}

// Lecturas tal como llegarían de un formulario: todo es texto.
// (Un array de objetos como datos; se estudian en «Números, texto y colecciones».)
const readings = [
  { text: '36,6', unit: 'C' },
  { text: '98.6', unit: 'F' },
  { text: '0', unit: 'K' },
  { text: '', unit: 'C' },
  { text: 'templado', unit: 'C' },
  { text: '-300', unit: 'C' },
  { text: '20', unit: 'X' },
];

for (const reading of readings) {
  const label = `«${reading.text}» ${reading.unit}`;
  try {
    console.log('✅', label, '→', convert(reading.text, reading.unit));
  } catch (error) {
    console.log('❌', label, '→', `${error.name}: ${error.message}`);
  }
}
```
