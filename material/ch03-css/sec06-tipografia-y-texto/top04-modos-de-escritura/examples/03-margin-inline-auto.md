---
example_description: "margin: auto centra en el eje inline, no «en horizontal»: el mismo hijo con margin-inline: auto se centra a lo ancho en una caja horizontal y a lo alto en una caja vertical-rl; margin-block: auto nunca centra en el flujo normal"
example_tags: "css|modos-de-escritura|margin-inline|margin-block|centrar|writing-mode"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Las dos cajas miden 150 × 150 y su hijo tiene el mismo CSS: <code>inline-size: 50%</code>, <code>margin-inline: auto</code> y <code>margin-block: auto</code>.</p>

<div class="pair">
  <figure class="case">
    <figcaption><code>horizontal-tb</code>: centrado a lo ancho; a lo alto, arriba</figcaption>
    <div class="box">
      <p class="child">Hijo</p>
    </div>
  </figure>

  <figure class="case">
    <figcaption><code>vertical-rl</code>: centrado a lo alto; a lo ancho, a la derecha</figcaption>
    <div class="box is-vertical">
      <p class="child">Hijo</p>
    </div>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.pair {
  display: flex;
  gap: 24px;
}

.case {
  inline-size: 170px;
  margin: 0;
}

.case figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

.box {
  inline-size: 150px;
  block-size: 150px;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
}

/* En el flujo normal, los márgenes auto solo reparten espacio en el eje INLINE
   (el de las líneas): ahí el bloque tiene un tamaño que llenar, el del padre, y
   auto se queda con lo que sobra a cada lado. En el eje de BLOQUE, una caja mide
   lo que su contenido y los márgenes auto valen 0. Por eso «margin: auto no
   centra en vertical»: no es una cuestión de vertical, sino del eje de bloque. */
.child {
  inline-size: 50%;
  margin-inline: auto;
  margin-block: auto;      /* no hace nada en el flujo normal */
  padding: 6px;
  background: #3730a3;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
}

/* En vertical-rl, el eje inline es el vertical: el mismo margin-inline: auto
   centra al hijo de arriba abajo. Y el eje de bloque va de derecha a izquierda:
   el hijo se queda pegado a la derecha, donde empieza el bloque. */
.is-vertical {
  writing-mode: vertical-rl;
}
```
