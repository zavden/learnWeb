---
example_description: "Tu primer SCSS: variables y anidamiento que Sass convierte en CSS normal antes de que llegue al navegador"
example_tags: "sass|scss|variables|anidamiento|compilar"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="card">
  <h2>Kit de riego por goteo</h2>
  <p>Doce goteros regulables, programador solar y 20 metros de tubo. Riega un huerto de 10 m² con menos de la mitad de agua.</p>
  <a href="/tienda/kit-riego-goteo">Ver el kit</a>
</article>
```

# SCSS

```scss
// Esto es SCSS, no CSS. El navegador nunca lo ve: Sass lo convierte en CSS
// y la página recibe solo ese CSS (míralo en la pestaña compiled.css).

// Variables: un nombre para cada valor que se repite.
$brand: #2563eb;
$text: #1e293b;
$radius: 12px;
$space: 16px;

body {
  font-family: system-ui, sans-serif;
  color: $text;
}

.card {
  max-width: 22rem;
  padding: $space;
  border: 2px solid $brand;
  border-radius: $radius;

  // Anidamiento: esta regla vale para los h2 que están DENTRO de .card.
  // En el CSS generado aparece como «.card h2».
  h2 {
    margin: 0 0 $space * 0.5;   // Sass hace la cuenta: 8px
    color: $brand;
    font-size: 1.25rem;
  }

  p {
    margin: 0 0 $space;
    line-height: 1.5;
  }

  a {
    color: $brand;
    font-weight: bold;
  }
}
```
