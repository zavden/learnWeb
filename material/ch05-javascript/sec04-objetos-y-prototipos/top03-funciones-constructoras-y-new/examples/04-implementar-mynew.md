---
example_description: "myNew(F, …args) reproduce new con Object.create y apply en cuatro líneas, y se comprueba contra el new de verdad"
example_tags: "javascript|prototipos|new|object-create|apply"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// new hecho a mano con piezas que ya conoces.
function myNew(Constructor, ...args) {
  // 1 y 2: objeto vacío cuyo [[Prototype]] es Constructor.prototype
  const instance = Object.create(Constructor.prototype);
  // 3: ejecutar la constructora con this = instance (call/apply, lección «this»)
  const result = Constructor.apply(instance, args);
  // 4: si la constructora devolvió un OBJETO (o una función), gana ese;
  //    si devolvió un primitivo o nada, se devuelve instance.
  const returnedObject = (typeof result === 'object' && result !== null) || typeof result === 'function';
  return returnedObject ? result : instance;
}

function Booking(guest, nights) {
  this.guest = guest;
  this.nights = nights;
}
Booking.prototype.total = function (pricePerNight) {
  return this.nights * pricePerNight;
};

const real = new Booking('Carmen Vidal', 3);
const handmade = myNew(Booking, 'Carmen Vidal', 3);

console.log('new   →', real);
console.log('myNew →', handmade);
console.log('¿mismo prototipo? →', Object.getPrototypeOf(handmade) === Booking.prototype); // true
console.log('instanceof →', handmade instanceof Booking);                                  // true
console.log('total(85) →', handmade.total(85));                                            // 255

// El paso 4, con una constructora que devuelve otro objeto:
function Draft(title) {
  this.title = title;
  return { title, status: 'borrador' }; // reemplaza al objeto creado
}
console.log('new Draft   →', new Draft('Informe trimestral'));
console.log('myNew Draft →', myNew(Draft, 'Informe trimestral'));

// Y con una que devuelve un primitivo (se ignora):
function Counter() {
  this.count = 0;
  return 42;
}
console.log('new Counter   →', new Counter());
console.log('myNew Counter →', myNew(Counter));

// Lo único que myNew no imita: dentro de la constructora, new.target
// (ejemplo 10) vale undefined, porque la llamamos con apply y no con new.
```
