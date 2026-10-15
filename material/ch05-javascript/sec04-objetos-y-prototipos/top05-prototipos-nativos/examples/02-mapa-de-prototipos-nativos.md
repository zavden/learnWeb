---
example_description: "La cadena de prototipos de los valores nativos (arrays, primitivos, funciones, fechas, errores y elementos del DOM) y el curioso círculo entre Object y Function"
example_tags: "javascript|python|prototipos|nativos|function|dom"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<p>Esta página solo tiene este párrafo; el resultado está en la consola.</p>
```

# JavaScript

```javascript
// Nombra un prototipo por su constructor (lección «Funciones constructoras y new»).
function nameOf(proto) {
  return Object.hasOwn(proto, 'constructor') ? `${proto.constructor.name}.prototype` : '(sin nombre)';
}
function chainOf(value) {
  const steps = [];
  for (let proto = Object.getPrototypeOf(value); proto !== null; proto = Object.getPrototypeOf(proto)) {
    steps.push(nameOf(proto));
  }
  return [...steps, 'null'].join(' → ');
}

console.log('[1, 2]          →', chainOf([1, 2]));
console.log("'texto'         →", chainOf('texto')); // los primitivos también (ejemplo 06)
console.log('42              →', chainOf(42));
console.log('true            →', chainOf(true));
console.log('() => {}        →', chainOf(() => {}));
console.log('new Date()      →', chainOf(new Date('2026-10-12T00:00:00Z')));
console.log('/\\d+/           →', chainOf(/\d+/));
console.log("new TypeError() →", chainOf(new TypeError('dato no válido')));

// Un adelanto del capítulo 6: los elementos de la página son objetos con una
// cadena larga. Cada eslabón aporta métodos: los de los nodos, los de los
// elementos, los de los elementos HTML…
const paragraph = document.querySelector('p');
console.log('<p>             →', chainOf(paragraph));

// El círculo de las funciones nativas:
// Object y Function son FUNCIONES, así que heredan de Function.prototype…
console.log('typeof Object →', typeof Object);
console.log('[[Prototype]] de Object es Function.prototype →', Object.getPrototypeOf(Object) === Function.prototype);
// …y Function.prototype, como todo objeto, hereda de Object.prototype.
console.log('[[Prototype]] de Function.prototype es Object.prototype →',
  Object.getPrototypeOf(Function.prototype) === Object.prototype);
console.log('Object instanceof Function →', Object instanceof Function); // true
console.log('Function instanceof Object →', Function instanceof Object); // true

// > Desde Python: compara con type(42).__mro__ → (int, object) o
//   TypeError.__mro__ → (TypeError, Exception, BaseException, object).
```
