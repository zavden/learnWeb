---
example_description: "@for $i from 1 to 5 llega solo hasta 4 (como range de Python); through 5 incluye el 5. Con to falta la clase .span-5 y la fila no ocupa todo el ancho"
example_tags: "sass|control-de-flujo|for|grid|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p>❌ Con <code>to</code> (rejilla de 5 columnas, clases <code>.a-span-*</code>):</p>
<div class="grid">
  <div class="a-span-2">span-2</div><div class="a-span-3">span-3</div>
  <div class="a-span-5">span-5: debería ocupar toda la fila</div>
</div>
<p>✅ Con <code>through</code> (clases <code>.b-span-*</code>):</p>
<div class="grid">
  <div class="b-span-2">span-2</div><div class="b-span-3">span-3</div>
  <div class="b-span-5">span-5: ocupa toda la fila</div>
</div>
```

# SCSS

```scss
$columns: 5;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.grid {
  display: grid;
  grid-template-columns: repeat($columns, 1fr);
  gap: 6px;
  max-width: 30rem;

  div {
    padding: 8px;
    border-radius: 4px;
    background: #e0e7ff;
    font-size: 0.8rem;
  }
}

// 🐛 «from 1 to 5» se detiene ANTES del 5: genera 1, 2, 3, 4.
//    Es como range(1, 5) de Python. No existe .a-span-5 → ocupa 1 columna.
@for $i from 1 to $columns {
  .a-span-#{$i} {
    grid-column: span $i;
  }
}

// ✅ «from 1 through 5» INCLUYE el 5: genera 1, 2, 3, 4, 5.
//    Como range(1, 6) de Python.
@for $i from 1 through $columns {
  .b-span-#{$i} {
    grid-column: span $i;
  }
}

// Truco para recordarlo: «through» = «hasta e incluyendo» (de 1 a 5, ambos).
// En compiled.css: 4 reglas .a-span-* frente a 5 reglas .b-span-*.
```
