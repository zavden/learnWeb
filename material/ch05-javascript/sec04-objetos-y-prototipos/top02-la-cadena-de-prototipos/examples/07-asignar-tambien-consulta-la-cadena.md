---
example_description: "Dos excepciones a «asignar crea una propiedad propia»: un setter heredado se ejecuta y una propiedad heredada de solo lectura bloquea la asignación"
example_tags: "javascript|python|prototipos|setters|writable|asignacion"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Regla general: obj.key = valor crea o cambia una propiedad PROPIA de obj.
// Pero antes de crearla, el motor busca key en la cadena, y hay dos excepciones.

// 1) Si encuentra un SETTER heredado, lo llama (con this = obj) y no crea nada más.
const userMethods = {
  set email(value) {
    this._email = value.trim().toLowerCase();
  },
  get email() {
    return this._email;
  },
};
const user = Object.create(userMethods);
user.email = '  Ana.Torres@Example.COM ';
console.log('user.email →', user.email); // 'ana.torres@example.com'
console.log('propias de user →', Object.keys(user)); // ['_email']: lo escribió el setter
console.log("¿'email' es propia? →", Object.hasOwn(user, 'email')); // false

// 2) Si encuentra una propiedad heredada de SOLO LECTURA, la asignación falla
//    (en silencio en un script clásico; TypeError en modo estricto).
const taxRules = {};
Object.defineProperty(taxRules, 'vatRate', { value: 0.21, enumerable: true });

const reducedInvoice = Object.create(taxRules);
reducedInvoice.vatRate = 0.1; // ⚠️ no crea la propia: el prototipo lo impide
console.log('reducedInvoice.vatRate →', reducedInvoice.vatRate); // 0.21
console.log("¿'vatRate' es propia? →", Object.hasOwn(reducedInvoice, 'vatRate')); // false

// defineProperty no consulta la cadena: crea la propiedad propia sin más.
Object.defineProperty(reducedInvoice, 'vatRate', {
  value: 0.1,
  writable: true,
  enumerable: true,
  configurable: true,
});
console.log('tras defineProperty →', reducedInvoice.vatRate); // 0.1
console.log('taxRules.vatRate →', taxRules.vatRate);          // 0.21: intacta

// > Desde Python: igual que una property de la clase, que gana al __dict__ de
//   la instancia: obj.email = x llama al setter de la clase en lugar de
//   guardar email en la instancia.
```
