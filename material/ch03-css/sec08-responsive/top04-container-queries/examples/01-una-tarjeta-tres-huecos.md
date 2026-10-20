---
example_description: "La misma tarjeta de producto en tres huecos de ancho distinto (200px, 320px y uno que puedes estirar): con container-type en el hueco y @container, cada copia elige su layout según su hueco, no según la ventana"
example_tags: "css|responsive|container-queries|container-type|container|componentes"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">El mismo HTML y el mismo CSS en los tres huecos (borde morado). Menos de 18rem (288px): apilada. Desde 18rem: foto a la izquierda. Desde 26rem (416px): foto más grande y título mayor. Estira el tercero desde su esquina inferior derecha.</p>

<p class="label">Hueco de 200px</p>
<div class="slot" style="width: 200px">
  <article class="print-card"><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"><div><h3>La gran ola</h3><p>Hokusai, c. 1831 · Lámina de 40 × 30 cm</p><p class="price">450 MXN</p></div></article>
</div>

<p class="label">Hueco de 320px</p>
<div class="slot" style="width: 320px">
  <article class="print-card"><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"><div><h3>La gran ola</h3><p>Hokusai, c. 1831 · Lámina de 40 × 30 cm</p><p class="price">450 MXN</p></div></article>
</div>

<p class="label">↔ Hueco que se estira (empieza en 440px)</p>
<div class="slot is-resizable">
  <article class="print-card"><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"><div><h3>La gran ola</h3><p>Hokusai, c. 1831 · Lámina de 40 × 30 cm</p><p class="price">450 MXN</p></div></article>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .label { margin: 8px 0 4px; font-size: 0.72rem; }

/* 1. El hueco es un CONTENEDOR: sus descendientes pueden preguntar por su
      ancho (inline-size: el eje en línea, el ancho en un texto horizontal). */
.slot {
  container-type: inline-size;
  outline: 2px dashed #7c3aed;
}

.is-resizable {
  width: 440px;
  max-width: 100%;
  min-width: 150px;
  overflow: auto;                /* resize solo funciona con overflow distinto de visible */
  resize: horizontal;
}

/* La tarjeta, mobile-first: apilada. (Las imágenes con width: 100% y
   height: auto se explican en la lección de imágenes.) */
.print-card { display: grid; gap: 8px; padding: 8px; font-size: 0.8rem; }
.print-card img { display: block; width: 100%; height: auto; border-radius: 4px; }
.print-card h3 { margin: 0 0 2px; font-size: 0.95rem; }
.print-card p { margin: 0; }
.print-card .price { margin-top: 4px; font-weight: 700; }

/* 2. @container: como @media, pero la condición es sobre el CONTENEDOR más
      cercano de la tarjeta (el hueco), no sobre la ventana. */
@container (width >= 18rem) {
  .print-card { grid-template-columns: 7rem 1fr; align-items: start; }
}

@container (width >= 26rem) {
  .print-card { grid-template-columns: 11rem 1fr; }
  .print-card h3 { font-size: 1.15rem; }
}
```
