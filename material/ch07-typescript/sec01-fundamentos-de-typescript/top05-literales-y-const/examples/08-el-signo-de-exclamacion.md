---
example_description: "El operador ! (non-null assertion) quita null y undefined del tipo sin comprobar nada: find(…)! compila sin errores y lanza un TypeError cuando no encuentra el elemento. Comprobar y lanzar un error con sentido es más seguro"
example_tags: "typescript|non-null-assertion|aserciones|undefined|find|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Dish = { id: string; name: string; price: number };

const menu: Dish[] = [
  { id: 'tla', name: 'Tlayuda', price: 120 },
  { id: 'mol', name: 'Mole negro', price: 165 },
];

// 🐛 find devuelve Dish | undefined. El ! dice «seguro que lo encuentra» y
//    quita el undefined del tipo… sin comprobar nada en ejecución.
function priceOf(id: string): number {
  return menu.find((dish) => dish.id === id)!.price;
}

console.log('tla →', priceOf('tla'));
try {
  console.log('pozole →', priceOf('pozole')); // no está en el menú
} catch (error) {
  console.log('⛔', String(error)); // un mensaje que no dice qué faltaba
}

// ✅ Comprueba y falla con un mensaje útil (o devuelve undefined y que
//    decida quien llama: el tipo de retorno lo obligará a comprobarlo).
function priceOfSafe(id: string): number {
  const dish = menu.find((item) => item.id === id);
  if (!dish) throw new Error(`No hay ningún platillo con id «${id}»`);
  return dish.price;
}

try {
  priceOfSafe('pozole');
} catch (error) {
  console.log('✅', String(error));
}
```
