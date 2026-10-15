---
example_description: "Cuatro clases que extienden .btn convierten la regla .btn + .btn en 25 selectores: @extend multiplica cada aparición del selector extendido"
example_tags: "sass|extend|selectores|rendimiento|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="toolbar">
  <button type="button" class="btn">Guardar</button>
  <button type="button" class="search-go">Buscar</button>
  <button type="button" class="newsletter-submit">Suscribirme</button>
</div>
<p>La página se ve bien. El problema está en <code>compiled.css</code>: busca la regla del <code>margin-left</code>.</p>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.btn {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: #1e40af;
  color: #ffffff;
  font: inherit;
}

.btn:hover {
  background: #1e3a8a;
}

// Separación entre botones seguidos: aparece .btn DOS veces en el selector.
.btn + .btn {
  margin-left: 8px;
}

.toolbar .btn {
  font-weight: bold;
}

// 🐛 Cuatro clases «con aspecto de botón». Cada @extend añade su selector a
// CADA regla donde aparece .btn. En una regla con un .btn: 1 + 4 = 5 selectores.
// En «.btn + .btn», Sass genera todas las combinaciones: 5 × 5 = 25 selectores.
.search-go { @extend .btn; }
.newsletter-submit { @extend .btn; }
.checkout-pay { @extend .btn; }
.cookie-accept { @extend .btn; }

// En un proyecto grande, con docenas de @extend y reglas con varios
// combinadores, el CSS generado puede crecer a cientos de KB sin que lo veas en
// el SCSS. ✅ Alternativa: en el HTML, class="btn search-go", o un mixin.
```
