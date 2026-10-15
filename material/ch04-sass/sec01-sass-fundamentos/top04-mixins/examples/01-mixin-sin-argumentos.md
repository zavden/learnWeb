---
example_description: "@mixin guarda un bloque de declaraciones con nombre y @include lo copia donde lo necesites: el ellipsis de tres propiedades en una línea"
example_tags: "sass|mixins|include|reutilizar"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<ul class="products">
  <li><span class="product-name">Programador de riego solar con sensor de lluvia y conexión Bluetooth</span> <span class="price">39,90 €</span></li>
  <li><span class="product-name">Kit de goteo para 20 macetas</span> <span class="price">24,50 €</span></li>
</ul>
<p class="caption">Ruta: <span class="breadcrumb">Inicio › Riego › Programadores › Solares › Con sensor de lluvia</span></p>
```

# SCSS

```scss
// Un mixin es un bloque de declaraciones con nombre. Aquí, el «ellipsis»:
// las TRES propiedades que hacen falta para cortar un texto con «…»
// (lo viste en la lección de overflow; es fácil olvidarse de una).
@mixin truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.products {
  max-width: 20rem;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #cbd5e1;
  }
}

.product-name {
  @include truncate;   // ← Sass copia aquí las tres declaraciones
  flex: 1;
  min-width: 0;        // sin esto, el elemento flex no encoge (lección de trampas de flex)
}

.price {
  font-weight: bold;
}

.caption {
  display: flex;
  gap: 4px;
  max-width: 20rem;
}

.breadcrumb {
  @include truncate;   // ← y aquí otra vez
  color: #475569;
}

// En compiled.css, .product-name y .breadcrumb tienen cada una su copia de las
// tres declaraciones. El mixin no aparece: es una plantilla para Sass.
```
