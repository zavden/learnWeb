---
example_description: "Una etiqueta sql que no devuelve texto, sino la consulta con marcadores $1, $2 y los valores aparte: la inyección SQL desaparece porque datos y código nunca se mezclan; la misma idea que las t-strings de Python 3.14"
example_tags: "javascript|python|plantillas|tagged-templates|sql|seguridad|t-strings"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Lo que escribió alguien en el buscador de pedidos por ciudad:
const city = "Mérida' OR '1'='1' --";
const minTotal = 500;

// 🐛 Con una plantilla normal, el dato pasa a formar parte del CÓDIGO SQL: la
//    comilla cierra el texto, OR '1'='1' es siempre cierto y -- convierte el
//    resto en un comentario. La consulta devuelve TODOS los pedidos.
const unsafeQuery = `SELECT * FROM orders WHERE city = '${city}' AND total > ${minTotal}`;
console.log('🐛 texto →', unsafeQuery);

// ✅ Una etiqueta que NO une nada: pone un marcador $1, $2… en el lugar de cada
//    valor y devuelve los valores aparte. La base de datos recibe las dos
//    cosas por separado, así que un dato nunca puede convertirse en código.
function sql(strings, ...values) {
  // reduce sin valor inicial: empieza con strings[0] y el índice i vale 1, 2…
  const text = strings.reduce((query, part, i) => `${query}$${i}${part}`);
  return { text, params: values };
}

const query = sql`SELECT * FROM orders WHERE city = ${city} AND total > ${minTotal}`;
console.log('✅ consulta →', query.text);
console.log('✅ parámetros →', query.params);
// (Librerías reales de bases de datos para Node.js, como postgres.js, tienen
//  una etiqueta sql que funciona así.)

// La etiqueta separa ESTRUCTURA (los trozos, que escribe quien programa) y
// DATOS (los valores, que pueden venir de cualquiera). Puedes guardar las dos
// partes y decidir más tarde qué hacer con ellas:
function template(strings, ...values) {
  return { strings: [...strings], values };
}
const greeting = template`Hola, ${'Rosa'}: tu mesa es la ${7}.`;
console.log('plantilla sin procesar →', JSON.stringify(greeting));
const shout = greeting.values.map((value) => String(value).toUpperCase());
console.log('procesada después →', greeting.strings.reduce((out, part, i) => out + shout[i - 1] + part));

// > Desde Python 3.14: es la idea de las t-strings (PEP 750). t"Hola, {name}"
//   no da un str, sino un objeto Template con .strings y .interpolations, que
//   una función procesa después: sql(t"… {city}"). La diferencia es de sintaxis:
//   en JavaScript la función va DELANTE de la plantilla y se llama sola.
```
