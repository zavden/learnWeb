---
example_description: "Anidar elementos forma un árbol: lo que se abre dentro se cierra dentro"
example_tags: "html|anidamiento|arbol|dom"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Los elementos se anidan como cajas dentro de cajas: el último que se abre es
     el primero que se cierra. El resultado es un árbol:

       p
       ├── "Texto normal, "
       ├── em
       │   ├── "texto con énfasis y "
       │   └── strong
       │       └── "además importante"
       └── "."                                                          -->
<p>Texto normal, <em>texto con énfasis y <strong>además importante</strong></em>.</p>

<!-- Lo de dentro hereda de lo de fuera: el strong está DENTRO del em,
     así que sale en cursiva (del em) y en negrita (del strong) a la vez. -->
```

# JavaScript

```javascript
// Subimos desde <strong> de padre en padre hasta la raíz del documento.
// parentElement y el bucle while se explican en los capítulos de JavaScript.
let element = document.querySelector('strong');
const path = [];
while (element) {
  path.push(element.tagName.toLowerCase());
  element = element.parentElement;
}
console.log('camino hasta la raíz →', path.join(' → '));
```
