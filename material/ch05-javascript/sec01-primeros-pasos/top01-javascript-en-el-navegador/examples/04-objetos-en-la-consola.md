---
example_description: "Objetos y arrays expandibles en la consola, hasta [[Prototype]], y el «[object Object]» al concatenar"
example_tags: "javascript|consola|objetos|prototype"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un objeto (parecido a un dict de Python) y un array (parecido a una list).
// Los estudiarás a fondo en el módulo «Números, texto y colecciones».
const user = { name: 'Ada', age: 36, languages: ['es', 'en'] };
const scores = [7, 9.5, 10];

// Haz clic en el triángulo ▶ para expandirlos y ver cada propiedad.
console.log('user →', user);
console.log('scores →', scores);

// Al final de un objeto expandido aparece [[Prototype]]: el objeto del que
// hereda sus métodos. Lo usarás mucho en «Objetos y prototipos».

// console.dir muestra el objeto directamente como árbol de propiedades.
console.dir(user);

// 🐛 Si lo pegas a un string con + se convierte en texto y pierdes el árbol:
console.log('user → ' + user);     // "user → [object Object]"
console.log('scores → ' + scores); // "scores → 7,9.5,10"

// ✅ Pásalo como argumento separado (con coma), como en las primeras líneas.
```
