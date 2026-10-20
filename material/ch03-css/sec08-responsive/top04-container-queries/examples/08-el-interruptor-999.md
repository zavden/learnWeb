---
example_description: "La caja de compra flotante del módulo de flujo y posicionamiento, con su truco (22rem - 100%) * 999 dentro de clamp() para pasar a todo el ancho en contenedores estrechos, y la misma decisión escrita con @container: mismo resultado, y se lee de un vistazo"
example_tags: "css|responsive|container-queries|clamp|float|sin-media-queries|refactorizacion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Una ficha de producto en dos huecos: 440px y 280px. Con 22rem (352px) o más, la caja de compra flota a la derecha; con menos, ocupa todo el ancho.</p>

<p class="label">Con el truco ×999 (sin consultas)</p>
<div class="slots">
  <div class="product-top is-switch" style="width: 440px"><div class="buy-box">Maceta de Talavera<br><strong>690 MXN</strong></div><div class="gallery">Galería de fotos</div></div>
  <div class="product-top is-switch" style="width: 280px"><div class="buy-box">Maceta de Talavera<br><strong>690 MXN</strong></div><div class="gallery">Galería de fotos</div></div>
</div>

<p class="label">Con <code>@container</code></p>
<div class="slots">
  <div class="product-top is-query" style="width: 440px"><div class="buy-box">Maceta de Talavera<br><strong>690 MXN</strong></div><div class="gallery">Galería de fotos</div></div>
  <div class="product-top is-query" style="width: 280px"><div class="buy-box">Maceta de Talavera<br><strong>690 MXN</strong></div><div class="gallery">Galería de fotos</div></div>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .label { margin: 8px 0 4px; font-size: 0.72rem; }
.slots { display: grid; gap: 8px; }

.product-top { display: flow-root; max-width: 100%; outline: 2px dashed #7c3aed; font-size: 0.8rem; }
.buy-box { padding: 8px; border: 1px solid #94a3b8; border-radius: 8px; background: #f8fafc; box-sizing: border-box; }
.gallery { display: flow-root; min-height: 4rem; padding: 8px; background: #dbeafe; }

/* EL TRUCO DEL MÓDULO 3 (con 22rem en lugar de 40rem). 100% es el ancho
   del contenedor. (22rem - 100%) * 999 es enorme y positivo si el contenedor
   mide menos de 22rem, y enorme y negativo si mide más; clamp() lo convierte
   en un interruptor: 100% o 10rem. El margen hace lo mismo al revés.
   Funciona en cualquier navegador desde 2020, pero hay que pararse a pensarlo. */
.is-switch .buy-box {
  float: right;
  width: clamp(min(10rem, 100%), (22rem - 100%) * 999, 100%);
  margin: 0 0 8px clamp(0rem, (100% - 22rem) * 999, 1rem);
}

/* LA VERSIÓN CON CONTAINER QUERIES: mobile-first, la caja es un bloque de
   todo el ancho; con sitio, flota. Dice exactamente lo que hace. */
.is-query { container-type: inline-size; }
.is-query .buy-box { margin-bottom: 8px; }

@container (width >= 22rem) {
  .is-query .buy-box { float: right; width: 10rem; margin: 0 0 8px 1rem; }
}
```
