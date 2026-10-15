---
example_description: "Textos de distinto tamaño en fila: con align-items: center sus letras quedan a distintas alturas; con baseline se apoyan en la misma línea"
example_tags: "css|flexbox|align-items|baseline|tipografia"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="label">La raya roja discontinua es la línea base del <strong>primer</strong> elemento («Plan Pro»).</p>

<p class="caption">❌ <code>align-items: center</code>: cada caja centrada, pero las letras a distintas alturas</p>
<div class="price-row is-center">
  <span class="plan"><span class="baseline-ruler" aria-hidden="true"></span>Plan Pro</span>
  <span class="amount">29 €</span>
  <span class="period">al mes</span>
</div>

<p class="caption">✅ <code>align-items: baseline</code>: las tres se apoyan en la misma línea</p>
<div class="price-row is-baseline">
  <span class="plan"><span class="baseline-ruler" aria-hidden="true"></span>Plan Pro</span>
  <span class="amount">29 €</span>
  <span class="period">al mes</span>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.price-row {
  display: flex;
  gap: 12px;
  width: 340px;
  padding: 2px 8px;
  border: 2px dashed #7c3aed;
}

.plan {
  font-weight: bold;
}

.amount {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.period {
  color: #475569;
  font-size: 0.8rem;
}

/* ❌ center centra las CAJAS. Cajas de distinta altura, con letras de distinto
   tamaño, dejan sus líneas base a alturas diferentes: el texto «baila». */
.is-center {
  align-items: center;
}

/* ✅ baseline mueve cada caja para que la línea base de su PRIMERA línea de texto
   coincida con la de las demás. Es la alineación correcta para textos en fila.
   Variantes: first baseline (lo mismo) y last baseline (la de la última línea). */
.is-baseline {
  align-items: baseline;
}

/* La regla de la línea base del módulo anterior: un inline-block vacío se apoya en la
   línea base con su borde inferior. El margen negativo hace que no ocupe sitio y
   pueda atravesar toda la fila. */
.baseline-ruler {
  display: inline-block;
  width: 320px;
  margin-right: -320px;
  border-top: 2px dashed #dc2626;
}
```
