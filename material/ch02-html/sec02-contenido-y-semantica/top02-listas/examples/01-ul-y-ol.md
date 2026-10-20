---
example_description: "ul cuando el orden no importa, ol cuando sí; cada elemento es un li"
example_tags: "html|listas|ul|ol|li"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- ul (unordered list): el orden NO importa. Cada elemento de la lista es un li. -->
<h2>Lista de la compra</h2>
<ul>
  <li>Huevos</li>
  <li>Patatas</li>
  <li>Cebolla</li>
  <li>Aceite de oliva</li>
</ul>

<!-- ol (ordered list): el orden SÍ importa. Los números los pone el navegador:
     si cambias un paso de sitio, la numeración se rehace sola. -->
<h2>Tortilla de patatas</h2>
<ol>
  <li>Pela las patatas y la cebolla y córtalas en láminas finas.</li>
  <li>Fríelas a fuego medio hasta que estén tiernas.</li>
  <li>Bate los huevos y mézclalos con las patatas escurridas.</li>
  <li>Cuaja la tortilla por los dos lados.</li>
</ol>
```

# JavaScript

```javascript
// Las viñetas y los números NO están en el texto: los dibuja el navegador porque
// cada li tiene display: list-item (el CSS lo explica en el capítulo 3).
const firstStep = document.querySelector('ol li');
console.log('texto del primer paso →', firstStep.textContent);
console.log('display de un li      →', getComputedStyle(firstStep).display);
console.log('pasos de la receta    →', document.querySelectorAll('ol li').length);
```
