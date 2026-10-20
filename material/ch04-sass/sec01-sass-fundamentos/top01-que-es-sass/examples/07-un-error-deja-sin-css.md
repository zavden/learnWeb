---
example_description: "En CSS un error descarta una declaración; en Sass un solo error (una variable mal escrita) deja la página entera sin CSS"
example_tags: "sass|scss|errores|compilar"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<header class="site-header">La Huerta · Tienda de riego</header>
<main>
  <h1>Ofertas de la semana</h1>
  <p class="price">Programador solar: <strong>39,90 €</strong></p>
  <button type="button" class="btn">Añadir a la cesta</button>
</main>
```

# SCSS

```scss
$brand: #15803d;
$text: #1e293b;

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: $text;
}

.site-header {
  padding: 12px 16px;
  background: $brand;
  color: #ffffff;
  font-weight: bold;
}

main {
  padding: 16px;
}

.price strong {
  color: $brand;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  // 🐛 Una letra cambiada: $brnad no existe → «Undefined variable».
  // Esta línea rompe TODO: Sass se detiene y no genera ni una regla,
  // así que la cabecera, el precio y el botón salen sin estilos.
  background: $brnad;
  color: #ffffff;
}

// En CSS puro, un valor inválido solo anula SU declaración (lección 1 de CSS).
// Sass es un compilador, como Python: si hay un error, no hay resultado.
// ✅ Solución: escribe $brand. Lee siempre el mensaje y la línea del error.
```
