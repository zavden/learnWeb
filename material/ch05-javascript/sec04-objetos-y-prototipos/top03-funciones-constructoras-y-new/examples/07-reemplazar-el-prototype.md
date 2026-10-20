---
example_description: "Sustituir F.prototype por un literal deja a los objetos anteriores con el prototipo viejo (instanceof da false) y hace que constructor apunte a Object"
example_tags: "javascript|prototipos|prototype|constructor|instanceof|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function Coupon(code, percent) {
  this.code = code;
  this.percent = percent;
}
const summer = new Coupon('VERANO10', 10); // creado ANTES del cambio

// Reemplazar prototype entero con un literal es cómodo para escribir varios
// métodos de golpe… pero cambia la propiedad a OTRO objeto.
Coupon.prototype = {
  apply(cents) {
    return Math.round(cents * (1 - this.percent / 100));
  },
  describe() {
    return `${this.code} (-${this.percent} %)`;
  },
};
const autumn = new Coupon('OTOÑO15', 15);
console.log('autumn.describe() →', autumn.describe());

// 🐛 1. Los objetos creados antes siguen enlazados al prototype VIEJO:
// no tienen los métodos nuevos… y ni siquiera son «instanceof Coupon».
console.log('🐛 typeof summer.describe →', typeof summer.describe); // 'undefined'
console.log('🐛 summer instanceof Coupon →', summer instanceof Coupon); // false

// 🐛 2. El literal no tiene constructor: la búsqueda sigue hasta
// Object.prototype y encuentra Object.
console.log('🐛 autumn.constructor === Coupon →', autumn.constructor === Coupon); // false
console.log('🐛 autumn.constructor.name →', autumn.constructor.name); // 'Object'

// ✅ Opción 1: AÑADIR al prototype que ya existe (conserva constructor).
function GiftCard(code, cents) {
  this.code = code;
  this.cents = cents;
}
Object.assign(GiftCard.prototype, {
  describe() {
    return `${this.code}: ${(this.cents / 100).toFixed(2)} €`;
  },
});
const gift = new GiftCard('REGALO-50', 5000);
console.log('✅ gift.constructor === GiftCard →', gift.constructor === GiftCard); // true

// ✅ Opción 2: si lo reemplazas, hazlo ANTES de crear objetos y restaura
// constructor como no enumerable, igual que el original.
Object.defineProperty(Coupon.prototype, 'constructor', {
  value: Coupon,
  writable: true,
  enumerable: false,
  configurable: true,
});
console.log('✅ autumn.constructor === Coupon →', autumn.constructor === Coupon); // true
```
