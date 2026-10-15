---
example_description: "Propiedades opcionales con ?: pueden faltar al crear el objeto, y al leerlas su tipo incluye undefined (TS18048); una propiedad obligatoria que falta es TS2741. ?? da el valor por defecto"
example_tags: "typescript|objetos|opcionales|undefined|ts2741|ts18048"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Dish = {
  name: string;
  price: number;
  spicy?: boolean; // opcional: puede no estar
  discountPercent?: number; // al leerla, su tipo es number | undefined
};

const tlayuda: Dish = { name: 'Tlayuda', price: 120 }; // ✅ sin las opcionales
const tasajo: Dish = { name: 'Tasajo', price: 180, discountPercent: 10 };
const mole: Dish = { name: 'Mole negro' }; // ❌ Error TS2741 a propósito: falta price

// 🐛 Usar una opcional como si siempre estuviera:
function finalPrice(dish: Dish): number {
  return dish.price * (1 - dish.discountPercent / 100); // ❌ Error TS18048 a propósito: puede ser undefined
}
console.log('🐛 tlayuda →', finalPrice(tlayuda)); // undefined / 100 → NaN

// ✅ Decide qué significa «no está»: aquí, sin descuento.
function finalPriceFixed(dish: Dish): number {
  const discount = dish.discountPercent ?? 0;
  return dish.price * (1 - discount / 100);
}
console.log('✅ tlayuda →', finalPriceFixed(tlayuda), '| tasajo →', finalPriceFixed(tasajo));
console.log('¿picante? →', tlayuda.spicy ?? false);
console.log('mole →', mole); // el objeto incompleto se creó igual
```
