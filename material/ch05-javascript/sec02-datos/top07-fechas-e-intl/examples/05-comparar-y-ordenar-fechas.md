---
example_description: "< y > comparan fechas bien, pero === compara objetos: dos Date del mismo instante no son iguales. Compara getTime()"
example_tags: "javascript|date|comparar|ordenar|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const a = new Date(Date.UTC(2026, 4, 1));
const b = new Date(Date.UTC(2026, 4, 1));
const later = new Date(Date.UTC(2026, 5, 1));

// < y > convierten los Date en números (valueOf → getTime): funcionan.
console.log('a < later →', a < later);   // true

// 🐛 === compara la identidad de los objetos, no el instante.
console.log('a === b →', a === b);       // false
console.log('a == b →', a == b);         // false también

// ✅ Compara los números.
console.log('a.getTime() === b.getTime() →', a.getTime() === b.getTime());   // true

// Ordenar: restar dos fechas da un número, perfecto para sort.
// (Las funciones flecha se estudian en el módulo 3.)
const events = [later, a, new Date(Date.UTC(2026, 0, 15))];
const sorted = events.toSorted((x, y) => x - y);
console.log('ordenadas →', sorted.map((date) => date.toISOString().slice(0, 10)));
```
