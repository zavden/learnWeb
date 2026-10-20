---
example_description: "Para usar un template se clona su contenido con template.content.cloneNode(true) y se inserta: así una misma plantilla genera muchas copias"
example_tags: "html|template|clonenode|dom|repetir"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<h1>Parcelas libres del huerto</h1>

<!-- La plantilla de UNA tarjeta, escrita una sola vez -->
<template id="plot-card">
  <li class="card">
    <h2 class="name">Nombre</h2>
    <p class="size">Tamaño</p>
  </li>
</template>

<ul id="plots"></ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
}

h1 {
  font-size: 1.3rem;
}

#plots {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  border: 1px solid #64748b;
  border-radius: 8px;
  padding: .75rem 1rem;
}

.card h2 {
  margin: 0 0 .25rem;
  font-size: 1rem;
}

.card p {
  margin: 0;
  color: #334155;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const tpl = document.getElementById('plot-card');
const list = document.getElementById('plots');

const plots = [
  { name: 'A-12', size: '4 m²' },
  { name: 'B-03', size: '6 m²' },
  { name: 'C-21', size: '4 m²' },
];

for (const plot of plots) {
  // cloneNode(true) copia la plantilla ENTERA (true = con sus hijos); el original intacto
  const copy = tpl.content.cloneNode(true);
  copy.querySelector('.name').textContent = `Parcela ${plot.name}`;
  copy.querySelector('.size').textContent = plot.size;
  list.append(copy);
}

console.log('tarjetas dibujadas →', list.children.length);
console.log('la plantilla sigue intacta →', tpl.content.childElementCount, 'nodo(s)');
```
