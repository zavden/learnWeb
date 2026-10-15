---
example_description: "DOM frente a árbol de render: display:none está en el DOM; ::before se dibuja sin estar en él"
example_tags: "render-tree|dom|display-none|pseudoelementos"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<p class="note">Lee esto con atención.</p>
<p class="secret">Este párrafo está en el DOM, pero no en el árbol de render.</p>
<p>Fin.</p>
```

# CSS

```css
/* ::before añade una caja de texto que se DIBUJA pero no existe en el DOM
   (los pseudoelementos se estudian en el capítulo 3) */
.note::before {
  content: "⚠️ Nota: ";
  font-weight: bold;
}

/* display: none saca el elemento del árbol de render: no ocupa sitio ni se dibuja */
.secret {
  display: none;
}
```

# JavaScript

```javascript
// El DOM no sabe nada del «⚠️ Nota:»: solo existe en el árbol de render
console.log('texto de .note en el DOM →', document.querySelector('.note').textContent);

// .secret sí está en el DOM… pero no tiene caja: mide 0 px de alto
const secret = document.querySelector('.secret');
console.log('.secret en el DOM →', secret.textContent);
console.log('.secret alto en pantalla →', secret.offsetHeight, 'px');
```
