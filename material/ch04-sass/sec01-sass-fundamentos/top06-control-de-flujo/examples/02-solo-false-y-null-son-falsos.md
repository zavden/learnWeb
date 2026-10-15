---
example_description: "En Sass solo false y null son falsos: 0 y \"\" son verdaderos (al revés que en Python), así que @if $count pinta una insignia con un 0"
example_tags: "sass|control-de-flujo|if|truthy|python|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p><a class="cart cart-bad" href="/cesta">❌ Cesta (<code>@if $cart-count</code>)</a></p>
<p><a class="cart cart-good" href="/cesta">✅ Cesta (<code>@if $cart-count &gt; 0</code>)</a></p>
<p class="promo promo-bad">❌ Oferta con <code>@if $promo-label</code></p>
<p class="promo promo-good">✅ Oferta con <code>@if $promo-label != ""</code></p>
```

# SCSS

```scss
// Configuración: la cesta está vacía y no hay ninguna promoción activa.
$cart-count: 0;
$promo-label: "";

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.cart {
  color: #1e40af;
}

@mixin badge {
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8rem;
}

// 🐛 En Python, `if cart_count:` es False con 0. En Sass, SOLO false y null
// son falsos: 0, "" y la lista vacía () son VERDADEROS. Resultado: insignia «0».
@if $cart-count {
  .cart-bad::after {
    content: "#{$cart-count}";
    @include badge;
  }
}

// ✅ Di exactamente lo que quieres comprobar.
@if $cart-count > 0 {
  .cart-good::after {
    content: "#{$cart-count}";
    @include badge;
  }
}

// 🐛 Lo mismo con una cadena vacía: "" es verdadero → una píldora vacía.
@if $promo-label {
  .promo-bad::before {
    content: $promo-label;
    @include badge;
    margin: 0 6px 0 0;
    padding: 1px 16px;
  }
}

// ✅ Compara con "" (o usa null para decir «no hay promoción»: null sí es falso).
@if $promo-label != "" {
  .promo-good::before {
    content: $promo-label;
    @include badge;
  }
}
```
