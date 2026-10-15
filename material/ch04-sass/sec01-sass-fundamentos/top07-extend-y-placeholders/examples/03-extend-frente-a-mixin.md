---
example_description: "El mismo resultado visual con @extend (agrupa selectores) y con un mixin (copia declaraciones): compara los dos CSS generados"
example_tags: "sass|extend|mixins|placeholders|comparacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p>Con <code>@extend %card</code>:</p>
<div class="row">
  <article class="product-card">Kit de goteo</article>
  <article class="event-card">Taller de compost</article>
  <article class="post-card">Guía de poda</article>
</div>
<p>Con <code>@include card</code>:</p>
<div class="row">
  <article class="product-tile">Kit de goteo</article>
  <article class="event-tile">Taller de compost</article>
  <article class="post-tile">Guía de poda</article>
</div>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// ── A) Placeholder + @extend ────────────────────────────────────
%card {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.15);
}

.product-card { @extend %card; border-top: 4px solid #15803d; }
.event-card   { @extend %card; border-top: 4px solid #b45309; }
.post-card    { @extend %card; border-top: 4px solid #1e40af; }
// → UNA regla con tres selectores + tres reglas pequeñas.

// ── B) Mixin + @include ─────────────────────────────────────────
@mixin card {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.15);
}

.product-tile { @include card; border-top: 4px solid #15803d; }
.event-tile   { @include card; border-top: 4px solid #b45309; }
.post-tile    { @include card; border-top: 4px solid #1e40af; }
// → tres reglas con las cinco declaraciones copiadas en cada una.

// @extend genera menos CSS… pero mueve los selectores al sitio del %card y
// no admite argumentos. El mixin repite, pero lo que ves es lo que obtienes.
```
