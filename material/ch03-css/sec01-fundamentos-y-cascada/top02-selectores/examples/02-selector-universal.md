---
example_description: "El selector universal * coincide con todos los elementos; con un contorno se ve cada caja de la página"
example_tags: "css|selectores|universal|depuracion"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<section class="card">
  <h2>Una tarjeta</h2>
  <p>Texto con <strong>negrita</strong> y <em>cursiva</em>: todos tienen fondo azul claro.</p>
</section>
<p>Fuera de la tarjeta: tengo contorno (me lo pone <code>*</code>), pero no fondo (no estoy dentro de <code>.card</code>).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* * (selector universal) coincide con TODOS los elementos, también <body>.
   Truco de depuración: un contorno en cada caja para ver la estructura de la página.
   Fíjate en el contorno del body: queda a 8px del borde por su margen por defecto. */
* {
  outline: 1px dashed #e11d48;
}

/* Combinado con otro selector: «todos los descendientes de .card», sean del tipo que sean */
.card * {
  background: #e0f2fe;
}
```
