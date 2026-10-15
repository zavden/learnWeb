---
example_description: "Object.freeze(this) en el constructor del padre impide que la hija cree sus campos o asigne en su constructor (TypeError: object is not extensible); congela solo en la clase final con new.target"
example_tags: "javascript|patrones|inmutabilidad|freeze|herencia|campos|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// 🐛 La base se congela a sí misma al final de su constructor…
class Address {
  constructor(street, city) {
    this.street = street;
    this.city = city;
    Object.freeze(this);
  }
}

// …y la hija, que se inicializa DESPUÉS de super(), ya no puede añadir nada.
class ShippingAddress extends Address {
  instructions = 'Dejar en recepción'; // campo: se define tras super()
}
try {
  new ShippingAddress('Av. Juárez 15', 'Puebla');
} catch (error) {
  console.log('🐛 campo de la hija →', error.name, '|', error.message);
}

class BillingAddress extends Address {
  constructor(street, city, taxId) {
    super(street, city);
    this.taxId = taxId; // asignación tras super(): el objeto ya está congelado
  }
}
try {
  new BillingAddress('Calle 60 n.º 491', 'Mérida', 'XAXX010101000');
} catch (error) {
  console.log('🐛 asignación de la hija →', error.name, '|', error.message);
}

// ✅ Congelar solo cuando se crea un objeto de ESTA clase exacta, y que cada
//    subclase congele al final de su propio constructor.
class SafeAddress {
  constructor(street, city) {
    this.street = street;
    this.city = city;
    if (new.target === SafeAddress) Object.freeze(this); // ¿soy la clase final?
  }
}
class SafeShippingAddress extends SafeAddress {
  instructions = 'Dejar en recepción';
  constructor(street, city) {
    super(street, city);
    if (new.target === SafeShippingAddress) Object.freeze(this);
  }
}
const home = new SafeShippingAddress('Av. Juárez 15', 'Puebla');
console.log('✅ hija →', home, '| ¿congelada? →', Object.isFrozen(home));
const office = new SafeAddress('Reforma 222', 'Ciudad de México');
console.log('✅ base →', office, '| ¿congelada? →', Object.isFrozen(office));

// Muchas veces la mejor solución es no heredar de un objeto de valor: si
// necesitas más datos, crea otro tipo que lo CONTENGA (composición).
```
