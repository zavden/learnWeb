---
example_description: "El esquema de la página lo forman los h1–h6, no section ni article: anidar secciones no rebaja el nivel de un h1, así que hay que elegir el nivel a mano"
example_tags: "html|semantica|titulos|esquema|accesibilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<div id="bad">
  <h1>Huerta urbana</h1>
  <section><h1>Tomates</h1><section><h1>Riego</h1></section></section>
  <h4>Contacto</h4>
</div>

<div id="good">
  <h1>Huerta urbana</h1>
  <section><h2>Tomates</h2><section><h3>Riego</h3></section></section>
  <h2>Contacto</h2>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h1, h2, h3, h4 {
  margin: 4px 0;
}

#bad, #good {
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  margin-bottom: 10px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este es el «índice» que un lector de pantalla
// muestra al navegar por títulos: el nivel de cada uno es el número de su etiqueta, nada más.
for (const id of ['bad', 'good']) {
  console.group(`#${id}`);
  for (const heading of document.querySelectorAll(`#${id} :is(h1, h2, h3, h4, h5, h6)`)) {
    const level = Number(heading.tagName[1]);
    console.log(`${'  '.repeat(level - 1)}${heading.tagName} ${heading.textContent}`);
  }
  console.groupEnd();
}
// 🐛 #bad: tres h1 al mismo nivel y un salto de h1 a h4. El «algoritmo de esquema» que haría
// que un h1 dentro de una section valiera como h2 se propuso, pero ningún navegador lo implementó.
```
