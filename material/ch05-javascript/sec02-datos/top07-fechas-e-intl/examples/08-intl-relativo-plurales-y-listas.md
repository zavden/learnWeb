---
example_description: "RelativeTimeFormat («hace 3 días»), PluralRules (singular o plural) y ListFormat («Ana, Luis y Marta») sin escribir reglas a mano"
example_tags: "javascript|intl|plurales|listas|tiempo-relativo"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// Tiempo relativo: el número y la unidad; Intl elige las palabras.
const relative = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
console.log(relative.format(-3, 'day'));    // hace 3 días
console.log(relative.format(-1, 'day'));    // ayer (gracias a numeric: 'auto')
console.log(relative.format(2, 'week'));    // dentro de 2 semanas

// Plurales: qué categoría usa cada idioma para un número.
const plural = new Intl.PluralRules('es-ES');
const nouns = { one: 'comentario', other: 'comentarios' };
for (const count of [0, 1, 2]) {
  console.log(`${count} ${nouns[plural.select(count)]}`);
}
// Otros idiomas tienen más categorías (el árabe, seis); por eso no basta con «if (n === 1)».
console.log('categorías en árabe →', new Intl.PluralRules('ar').resolvedOptions().pluralCategories);

// Listas con la conjunción correcta del idioma.
const people = ['Ana', 'Luis', 'Marta'];
console.log(new Intl.ListFormat('es-ES', { type: 'conjunction' }).format(people));   // Ana, Luis y Marta
console.log(new Intl.ListFormat('es-ES', { type: 'disjunction' }).format(people));   // Ana, Luis o Marta
console.log(new Intl.ListFormat('en-US', { type: 'conjunction' }).format(people));   // Ana, Luis, and Marta
```
