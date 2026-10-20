---
example_description: "!global hace que una asignación dentro de un bloque cambie la variable global, y afecta a todo lo que se compila después"
example_tags: "sass|variables|ambito|global"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="before">Antes del bloque: <code>$radius</code> vale 4px</p>
<p class="changer">Este bloque usa <code>$radius: 20px !global</code></p>
<p class="after">Después del bloque: la global ya vale 20px</p>
```

# SCSS

```scss
$radius: 4px;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

p {
  max-width: 24rem;
  padding: 10px 14px;
  background: #e0e7ff;
}

.before {
  border-radius: $radius;              // → 4px
}

.changer {
  // Sin !global, esto crearía una variable LOCAL (como en el ejemplo anterior).
  // Con !global, asigna a la variable global: el cambio sobrevive al bloque.
  $radius: 20px !global;
  border-radius: $radius;              // → 20px
}

.after {
  border-radius: $radius;              // → 20px: la global cambió
}

// Sass compila de arriba abajo, una sola vez: .before ya se generó con 4px
// y no «se entera» del cambio. El orden del archivo decide.
//
// En la práctica, !global se usa poco: hace difícil saber cuánto vale una
// variable mirando solo el sitio donde se usa.
```
