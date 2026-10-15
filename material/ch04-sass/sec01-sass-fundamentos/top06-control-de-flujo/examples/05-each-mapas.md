---
example_description: "@each $key, $value in $map recorre un mapa: una paleta genera cuatro variantes de alerta con fondo y borde derivados con sass:color"
example_tags: "sass|control-de-flujo|each|mapas|sass-color|generar-clases"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="alert alert--info" role="status">El riego automático empieza a las 7:00.</div>
<div class="alert alert--success" role="status">Pedido #20417 entregado.</div>
<div class="alert alert--warning" role="status">Quedan 2 unidades del kit de goteo.</div>
<div class="alert alert--danger" role="alert">No se pudo cobrar la tarjeta.</div>
```

# SCSS

```scss
@use "sass:color";

// Un mapa nombre → color. Python: alerts = {"info": "#0369a1", …}
$alerts: (
  info: #0369a1,
  success: #15803d,
  warning: #b45309,
  danger: #b91c1c,
);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.alert {
  max-width: 26rem;
  margin-bottom: 8px;
  padding: 10px 14px;
  border-left: 6px solid;
  border-radius: 4px;
}

// @each con DOS variables recorre clave y valor.
// Python: for name, color in alerts.items(): …
@each $name, $color in $alerts {
  .alert--#{$name} {
    border-left-color: $color;
    background: color.scale($color, $lightness: 90%);   // fondo muy claro
    color: color.scale($color, $lightness: -55%);       // texto muy oscuro
  }
}

// Una línea nueva en el mapa (por ejemplo, neutral: #475569) crea una
// variante nueva completa. Los colores derivados mantienen el contraste.
```
