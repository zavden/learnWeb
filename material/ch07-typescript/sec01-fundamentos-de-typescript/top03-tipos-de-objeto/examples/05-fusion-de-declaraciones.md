---
example_description: "Dos interface con el mismo nombre se fusionan en una (declaration merging) y el objeto necesita las propiedades de ambas (TS2741); repetir un type es un error de identificador duplicado (TS2300)"
example_tags: "typescript|interface|type|declaration-merging|ts2741|ts2300"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
interface Booking {
  guest: string;
  nights: number;
}

// …muchas líneas después (o en otro archivo), alguien vuelve a declararla:
interface Booking {
  breakfast: boolean;
}

// 🐛 No es un error: las dos declaraciones se FUSIONAN en una sola Booking
//    con tres propiedades. El objeto de dos propiedades ya no encaja.
const stay: Booking = { guest: 'Carmen Vidal', nights: 2 }; // ❌ Error TS2741 a propósito: falta breakfast

const fullStay: Booking = { guest: 'Diego Ríos', nights: 1, breakfast: true }; // ✅

// Con type no hay fusión: repetir el nombre es un error (en las dos líneas).
type Room = { number: number }; // ❌ Error TS2300 a propósito: identificador duplicado
type Room = { floor: number }; // ❌ Error TS2300 a propósito: identificador duplicado

console.log('stay →', stay);
console.log('fullStay →', fullStay);
// La fusión existe para AMPLIAR tipos ya declarados (por ejemplo, los de una
// biblioteca); en tu propio código, un nombre repetido suele ser un descuido.
```
