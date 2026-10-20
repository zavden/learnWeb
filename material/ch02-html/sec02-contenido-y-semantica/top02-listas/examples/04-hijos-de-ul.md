---
example_description: "Dentro de ul solo puede ir li: lo demás se queda dentro, sin viñeta y fuera de la cuenta"
example_tags: "html|listas|ul|li|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Dentro de un ul o un ol solo pueden ir li. Aquí se colaron un párrafo y un
     texto suelto. El parser NO lo arregla (a diferencia de las tablas): lo deja ahí.
     Sale sin viñeta, mal alineado, y no cuenta como elemento de la lista. -->
<h2>❌ Horario de la piscina</h2>
<ul id="broken">
  <li>Lunes a viernes: de 7:00 a 22:00</li>
  <p>Cerrado los días festivos.</p>
  <li>Sábados: de 9:00 a 20:00</li>
  Domingos: cerrado
</ul>

<!-- ✅ Cada elemento de la lista, en su li; lo que no es un elemento, fuera -->
<h2>✅ Horario de la piscina</h2>
<ul id="fixed">
  <li>Lunes a viernes: de 7:00 a 22:00</li>
  <li>Sábados: de 9:00 a 20:00</li>
  <li>Domingos: cerrado</li>
</ul>
<p>Cerrado los días festivos.</p>
```

# JavaScript

```javascript
// Un lector de pantalla anuncia «lista, N elementos» contando solo los li.
// En #broken ves cuatro líneas, pero la lista dice tener dos.
// (Array.from con una función y join se explican en el capítulo de JavaScript.)
for (const list of document.querySelectorAll('ul')) {
  const children = Array.from(list.children, (child) => child.tagName.toLowerCase()).join(', ');
  const items = list.querySelectorAll('li').length;
  console.log(`#${list.id}`.padEnd(8), '→ hijos:', children, '| elementos de lista:', items);
}
```
