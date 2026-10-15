---
example_description: "La sublista escrita entre dos li se ve igual, pero ya no pertenece a ningún elemento"
example_tags: "html|listas|anidamiento|li|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Error muy frecuente: la sublista se escribe DESPUÉS del li, como hermana suya,
     en lugar de dentro. En pantalla se ve casi igual (sangrada, con círculos), pero un
     ul no puede ser hijo de otro ul: la sublista ya no pertenece a «Ropa». -->
<h2>❌ Sublista entre dos li</h2>
<ul id="broken">
  <li>Ropa</li>
  <ul>
    <li>Forro polar</li>
    <li>Chubasquero</li>
  </ul>
  <li>Comida</li>
</ul>

<!-- ✅ La sublista va dentro del li, antes de su </li> -->
<h2>✅ Sublista dentro del li</h2>
<ul id="fixed">
  <li>Ropa
    <ul>
      <li>Forro polar</li>
      <li>Chubasquero</li>
    </ul>
  </li>
  <li>Comida</li>
</ul>
```

# JavaScript

```javascript
// contains() responde si un elemento está dentro de otro.
// (Array.from con una función y join se explican en el capítulo de JavaScript.)
for (const list of document.querySelectorAll('#broken, #fixed')) {
  const children = Array.from(list.children, (child) => child.tagName.toLowerCase()).join(', ');
  const clothes = list.querySelector('li'); // el primer li: «Ropa»
  const sublist = list.querySelector('ul');
  console.log(`#${list.id}`.padEnd(8), '→ hijos:', children, '| ¿«Ropa» contiene su sublista?', clothes.contains(sublist));
}
```
