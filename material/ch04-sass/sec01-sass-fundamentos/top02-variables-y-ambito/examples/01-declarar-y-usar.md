---
example_description: "Variables Sass: $nombre: valor; guardan colores, medidas, números, textos y listas, y se sustituyen por su valor al compilar"
example_tags: "sass|variables|tipos"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="plan">
  <p class="plan-name">Plan Huerto</p>
  <p class="plan-price">9 € <small>/ mes</small></p>
  <ul>
    <li>Consejos de riego semanales</li>
    <li>Calendario de siembra</li>
    <li>Soporte por correo</li>
  </ul>
  <a class="plan-cta" href="/suscripcion/huerto">Suscribirme</a>
</article>
```

# SCSS

```scss
// Una variable se declara como una propiedad, pero con $ delante del nombre.
// Puede guardar cualquier valor de CSS:
$brand: #15803d;                       // un color
$text: #1e293b;
$radius: 12px;                         // una medida (número con unidad)
$line-height: 1.5;                     // un número sin unidad
$font-stack: system-ui, sans-serif;    // una lista separada por comas
$price-weight: bold;                   // una palabra clave

// Curiosidad: para Sass, guion y guion bajo son lo mismo.
// $line-height y $line_height son LA MISMA variable.

body {
  font-family: $font-stack;
  color: $text;
  line-height: $line-height;
}

.plan {
  max-width: 18rem;
  padding: 20px;
  border: 2px solid $brand;
  border-radius: $radius;
}

.plan-name {
  margin: 0;
  color: $brand;
  font-weight: bold;
  text-transform: uppercase;
}

.plan-price {
  margin: 4px 0 0;
  font-size: 2rem;
  font-weight: $price-weight;
}

.plan-cta {
  display: inline-block;
  padding: 8px 16px;
  border-radius: $radius * 0.5;        // se puede operar con ellas: 6px
  background: $brand;
  color: #ffffff;
  text-decoration: none;
}

// En compiled.css no queda ni una variable: solo sus valores.
// Cambia $brand una vez y cambian los tres sitios donde se usa.
```
