---
example_description: "Desplazar desde JavaScript: scrollTo y scrollBy (instantáneos por defecto o con behavior: 'smooth', que es asíncrono y no cambia scrollTop en el momento) y scrollIntoView, que desplaza todos los contenedores necesarios, también la página"
example_tags: "javascript|dom|scroll|scrollto|scrollintoview|smooth"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<p class="controls">
  <button type="button" id="go-list">Capítulo 6 (scrollTo de la lista)</button>
  <button type="button" id="go-view">Capítulo 6 (scrollIntoView)</button>
</p>
<ol class="chapters" id="chapters" aria-label="Capítulos del recetario" tabindex="0">
  <li>El maíz</li>
  <li>Las tortillas</li>
  <li>Salsas</li>
  <li>Moles</li>
  <li>Tamales</li>
  <li id="chapter-6">Antojitos</li>
  <li>Postres</li>
  <li>Bebidas</li>
</ol>
<p class="spacer">Fin del índice.</p>
```

# CSS

```css
/* Los botones se quedan arriba aunque bajes la página (position: sticky). */
.controls {
  position: sticky;
  top: 0;
  margin: 0;
  z-index: 1; /* por encima de la lista, que también está posicionada */
  padding: 0.5rem 0;
  background: #ffffff;
}
.chapters {
  position: relative; /* offsetParent de los capítulos */
  height: 120px;
  margin: 0;
  padding: 0 0 0 2rem;
  overflow-y: auto;
  border: 2px solid #64748b;
  font-family: system-ui, sans-serif;
}
.chapters li {
  height: 40px;
  line-height: 40px;
}
.spacer {
  margin-bottom: 600px; /* la página también tiene scroll */
}
```

# JavaScript

```javascript
const chapters = document.querySelector('#chapters');
const chapter6 = document.querySelector('#chapter-6');

// scrollTo: a una posición; por defecto, instantáneo.
chapters.scrollTo({ top: 80 });
console.log('scrollTo({ top: 80 }) →', chapters.scrollTop);
// scrollBy: relativo a la posición actual.
chapters.scrollBy({ top: 40 });
console.log('scrollBy({ top: 40 }) →', chapters.scrollTop);

// behavior: 'smooth' anima el desplazamiento en los frames siguientes, así que
// justo después de pedirlo, scrollTop todavía no ha cambiado.
chapters.scrollTo({ top: 0, behavior: 'smooth' });
console.log("justo después de un scrollTo 'smooth' →", chapters.scrollTop);

// offsetTop del capítulo 6 dentro de la lista (5 capítulos × 40 px):
console.log('offsetTop del capítulo 6 →', chapter6.offsetTop);

// Los botones (los eventos se estudian en el módulo siguiente):
// 1. scrollTo del contenedor: solo se mueve la lista.
document.querySelector('#go-list').addEventListener('click', () => {
  chapters.scrollTo({ top: chapter6.offsetTop, behavior: 'smooth' });
});
// 2. scrollIntoView: mueve TODOS los contenedores con scroll hasta que el
//    elemento se vea, también la página si hace falta. block: 'nearest'
//    desplaza lo mínimo; 'start' lo alinea arriba.
document.querySelector('#go-view').addEventListener('click', () => {
  chapter6.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
// Prueba los dos con la lista arriba del todo; después baja la página hasta
// que la lista quede fuera de la vista y vuelve a pulsar el segundo.
```
