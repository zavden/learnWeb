---
example_description: "display: grid + place-items: center es la forma más corta de centrar un elemento en los dos ejes; margin: auto en el hijo también centra dentro de una celda grid"
example_tags: "css|grid|place-items|centrar|margin-auto|alineacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption"><code>display: grid; place-items: center</code> en el contenedor: dos líneas de CSS</p>
<section class="empty is-place-items" aria-label="Carrito vacío, versión con place-items">
  <div class="message">
    <strong>Tu carrito está vacío</strong>
    <a href="/tienda">Ver plantas</a>
  </div>
</section>

<p class="caption"><code>margin: auto</code> en el hijo: en una celda grid, un margen auto se queda con el espacio libre en los dos ejes</p>
<section class="empty is-margin" aria-label="Carrito vacío, versión con margin: auto">
  <div class="message">
    <strong>Tu carrito está vacío</strong>
    <a href="/tienda">Ver plantas</a>
  </div>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.empty {
  display: grid;
  max-width: 400px;
  height: 120px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.message {
  padding: 10px 16px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.85rem;
  text-align: center;
}

.message strong {
  display: block;
}

.message a {
  color: #0f5c55;
}

/* place-items es el atajo de align-items y justify-items (en ese orden; con un
   valor, los dos). Con un único hijo hay una sola celda que ocupa todo el
   contenedor, y center lo deja en el medio de esa celda: centrado del todo. */
.is-place-items {
  place-items: center;
}

/* La promesa de la lección de márgenes: en el flujo normal, margin-top: auto vale 0;
   en una celda grid (como en flexbox), los márgenes auto absorben el espacio libre
   de su lado. Los cuatro a la vez, centrado. */
.is-margin .message {
  margin: auto;
}
```
