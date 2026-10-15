---
example_description: "Composición de funciones: pipe y compose construyen una función grande encadenando funciones pequeñas y puras (un generador de slugs)"
example_tags: "javascript|python|orden-superior|composicion|pipe|reduce"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una función de ORDEN SUPERIOR recibe funciones o devuelve funciones.
// pipe recibe varias funciones y devuelve UNA que las aplica en orden:
//   pipe(f, g, h)(x)  ===  h(g(f(x)))
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);

// Piezas pequeñas, puras y con UNA entrada y UNA salida:
const trim = (text) => text.trim();
const toLower = (text) => text.toLowerCase();
const removeAccents = (text) =>
  [...text.normalize('NFD')]          // separa «á» en «a» + tilde combinante
    .filter((char) => char < '̀' || char > 'ͯ') // quita las marcas
    .join('');
const spacesToDashes = (text) => text.split(' ').filter((word) => word !== '').join('-');

const slugify = pipe(trim, toLower, removeAccents, spacesToDashes);
console.log(slugify('  Guía de Música   Clásica ')); // 'guia-de-musica-clasica'
console.log(slugify('Cómo funciona el DOM'));       // 'como-funciona-el-dom'

// compose es lo mismo de DERECHA a IZQUIERDA, como en matemáticas: (f ∘ g)(x) = f(g(x)).
const compose = (...fns) => (input) => fns.reduceRight((value, fn) => fn(value), input);
const exclaim = (text) => `${text}!`;
const shout = compose(exclaim, (text) => text.toUpperCase());
console.log(shout('oferta')); // 'OFERTA!'

// Como cada pieza es independiente, se reutiliza en otras tuberías:
const normalizeSearch = pipe(trim, toLower, removeAccents);
const titles = ['Árbol de Navidad', 'arbol genealógico', 'Barco'];
const query = normalizeSearch('  ÁRBOL ');
console.log('búsqueda →', titles.filter((title) => normalizeSearch(title).includes(query)));

// Encadenar métodos (filter().map()) también es componer, con los métodos del array.
// > Desde Python: no hay pipe en la biblioteca estándar; se escribe igual con
//   functools.reduce(lambda value, fn: fn(value), fns, x).
```
