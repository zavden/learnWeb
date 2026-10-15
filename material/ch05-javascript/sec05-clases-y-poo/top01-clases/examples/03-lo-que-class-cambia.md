---
example_description: "Lo que class hace distinto de una función constructora: exige new, su cuerpo es estricto, los métodos no son constructores, prototype no se puede reemplazar y no crea una global en window"
example_tags: "javascript|clases|new|modo-estricto|prototype|diferencias"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
function OldProduct(title) {
  this.title = title;
}

class Product {
  constructor(title) {
    this.title = title;
  }
  describe() {
    // 2. El cuerpo de una clase es SIEMPRE estricto, aunque el script no lo sea:
    // asignar a una variable sin declarar no crea una global, lanza un error.
    lastDescribed = this.title; // ❌ falta let
    return this.title;
  }
}

// 1. Sin new: la constructora corre como llamada simple (y escribe en window);
//    la clase lanza un TypeError en el acto.
console.log('OldProduct sin new →', OldProduct('Silla'), '| window.title →', window.title);
try {
  Product('Silla');
} catch (error) {
  console.log('Product sin new →', error.name, '|', error.message);
}

const chair = new Product('Silla plegable');
try {
  chair.describe();
} catch (error) {
  console.log('modo estricto →', error.name, '|', error.message);
}

// 3. Los métodos de una clase no son constructores (no tienen prototype).
console.log('chair.describe.prototype →', chair.describe.prototype);
try {
  new chair.describe();
} catch (error) {
  console.log('new con un método →', error.name, '|', error.message);
}

// 4. Product.prototype no se puede reemplazar (writable: false). Fuera de la
//    clase, en un script clásico, la asignación falla en silencio.
const originalPrototype = Product.prototype;
Product.prototype = { describe() { return 'otro'; } };
console.log('¿sigue el prototype original? →', Product.prototype === originalPrototype);

// 5. Una declaración class no crea una propiedad en window (como let y const).
console.log("'OldProduct' in window →", 'OldProduct' in window); // true
console.log("'Product' in window →", 'Product' in window);       // false
```
