---
example_description: "Cada elemento trae un display de la hoja del navegador: div es block, span inline, li list-item, button inline-block, head none…"
example_tags: "css|display|user-agent|getComputedStyle"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="samples">
  <div>div</div>
  <p>p</p>
  <ul><li>li</li></ul>
  <span>span</span> <a href="#">a</a> <strong>strong</strong>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='20'%3E%3Crect width='48' height='20' fill='%2393c5fd'/%3E%3C/svg%3E" alt="img">
  <button type="button">button</button>
  <input type="text" value="input" size="6" aria-label="Campo de ejemplo">
  <table><tr><td>td</td></tr></table>
</div>
<table class="report">
  <thead><tr><th scope="col">Elemento</th><th scope="col">display (de la hoja del navegador)</th></tr></thead>
  <tbody></tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Nadie ha escrito ningún display: todos vienen de la hoja del navegador.
   El contorno rojo deja ver la forma de cada caja: las de bloque ocupan
   toda la fila; las de línea, solo lo que mide su contenido. */
.samples * {
  outline: 1px solid #dc2626;
}

.report {
  margin-top: 12px;
  font-size: 0.85rem;
}

.report td,
.report th {
  padding: 2px 8px;
  text-align: left;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Lee el display COMPUTADO de cada
// elemento de muestra (y de <head> y de un <script>) y lo escribe en la tabla.
const elements = [...document.querySelectorAll('.samples > *, .samples li, .samples td'), document.head, document.querySelector('script')].filter(Boolean);
const tbody = document.querySelector('.report tbody');

for (const element of elements) {
  const row = tbody.insertRow();
  row.insertCell().textContent = '<' + element.tagName.toLowerCase() + '>';
  row.insertCell().textContent = getComputedStyle(element).display;
}
```
