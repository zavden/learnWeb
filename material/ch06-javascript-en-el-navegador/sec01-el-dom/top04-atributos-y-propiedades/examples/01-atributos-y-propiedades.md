---
example_description: "Los atributos son el texto del HTML (getAttribute, setAttribute, hasAttribute, removeAttribute); las propiedades, el objeto de JavaScript. Para los atributos estándar, el navegador las mantiene sincronizadas (id, className ↔ class, htmlFor ↔ for); los inventados no tienen propiedad"
example_tags: "javascript|dom|atributos|propiedades|getattribute|setattribute"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<p>
  <label for="servings">Raciones</label>
  <input id="servings" type="number" min="1" value="4">
</p>
<a href="/recetas/mole-poblano" class="recipe-link" sku="REC-118">Ver la receta</a>
```

# JavaScript

```javascript
const link = document.querySelector('.recipe-link');

// ATRIBUTOS: el texto escrito en el HTML. Siempre strings (o null si no está).
console.log("getAttribute('class') →", link.getAttribute('class'));
console.log("getAttribute('target') →", link.getAttribute('target'));
console.log("hasAttribute('target') →", link.hasAttribute('target'));
link.setAttribute('title', 'Receta completa con fotos');
console.log('con title →', link);
link.removeAttribute('title');
console.log('getAttributeNames() →', link.getAttributeNames());
// En HTML, los nombres de atributo no distinguen mayúsculas:
console.log("getAttribute('HREF') →", link.getAttribute('HREF'));

// PROPIEDADES: el objeto JS. Las de los atributos estándar están sincronizadas
// con ellos («reflejadas»): cambiar una cambia el otro.
link.id = 'main-recipe';
console.log("tras link.id = … → getAttribute('id'):", link.getAttribute('id'));
// Dos nombres distintos, porque class y for eran palabras reservadas:
link.className = 'recipe-link featured';
console.log("tras className = … → getAttribute('class'):", link.getAttribute('class'));
const label = document.querySelector('label');
console.log("label.htmlFor →", label.htmlFor, "| getAttribute('for') →", label.getAttribute('for'));

// Un atributo inventado no tiene propiedad (y no es HTML válido): usa data-*.
console.log('link.sku →', link.sku, "| getAttribute('sku') →", link.getAttribute('sku'));
```
