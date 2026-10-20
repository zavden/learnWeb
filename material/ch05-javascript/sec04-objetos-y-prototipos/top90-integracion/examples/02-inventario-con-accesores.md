---
example_description: "Inventario de una tienda de bicicletas: accesores en el prototipo que validan precio y stock, datos internos no enumerables, toJSON y unas reglas congeladas en profundidad"
example_tags: "javascript|integracion|getters|setters|defineproperty|freeze"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// INVENTARIO de una tienda de bicicletas. Cada producto valida su precio y su
// stock al asignarlos, y las reglas del negocio viven en un objeto congelado.
// Integra: descriptores, getters/setters y freeze profundo («Propiedades a
// fondo»), setters heredados («La cadena de prototipos») y constructoras.

function deepFreeze(value) {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value); // primero congela, después recorre (por si hay ciclos)
  for (const key of Object.getOwnPropertyNames(value)) deepFreeze(value[key]);
  return value;
}

const RULES = deepFreeze({
  categories: ['bicicletas', 'recambios', 'accesorios'],
  stock: { max: 200, lowAlert: 3 },
});
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function Product(sku, name, category, priceCents, stock) {
  // sku: de solo lectura, pero visible (sale en Object.keys y en JSON).
  Object.defineProperty(this, 'sku', { value: sku, enumerable: true });
  this.name = name;
  // Los datos de los accesores, propios y NO enumerables (defineProperty: false
  // por defecto en todo lo que no indiques; aquí solo abrimos writable).
  Object.defineProperties(this, {
    _category: { value: null, writable: true },
    _priceCents: { value: 0, writable: true },
    _stock: { value: 0, writable: true },
  });
  // Estas asignaciones NO crean propiedades: encuentran los setters del
  // prototipo y los ejecutan con this = el producto nuevo.
  this.category = category;
  this.priceCents = priceCents;
  this.stock = stock;
}

Object.defineProperties(Product.prototype, {
  category: {
    get() { return this._category; },
    set(value) {
      if (!RULES.categories.includes(value)) throw new RangeError(`${this.sku}: categoría desconocida «${value}»`);
      this._category = value;
    },
  },
  priceCents: {
    get() { return this._priceCents; },
    set(value) {
      if (!Number.isInteger(value) || value <= 0) throw new RangeError(`${this.sku}: precio no válido (${value})`);
      this._priceCents = value;
    },
  },
  stock: {
    get() { return this._stock; },
    set(value) {
      if (!Number.isInteger(value) || value < 0 || value > RULES.stock.max) {
        throw new RangeError(`${this.sku}: stock fuera de rango (${value})`);
      }
      this._stock = value;
    },
  },
  // Calculadas y de solo lectura: un get sin set.
  price: { get() { return euros.format(this._priceCents / 100); } },
  isLow: { get() { return this._stock <= RULES.stock.lowAlert; } },
});

// Los métodos pasan por los setters: la validación está en UN sitio.
Product.prototype.sell = function (quantity) { this.stock -= quantity; };
Product.prototype.restock = function (quantity) { this.stock += quantity; };
Product.prototype.toJSON = function () {
  return { sku: this.sku, name: this.name, category: this.category, priceCents: this.priceCents, stock: this.stock };
};

const catalog = [
  new Product('BIC-URB-01', 'Bicicleta urbana Lisboa', 'bicicletas', 54900, 4),
  new Product('REC-CAD-08', 'Cadena 8 velocidades', 'recambios', 1895, 12),
  new Product('ACC-LUZ-02', 'Luz trasera USB', 'accesorios', 2450, 2),
];
const [bike, chain, light] = catalog;

// Operaciones con errores controlados (try/catch: lección «Errores»).
const attempt = (label, action) => {
  try {
    action();
    console.log(`✅ ${label}`);
  } catch (error) {
    console.warn(`⛔ ${label} → ${error.name}: ${error.message}`);
  }
};
attempt('vender 3 cadenas', () => chain.sell(3));
attempt('vender 5 bicicletas', () => bike.sell(5));
attempt('precio de la luz a 0', () => { light.priceCents = 0; });
attempt('categoría «ropa»', () => new Product('ROP-MAI-01', 'Maillot', 'ropa', 3990, 6));
attempt('reponer 200 luces', () => light.restock(200));

// Un get sin set: la asignación se ignora en silencio (script clásico).
bike.price = 'gratis';
console.log('bike.price tras asignar «gratis» →', bike.price);

console.log('▼ Stock');
for (const product of catalog) {
  console.log(`  ${product.sku.padEnd(11)} ${String(product.stock).padStart(3)} uds · ${product.price}${product.isLow ? ' ⚠️ stock bajo' : ''}`);
}

// Lo que se ve desde fuera (expande bike: los datos internos salen en gris y los
// accesores, como (...), dentro de su [[Prototype]]):
console.log('bike →', bike);
console.log('Object.keys(bike) →', Object.keys(bike)); // ['sku', 'name']: el resto es no enumerable o heredado
console.log("¿'stock' es propia? →", Object.hasOwn(bike, 'stock'), '| ¿está en la cadena? →', 'stock' in bike);
console.log('JSON →', JSON.stringify(catalog[1])); // toJSON decide qué se guarda
console.log('descriptor de stock →', Object.getOwnPropertyDescriptor(Product.prototype, 'stock'));

// Las reglas congeladas en profundidad no cambian (en silencio o con error):
RULES.stock.max = 9999;
console.log('RULES.stock.max →', RULES.stock.max); // 200
attempt('añadir la categoría «ropa»', () => RULES.categories.push('ropa')); // push lanza TypeError siempre
```
