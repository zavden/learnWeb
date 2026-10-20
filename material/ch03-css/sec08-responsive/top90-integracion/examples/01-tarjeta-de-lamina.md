---
example_description: "La tarjeta de una tienda de láminas en tres huecos de 220, 340 y 460px: una container query cambia su estructura, el título crece con cqi y la foto se recorta con aspect-ratio, object-fit y un punto de interés en una custom property"
example_tags: "css|responsive|integracion|container-queries|cqi|object-fit|object-position|aspect-ratio"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Tres huecos de ancho fijo (borde morado), el mismo CSS. Menos de 20rem (320px): foto arriba en 4:3. Desde 20rem: foto cuadrada a la izquierda. Desde 26rem (416px): la foto crece a 10rem. El título crece con el hueco en los tres (<code>cqi</code>): unos 18, 23 y 26px (el máximo).</p>

<div class="slot" style="width: 220px">
  <article class="print-card" style="--focus: 25% 50%">
    <img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323">
    <div class="print-card__body">
      <h3>La gran ola</h3>
      <p class="print-card__meta">Hokusai, c. 1831 · 40 × 30 cm</p>
      <p class="print-card__buy"><strong>450 MXN</strong> <a href="/laminas/gran-ola">Ver lámina</a></p>
    </div>
  </article>
</div>

<div class="slot" style="width: 340px">
  <article class="print-card" style="--focus: 28% 60%">
    <img src="velasco-valle-de-mexico-480.jpg" alt="Valle de México" width="480" height="330">
    <div class="print-card__body">
      <h3>Valle de México</h3>
      <p class="print-card__meta">Velasco, 1877 · 50 × 35 cm</p>
      <p class="print-card__buy"><strong>520 MXN</strong> <a href="/laminas/valle-de-mexico">Ver lámina</a></p>
    </div>
  </article>
</div>

<div class="slot" style="width: 460px">
  <article class="print-card" style="--focus: 50% 50%">
    <img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480">
    <div class="print-card__body">
      <h3>La canica azul</h3>
      <p class="print-card__meta">NASA, Apolo 17, 1972 · 40 × 40 cm</p>
      <p class="print-card__buy"><strong>390 MXN</strong> <a href="/laminas/canica-azul">Ver lámina</a></p>
    </div>
  </article>
</div>
<p class="credit">Obras de dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }

/* Lección 4: el hueco es el contenedor; la tarjeta, su hija, pregunta. */
.slot {
  container: slot / inline-size;
  max-width: 100%;
  margin-bottom: 10px;
  outline: 2px dashed #7c3aed;
}

/* Mobile-first (lección 1): apilada. */
.print-card { display: grid; gap: 8px; padding: 8px; }

/* Lección 5: una caja con proporción propia, y la foto la llena recortada
   alrededor de su punto de interés (cada tarjeta lo trae en --focus). */
.print-card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: var(--focus, 50% 50%);
  border-radius: 6px;
}

/* Lección 3 + 4: la recta del clamp(), contra el ancho del hueco. */
.print-card h3 { margin: 0; font-size: clamp(1rem, 0.6rem + 4cqi, 1.6rem); line-height: 1.15; }
.print-card__meta { margin: 2px 0 6px; color: #475569; font-size: 0.75rem; }
.print-card__buy { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; margin: 0; font-size: 0.85rem; }
.print-card__buy a { color: #1d4ed8; }

@container slot (width >= 20rem) {
  .print-card { grid-template-columns: 7rem 1fr; align-items: start; }
  .print-card img { aspect-ratio: 1; }
}

@container slot (width >= 26rem) {
  .print-card { grid-template-columns: 10rem 1fr; }
}
```
