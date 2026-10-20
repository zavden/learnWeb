---
example_description: "Cómo se escribe un polyfill correcto: comprobar si el método existe y, solo si falta, añadirlo con defineProperty no enumerable, como los nativos"
example_tags: "javascript|prototipos|polyfill|defineproperty|compatibilidad"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Un POLYFILL añade a un navegador antiguo un método estándar que todavía no
// tiene, para que el código moderno funcione en todas partes. Es el único caso
// en que se toca un prototipo nativo, y se hace con dos precauciones.

// La implementación, como una función normal que usa this (el array):
function findLastPolyfill(predicate) {
  for (let index = this.length - 1; index >= 0; index -= 1) {
    if (predicate(this[index], index, this)) return this[index];
  }
  return undefined;
}

// Precaución 1: comprobar ANTES si el navegador ya lo tiene (detección de
// características). Si existe, no se toca: el nativo es más rápido y correcto.
// Precaución 2: instalarlo con los mismos atributos que un método nativo.
function installFindLast(proto) {
  if (typeof proto.findLast === 'function') {
    return 'ya existe: se usa el nativo';
  }
  Object.defineProperty(proto, 'findLast', {
    value: findLastPolyfill,
    writable: true,
    enumerable: false, // ← no aparece en for…in, como map o filter
    configurable: true,
  });
  return 'instalado el polyfill';
}

console.log('Array.prototype →', installFindLast(Array.prototype)); // Chrome ya lo tiene

// Los atributos que imitamos son los de cualquier método nativo:
console.log('descriptor nativo →', Object.getOwnPropertyDescriptor(Array.prototype, 'findLast'));

// La implementación se puede probar sin instalarla, prestada con call,
// y comparar con la nativa:
const payments = [
  { id: 'P-1', status: 'ok' },
  { id: 'P-2', status: 'fallido' },
  { id: 'P-3', status: 'ok' },
  { id: 'P-4', status: 'fallido' },
];
const isFailed = (payment) => payment.status === 'fallido';
console.log('nativo   →', payments.findLast(isFailed));
console.log('polyfill →', findLastPolyfill.call(payments, isFailed));

// En la práctica no se escriben a mano: herramientas como core-js añaden
// solo los que faltan según los navegadores que quieras soportar.
```
