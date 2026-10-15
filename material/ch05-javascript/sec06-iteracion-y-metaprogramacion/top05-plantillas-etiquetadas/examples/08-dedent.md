---
example_description: "Un texto de varias líneas escrito dentro de código indentado arrastra la indentación; una etiqueta dedent la quita (y las líneas vacías de los extremos), como textwrap.dedent de Python"
example_tags: "javascript|python|plantillas|tagged-templates|multilinea|dedent"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const order = { id: 'P-2207', coffee: 2, bread: 3, total: 131 };

// 🤔 Una plantilla de varias líneas dentro de una función indentada: los
//    espacios del código y los saltos de línea de los extremos son parte del texto.
function plainReceipt(o) {
  return `
    Pedido ${o.id}
      Café de olla × ${o.coffee}
      Pan dulce × ${o.bread}
    Total: $${o.total}
  `;
}
console.log('🤔 normal →', JSON.stringify(plainReceipt(order)));

// ✅ dedent: une trozos y valores, quita la primera y la última línea si están
//    vacías y resta a todas las líneas la indentación mínima.
function dedent(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) text += values[i] + strings[i + 1];
  const lines = text.split('\n');
  if (lines[0].trim() === '') lines.shift();
  if (lines.at(-1).trim() === '') lines.pop();
  const indents = lines.filter((line) => line.trim() !== '').map((line) => line.length - line.trimStart().length);
  const minIndent = Math.min(...indents);
  return lines.map((line) => line.slice(minIndent)).join('\n');
}

function receipt(o) {
  return dedent`
    Pedido ${o.id}
      Café de olla × ${o.coffee}
      Pan dulce × ${o.bread}
    Total: $${o.total}
  `;
}
console.log('✅ dedent →', JSON.stringify(receipt(order)));
console.log(receipt(order));

// (Fíjate en $${o.total}: el primer $ es texto y el segundo abre el valor.)

// > Desde Python: textwrap.dedent(texto) hace lo mismo, pero se llama sobre el
//   resultado. Una etiqueta se aplica al escribir la plantilla, y podría tratar
//   los trozos (tu código) de forma distinta que los valores (los datos).
```
