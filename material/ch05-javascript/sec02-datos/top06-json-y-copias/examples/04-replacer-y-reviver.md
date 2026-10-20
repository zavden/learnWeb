---
example_description: "El replacer filtra o transforma al serializar, el reviver reconstruye al leer y toJSON decide cómo se serializa un objeto"
example_tags: "javascript|json|replacer|reviver|toJSON"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
const user = { id: 7, name: 'Marta', password: 's3cr3t', createdAt: new Date(Date.UTC(2026, 0, 15)) };

// Replacer como array: lista blanca de claves a incluir.
console.log(JSON.stringify(user, ['id', 'name']));   // {"id":7,"name":"Marta"}

// Replacer como función (key, value): devuelve el valor a escribir, o undefined para omitirlo.
// Las funciones flecha se estudian en el módulo 3.
const safe = JSON.stringify(user, (key, value) => (key === 'password' ? undefined : value));
console.log(safe);

// Reviver (key, value): se llama al parsear, de dentro hacia fuera. Ideal para reconstruir fechas.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;   // expresión regular: patrón de texto
const restored = JSON.parse(safe, (key, value) =>
  typeof value === 'string' && ISO_DATE.test(value) ? new Date(value) : value);
console.log('createdAt es Date →', restored.createdAt instanceof Date);   // true
console.log('año →', restored.createdAt.getUTCFullYear());

// toJSON: un objeto puede decidir su propia representación.
const money = { cents: 1999, currency: 'EUR', toJSON() { return `${this.cents / 100} ${this.currency}`; } };
console.log(JSON.stringify({ price: money }));   // {"price":"19.99 EUR"}
```
