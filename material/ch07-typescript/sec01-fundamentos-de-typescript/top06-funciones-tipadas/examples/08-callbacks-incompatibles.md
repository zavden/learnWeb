---
example_description: "strictFunctionTypes: un callback que necesita un tipo más concreto (Dish, con price) no se acepta donde pueden llegar valores más generales (Item); sin esa comprobación, revienta en ejecución. strictBindCallApply comprueba los argumentos de call"
example_tags: "typescript|strict|callbacks|strictfunctiontypes|call|ts2345|bug"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
type Item = { name: string };
type Dish = { name: string; price: number };

// forEachItem puede pasar al callback CUALQUIER Item, tenga price o no.
function forEachItem(items: Item[], callback: (item: Item) => void): void {
  items.forEach((item) => callback(item));
}

// Este callback necesita un Dish: usa price.
const printPrice = (dish: Dish): void => {
  console.log(`${dish.name}: $${dish.price.toFixed(2)}`);
};

const extras: Item[] = [{ name: 'Servilletas' }];
try {
  // 🐛 printPrice recibiría un Item sin price. strictFunctionTypes lo detecta:
  forEachItem(extras, printPrice); // ❌ Error TS2345 a propósito: el callback pide más de lo que recibe
} catch (error) {
  console.log('⛔', String(error));
}

// ✅ Al revés sí vale: un callback que pide MENOS (un Item) acepta un Dish.
const printName = (item: Item): void => console.log('✅', item.name);
const dishes: Dish[] = [{ name: 'Tlayuda', price: 120 }];
dishes.forEach(printName);

// strictBindCallApply: call, apply y bind comprueban los argumentos.
function stayLabel(guest: string, nights: number): string {
  return `${guest}: ${nights} noches`;
}
console.log('🐛', stayLabel.call(undefined, 'Ana', 'tres')); // ❌ Error TS2345 a propósito: 'tres' no es number
```
