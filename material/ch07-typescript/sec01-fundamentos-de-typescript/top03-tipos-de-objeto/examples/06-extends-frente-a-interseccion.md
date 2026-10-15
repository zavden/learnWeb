---
example_description: "extends comprueba que la interfaz nueva es compatible con la base y avisa en la declaración (TS2430); & no comprueba nada: si una propiedad choca, su tipo pasa a ser never y el error sale lejos, al crear el objeto"
example_tags: "typescript|interface|extends|interseccion|never|ts2430"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
interface Product {
  sku: string;
  price: number;
}

// extends comprueba la compatibilidad: price no puede pasar de number a string.
interface GiftCard extends Product { // ❌ Error TS2430 a propósito: price choca con el de Product
  price: string;
}

// 🐛 & combina sin comprobar: price debe ser number Y string a la vez, algo
//    imposible, así que su tipo es never. La declaración no da ningún error…
type Voucher = Product & { price: string };

// …y el error aparece más tarde, al usar el tipo, con un mensaje desconcertante:
const voucher: Voucher = { sku: 'VALE-500', price: '500' }; // ❌ Error TS2322 a propósito: price es never

console.log('voucher →', voucher);
// ✅ Para ampliar tipos de objeto, prefiere interface + extends: los choques se
//    detectan en la declaración, con un mensaje que explica cuál es el problema.
```
