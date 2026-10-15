---
example_description: "El patrón módulo con clases: una IIFE guarda constantes, funciones auxiliares y estado compartido en un closure y devuelve solo la clase pública; lo que los módulos ES harán con import/export"
example_tags: "javascript|python|patrones|modulo|iife|closures|clases"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un «módulo» de pedidos: todo lo de dentro de la IIFE es privado del módulo.
const Order = (() => {
  // ── privado del módulo: compartido por TODOS los pedidos ──────────────
  const VAT_RATE = 0.16; // IVA en México
  let nextNumber = 1001;

  function roundCents(value) {
    return Math.round(value);
  }
  function formatMoney(cents) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);
  }

  // ── público: lo único que sale del módulo ─────────────────────────────
  return class Order {
    #lines = []; // privado de CADA pedido

    constructor(customer) {
      this.number = nextNumber++;
      this.customer = customer;
    }

    add(name, unitCents, quantity = 1) {
      this.#lines.push({ name, unitCents, quantity });
      return this;
    }

    get totalCents() {
      const net = this.#lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0);
      return roundCents(net * (1 + VAT_RATE));
    }

    toString() {
      return `Pedido ${this.number} de ${this.customer}: ${formatMoney(this.totalCents)} (IVA incluido)`;
    }
  };
})();

const first = new Order('Mariana Gómez').add('Café de Chiapas 500 g', 21000, 2);
const second = new Order('Iker Salas').add('Prensa francesa', 54900);
console.log(`${first}`);
console.log(`${second}`);

// Desde fuera solo existe la clase:
console.log('typeof VAT_RATE →', typeof VAT_RATE, '| typeof formatMoney →', typeof formatMoney);
console.log('Order.name →', Order.name);

// Dos niveles de privacidad:
//   closure del módulo → compartido por todos los pedidos (nextNumber, VAT_RATE, helpers)
//   #lines             → de cada pedido
// En el módulo «Módulos y organización» harás lo mismo con un archivo:
//   export class Order { … } — lo que no se exporta queda privado del archivo.

// > Desde Python: un módulo .py con funciones _privadas y una clase pública.
//   Python no tiene IIFE porque cada archivo ya es un módulo.
```
