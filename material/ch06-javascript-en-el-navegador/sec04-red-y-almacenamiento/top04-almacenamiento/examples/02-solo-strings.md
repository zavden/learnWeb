---
example_description: "localStorage solo guarda texto: un objeto se convierte en «[object Object]», un número vuelve como string (2 + 1 = '21'), false vuelve como 'false', que es truthy, y null como 'null'. Con JSON.stringify/parse los tipos sobreviven"
example_tags: "javascript|localstorage|strings|json|truthy|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const prefix = 'lw-almacen-tipos-';

// 🐛 setItem convierte el valor con String(valor) antes de guardarlo.
localStorage.setItem(`${prefix}carrito`, { sku: 'CAF-500', quantity: 2 });
console.log('🐛 objeto →', localStorage.getItem(`${prefix}carrito`));

localStorage.setItem(`${prefix}cantidad`, 2);
const quantity = localStorage.getItem(`${prefix}cantidad`);
console.log('🐛 número →', JSON.stringify(quantity), '| cantidad + 1 →', quantity + 1);

localStorage.setItem(`${prefix}boletin`, false);
const wantsNewsletter = localStorage.getItem(`${prefix}boletin`);
console.log('🐛 false →', JSON.stringify(wantsNewsletter), '| if (boletin) →', wantsNewsletter ? 'se envía el boletín 😱' : 'no se envía');

localStorage.setItem(`${prefix}cupon`, null);
console.log('🐛 null →', JSON.stringify(localStorage.getItem(`${prefix}cupon`)), '| ¿hay cupón? →', localStorage.getItem(`${prefix}cupon`) !== null);

localStorage.setItem(`${prefix}tallas`, ['S', 'M']);
console.log('🐛 array →', JSON.stringify(localStorage.getItem(`${prefix}tallas`)));

// ✅ Guarda JSON (texto) y analízalo al leer: los tipos vuelven.
localStorage.setItem(`${prefix}carrito`, JSON.stringify({ sku: 'CAF-500', quantity: 2 }));
localStorage.setItem(`${prefix}boletin`, JSON.stringify(false));
const cart = JSON.parse(localStorage.getItem(`${prefix}carrito`));
const newsletter = JSON.parse(localStorage.getItem(`${prefix}boletin`));
console.log('✅ objeto →', cart, '| quantity + 1 →', cart.quantity + 1);
console.log('✅ boolean →', newsletter, '| if (boletin) →', newsletter ? 'se envía' : 'no se envía');

// Limpieza: este ejemplo no deja nada en el origen compartido.
for (const key of Object.keys(localStorage)) {
  if (key.startsWith(prefix)) localStorage.removeItem(key);
}
console.log('claves que quedan →', Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length);

// > Desde Python: es como un dbm o un shelve que solo aceptara str. Para
//   guardar estructuras, json.dumps al escribir y json.loads al leer.
```
