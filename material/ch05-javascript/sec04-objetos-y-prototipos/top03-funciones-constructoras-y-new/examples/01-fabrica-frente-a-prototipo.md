---
example_description: "Una fábrica que escribe los métodos en cada objeto crea una función por objeto; con Object.create los métodos existen una sola vez en el prototipo"
example_tags: "javascript|prototipos|fabricas|object-create|memoria"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Fábrica ingenua: cada objeto lleva SU PROPIA copia de cada método.
function createProductNaive(title, cents) {
  return {
    title,
    cents,
    describe() {
      return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
    },
  };
}

// Fábrica con prototipo: los métodos viven una vez en productMethods.
const productMethods = {
  describe() {
    return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
  },
};
function createProduct(title, cents) {
  const product = Object.create(productMethods); // 1. objeto con el prototipo
  product.title = title;                          // 2. datos propios
  product.cents = cents;
  return product;                                 // 3. devolverlo
}

// Un catálogo de 1000 productos con cada fábrica:
const titles = Array.from({ length: 1000 }, (_, index) => `Producto ${index + 1}`);
const naiveCatalog = titles.map((title) => createProductNaive(title, 1000));
const catalog = titles.map((title) => createProduct(title, 1000));

// ¿Cuántas funciones describe distintas hay en cada catálogo?
console.log('fábrica ingenua →', new Set(naiveCatalog.map((p) => p.describe)).size, 'funciones');
console.log('con prototipo   →', new Set(catalog.map((p) => p.describe)).size, 'función');

// Las dos versiones se usan igual:
console.log(naiveCatalog[0].describe(), '|', catalog[0].describe());

// La segunda receta (crear con Object.create, rellenar this, devolver) es tan
// habitual que el lenguaje la trae hecha: se llama new, y la verás en el
// siguiente ejemplo.
```
