---
example_description: "Una etiqueta que reconstruye el texto intercalando trozos y valores, y formatea cada número como pesos mexicanos con Intl: lo que en Python haría el formato {precio:,.2f} de una f-string"
example_tags: "javascript|python|plantillas|tagged-templates|intl|formato"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

// El esqueleto de casi toda etiqueta: recorrer los trozos e intercalar los
// valores (ya transformados) entre ellos.
function mxn(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    result += typeof value === 'number' ? pesos.format(value) : String(value);
    result += strings[i + 1];
  }
  return result;
}

const order = { customer: 'Diego Salas', subtotal: 1250.5, shipping: 89, items: 3 };
const total = order.subtotal + order.shipping;

console.log('sin etiqueta →', `${order.customer}: ${order.subtotal} + envío ${order.shipping} = ${total}`);
console.log('con mxn      →', mxn`${order.customer}: ${order.subtotal} + envío ${order.shipping} = ${total}`);

// Ojo: la etiqueta formatea TODOS los números, también los que no son dinero.
console.log('🤔 cantidad   →', mxn`${order.items} productos por ${total}`);
// Las etiquetas trabajan con el TIPO de cada valor, no con su significado:
// para elegir, pasa números ya formateados o usa otra etiqueta.

// > Desde Python:
//   f"{order['customer']}: {subtotal:,.2f}"   ← formato dentro de la plantilla
//   En JavaScript no hay especificadores de formato en las plantillas: o
//   llamas a Intl en cada valor, o lo hace una etiqueta por ti.
```
