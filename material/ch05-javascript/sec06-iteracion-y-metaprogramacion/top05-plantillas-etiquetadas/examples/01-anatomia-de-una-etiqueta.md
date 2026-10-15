---
example_description: "Una plantilla etiquetada llama a una función con los trozos de texto y los valores por separado: strings tiene siempre un elemento más que values, los valores llegan sin convertir y la etiqueta puede devolver cualquier cosa"
example_tags: "javascript|python|plantillas|tagged-templates|strings"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una ETIQUETA es una función normal. Escrita delante de una plantilla (sin
// paréntesis), JavaScript la llama con los trozos de texto y los valores
// por separado, en vez de unirlos.
function inspect(strings, ...values) {
  console.log('  strings →', strings);
  console.log('  values  →', values);
  return `${strings.length} trozos de texto, ${values.length} valores`;
}

const guest = 'Rosa';
const nights = 3;

console.log('▶ dos valores');
console.log('  resultado →', inspect`Reserva de ${guest}: ${nights} noches.`);

// strings tiene SIEMPRE un elemento más que values: el texto antes del primer
// valor, entre cada dos, y después del último (aunque sea '').
console.log('▶ empieza y acaba con un valor');
inspect`${guest}${nights}`;

// Los valores llegan TAL CUAL, sin convertir a texto: objetos, números, funciones…
console.log('▶ valores que no son texto');
inspect`Lista: ${['café', 'pan']} total: ${210.5} ok: ${true}`;

// Y la etiqueta puede devolver cualquier cosa, no solo un string.
function parts(strings, ...values) {
  return { text: strings.join('…'), count: values.length };
}
console.log('▶ devuelve un objeto →', parts`Hola, ${guest}. Te esperamos ${nights} noches.`);

// Sin etiqueta, la plantilla convierte cada valor con String() y une todo:
console.log('▶ sin etiqueta →', `Lista: ${['café', 'pan']} total: ${210.5}`);

// > Desde Python: una plantilla sin etiqueta es una f-string. Con etiqueta se
//   parece a las t-strings de Python 3.14 (t"…"), que en vez de un str dan un
//   objeto Template con los trozos y los valores por separado.
```
