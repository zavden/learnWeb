---
example_description: "Los ejes de flexbox y grid son los del texto: la misma fila flex y la misma rejilla de tres columnas, en español, con dir=\"rtl\" y con writing-mode: vertical-rl"
example_tags: "css|modos-de-escritura|flexbox|grid|ejes|rtl|writing-mode"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">El mismo CSS en las seis cajas: <code>display: flex</code> (fila) arriba y <code>grid-template-columns: repeat(3, 1fr)</code> abajo. Solo cambia la dirección del texto. Sigue los números.</p>

<div class="panels">
  <figure class="panel">
    <figcaption>Español</figcaption>
    <div class="flex"><span>1</span><span>2</span><span>3</span></div>
  </figure>
  <figure class="panel">
    <figcaption><code>dir="rtl"</code></figcaption>
    <div class="flex" dir="rtl"><span>1</span><span>2</span><span>3</span></div>
  </figure>
  <figure class="panel">
    <figcaption><code>vertical-rl</code></figcaption>
    <div class="flex is-vertical"><span>1</span><span>2</span><span>3</span></div>
  </figure>

  <figure class="panel">
    <figcaption>Español</figcaption>
    <div class="grid"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </figure>
  <figure class="panel">
    <figcaption><code>dir="rtl"</code></figcaption>
    <div class="grid" dir="rtl"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </figure>
  <figure class="panel">
    <figcaption><code>vertical-rl</code></figcaption>
    <div class="grid is-vertical"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
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

.panels {
  display: grid;
  grid-template-columns: repeat(3, 120px);
  gap: 12px;
}

.panel {
  margin: 0;
}

.panel figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

/* Tamaños lógicos: 110 de largo en el eje inline y 80 en el de bloque. */
.flex,
.grid {
  inline-size: 110px;
  block-size: 80px;
  gap: 4px;
  padding: 4px;
  outline: 1px dashed #4338ca;
}

.flex span,
.grid span {
  padding: 2px 6px;
  background: #3730a3;
  color: #ffffff;
  font-weight: 700;
  text-align: center;
}

/* flex-direction: row no significa «hacia la derecha», sino «en el sentido de las
   líneas de texto» (el eje inline). En árabe, de derecha a izquierda; en vertical,
   de arriba abajo. */
.flex {
  display: flex;
}

/* Las columnas de grid van en el eje inline y las filas, en el de bloque. Por eso
   justify-* (inline) y align-* (bloque) también giran: en vertical, justify-items
   alinea de arriba abajo. */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.is-vertical {
  writing-mode: vertical-rl;
}

/* En vertical, las cifras y las letras latinas se tumban; text-orientation:
   upright las pone de pie (lo verás en el ejemplo del japonés vertical). */
.is-vertical span {
  text-orientation: upright;
}
```
