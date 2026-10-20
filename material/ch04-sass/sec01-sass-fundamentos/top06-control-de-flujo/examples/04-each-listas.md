---
example_description: "@each recorre una lista y genera una regla por elemento; con listas de pares, desestructura cada par en dos variables"
example_tags: "sass|control-de-flujo|each|listas|generar-clases"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="weight-400">Pedido #20417 · peso 400</p>
<p class="weight-600">Pedido #20417 · peso 600</p>
<p class="weight-800">Pedido #20417 · peso 800</p>
<ul class="orders">
  <li><span class="status status--pending">Pendiente</span> Kit de goteo</li>
  <li><span class="status status--shipped">Enviado</span> Programador solar</li>
  <li><span class="status status--delivered">Entregado</span> Sustrato universal</li>
  <li><span class="status status--cancelled">Cancelado</span> Mesa de cultivo</li>
</ul>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

// 1) Una lista simple: una regla por elemento.
//    Python: for weight in [400, 600, 800]: …
@each $weight in 400, 600, 800 {
  .weight-#{$weight} {
    font-weight: $weight;
  }
}

// 2) Una lista de PARES: cada elemento es otra lista, y @each la reparte en
//    dos variables (desestructuración).
//    Python: for name, color in [("pending", "#b45309"), …]: …
$statuses: (pending, #b45309), (shipped, #0369a1), (delivered, #15803d), (cancelled, #b91c1c);

@each $name, $color in $statuses {
  .status--#{$name} {
    background: $color;
  }
}

.orders {
  padding: 0;
  list-style: none;

  li {
    margin-bottom: 6px;
  }
}

.status {
  display: inline-block;
  min-width: 6rem;
  margin-right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
}

// En compiled.css hay 3 + 4 reglas que no has escrito a mano.
// Para añadir un estado nuevo, se añade un par a la lista. Nada más.
```
