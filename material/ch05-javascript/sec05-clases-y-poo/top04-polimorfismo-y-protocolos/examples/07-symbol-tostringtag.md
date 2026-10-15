---
example_description: "Symbol.toStringTag elige la etiqueta que devuelve Object.prototype.toString para tus clases, la que usa la conversión a texto cuando no hay un toString propio"
example_tags: "javascript|python|protocolos|symbol-tostringtag|tostring|tipos"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// La etiqueta de tipo de la lección «Prototipos nativos»:
const tagOf = (value) => Object.prototype.toString.call(value);

class Invoice {
  constructor(number) {
    this.number = number;
  }
}

class Shipment {
  constructor(tracking) {
    this.tracking = tracking;
  }
  // Un getter con la clave Symbol.toStringTag (va en el prototipo).
  get [Symbol.toStringTag]() {
    return 'Shipment';
  }
}

const invoice = new Invoice('F-2026-118');
const shipment = new Shipment('MX-4471-209');

console.log('sin etiqueta →', tagOf(invoice));  // [object Object]
console.log('con etiqueta →', tagOf(shipment)); // [object Shipment]

// Los nativos ya traen la suya:
console.log('nativos →', tagOf(new Map()), tagOf(new Set()), tagOf(JSON), tagOf(Math));
console.log('Map.prototype[Symbol.toStringTag] →', Map.prototype[Symbol.toStringTag]);

// Sin un toString propio, convertir a texto usa Object.prototype.toString:
console.log('plantillas →', `${invoice}`, '|', `${shipment}`);

// Útil para mensajes de error genéricos y para depurar:
function describeValue(value) {
  return `${tagOf(value).slice(8, -1)} (${typeof value})`;
}
console.log('describeValue →', [shipment, [], null, new Date(0)].map(describeValue));

// ⚠️ No sirve para comprobar tipos de forma segura: cualquiera puede ponerse
// la etiqueta que quiera.
const fake = { [Symbol.toStringTag]: 'Shipment' };
console.log('impostor →', tagOf(fake));

// > Desde Python: type(x).__name__ da el nombre real de la clase y no se puede
//   falsear tan fácilmente; Symbol.toStringTag es solo una etiqueta para mostrar.
```
