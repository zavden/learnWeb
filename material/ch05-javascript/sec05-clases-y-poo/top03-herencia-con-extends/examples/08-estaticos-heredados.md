---
example_description: "Los estáticos se heredan por delegación: this.count += 1 en un estático crea una propiedad propia en la subclase, y this.#privado falla cuando this es una subclase"
example_tags: "javascript|clases|herencia|static|privados|sombreado|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// 🐛 1. Un contador estático con this.count += 1.
class Vehicle {
  static count = 0;
  constructor() {
    this.constructor.register(); // llama al estático de la clase real del objeto
  }
  static register() {
    this.count += 1; // this = la clase sobre la que se llamó
  }
}
class Bike extends Vehicle {}

new Vehicle();
new Bike();
new Bike();
// El primer new Bike() LEE el count heredado de Vehicle (1 en ese momento) y
// ESCRIBE uno propio en Bike: el sombreado del módulo anterior, entre clases.
console.log('🐛 Vehicle.count →', Vehicle.count, '| Bike.count →', Bike.count);
console.log("🐛 ¿Bike tiene count propio? →", Object.hasOwn(Bike, 'count'));

// ✅ Si el contador es de toda la jerarquía, nombra la clase que lo guarda.
class Car {
  static count = 0;
  constructor() {
    Car.count += 1;
  }
}
class Taxi extends Car {}
new Car();
new Taxi();
console.log('✅ Car.count →', Car.count, '| Taxi.count (heredado) →', Taxi.count);

// 🐛 2. Un estático privado leído con this: la subclase no tiene el campo.
class Ticket {
  static #nextNumber = 1;
  static next() {
    return this.#nextNumber++; // ❌ si this es una subclase, no tiene #nextNumber
  }
}
class VipTicket extends Ticket {}
console.log('Ticket.next() →', Ticket.next());
try {
  VipTicket.next();
} catch (error) {
  console.log('🐛 VipTicket.next() →', error.name, '|', error.message);
}

// ✅ Con los estáticos privados, usa el nombre de la clase: Ticket.#nextNumber.
class Order {
  static #nextNumber = 1;
  static next() {
    return Order.#nextNumber++;
  }
}
class ExpressOrder extends Order {}
console.log('✅ números →', Order.next(), ExpressOrder.next(), Order.next());
```
