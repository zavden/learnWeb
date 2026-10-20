---
example_description: "readonly solo existe para el verificador (TS2540): en ejecución la propiedad se cambia sin queja. Un getter sin setter y Object.freeze sí protegen en ejecución (TypeError en modo estricto)"
example_tags: "typescript|clases|readonly|getter|object-freeze|ts2540|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
class Ticket {
  readonly museum: string;
  readonly price: number;

  constructor(museum: string, price: number) {
    this.museum = museum; // dentro del constructor sí se puede asignar
    this.price = price;
  }

  get label(): string { // solo get: una propiedad de solo lectura también en ejecución
    return `${this.museum} · $${this.price}`;
  }
}

class FrozenTicket extends Ticket {
  constructor(museum: string, price: number) {
    super(museum, price);
    Object.freeze(this); // capítulo 5: congelado de verdad, en ejecución
  }
}

const ticket = new Ticket('MUNAL', 90);
ticket.price = 0; // ❌ Error TS2540 a propósito: readonly… pero en ejecución, cambia
console.log('🐛 readonly →', ticket.label);

try {
  ticket.label = 'MUNAL · gratis'; // ❌ Error TS2540 a propósito: label solo tiene get
} catch (error) {
  console.log('✅ getter →', String(error));
}

const frozen = new FrozenTicket('Museo Amparo', 85);
try {
  frozen.price = 0; // ❌ Error TS2540 a propósito: y además está congelado
} catch (error) {
  console.log('✅ freeze →', String(error));
}
console.log('precio →', frozen.price);
```
