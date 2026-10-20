---
example_description: "Moverse por el árbol desde un elemento: parentElement hacia arriba, firstElementChild y lastElementChild hacia abajo, previousElementSibling y nextElementSibling a los lados; null cuando no hay nada en esa dirección"
example_tags: "javascript|dom|parentelement|nextelementsibling|hermanos|navegar"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<article id="recipe">
  <h2>Cochinita pibil</h2>
  <ol class="steps">
    <li>Marinar el cerdo con achiote</li>
    <li id="wrap">Envolver en hojas de plátano</li>
    <li>Hornear 4 horas</li>
  </ol>
</article>
```

# JavaScript

```javascript
const step = document.querySelector('#wrap');

// Arriba: el padre (y el padre del padre…)
console.log('parentElement →', step.parentElement);
console.log('dos niveles arriba →', step.parentElement.parentElement.id);

// A los lados: los hermanos ELEMENTO (se saltan el texto en blanco)
console.log('previousElementSibling →', step.previousElementSibling);
console.log('nextElementSibling →', step.nextElementSibling);

// Abajo, desde la lista:
const steps = step.parentElement;
console.log('firstElementChild →', steps.firstElementChild.textContent);
console.log('lastElementChild →', steps.lastElementChild.textContent);
console.log('childElementCount →', steps.childElementCount);

// Cuando no hay nada en esa dirección, el resultado es null:
console.log('después del último paso →', steps.lastElementChild.nextElementSibling);
console.log('firstElementChild de un <li> con solo texto →', step.firstElementChild);

// contains: ¿este nodo está dentro de aquel (a cualquier profundidad)?
console.log('¿#recipe contiene el paso? →', document.querySelector('#recipe').contains(step));

// La cima: <html> tiene un nodo padre (document), pero no un ELEMENTO padre.
console.log('html.parentNode →', document.documentElement.parentNode);
console.log('html.parentElement →', document.documentElement.parentElement);
```
