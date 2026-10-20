---
example_description: "getComputedStyle muestra cómo 1.5em, 50% o tomato se convierten en píxeles y rgb(), y que se hereda el valor computado"
example_tags: "css|valores|computado|getComputedStyle"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<div class="box">
  <p class="text">Texto a 1.5em, con <span class="inner">un span dentro</span>.</p>
</div>
<p>Abre la consola: cada línea compara lo que escribiste con lo que calcula el navegador.
  Cambia el ancho de la vista previa y vuelve a ejecutar: el valor de <code>width</code> cambia.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.box {
  width: 50%;
  font-size: 20px;
  background: #f1f5f9;
}

.text {
  font-size: 1.5em;     /* 1.5 × 20px del padre = 30px */
  padding: 0.5em;       /* em en padding: relativo a la fuente del PROPIO elemento → 15px */
  color: tomato;
  margin: 0;
}
```

# JavaScript

```javascript
// Adelanto: esto se explica en el capítulo de JavaScript.
// getComputedStyle(elemento) devuelve los valores ya resueltos que usa el navegador.
const box = document.querySelector('.box');
const text = document.querySelector('.text');
const inner = document.querySelector('.inner');

console.log('font-size  escrito: 1.5em  → computado:', getComputedStyle(text).fontSize);
console.log('padding    escrito: 0.5em  → computado:', getComputedStyle(text).paddingTop);
console.log('color      escrito: tomato → computado:', getComputedStyle(text).color);
console.log('width      escrito: 50%    → usado:', getComputedStyle(box).width);

// El span no declara font-size: lo hereda. Si se heredara el TEXTO «1.5em», mediría
// 1.5 × 30px = 45px. Pero se hereda el valor COMPUTADO: 30px.
console.log('font-size heredado por el span →', getComputedStyle(inner).fontSize);
```
