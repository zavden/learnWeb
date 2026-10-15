---
example_description: "writing-mode decide hacia dónde avanzan las líneas (eje inline) y hacia dónde se apilan los bloques (eje de bloque): el mismo inline-size y block-size dan cajas apaisadas o alargadas según el modo"
example_tags: "css|modos-de-escritura|writing-mode|inline-size|block-size|japones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Las tres cajas tienen <code>inline-size: 150px</code> y <code>block-size: 110px</code>, y dos párrafos: el 1 y el 2. Cada letra avanza por el eje <strong>inline</strong>; cada párrafo nuevo, por el eje de <strong>bloque</strong>.</p>

<div class="modes">
  <figure class="mode">
    <figcaption><code>horizontal-tb</code><br>inline →, bloque ↓</figcaption>
    <div class="box">
      <p>1. Soy un gato.</p>
      <p>2. Todavía no tengo nombre.</p>
    </div>
  </figure>

  <figure class="mode">
    <figcaption><code>vertical-rl</code><br>inline ↓, bloque ←</figcaption>
    <div class="box is-vertical-rl" lang="ja">
      <p>一、吾輩は猫である。</p>
      <p>二、名前はまだ無い。</p>
    </div>
  </figure>

  <figure class="mode">
    <figcaption><code>vertical-lr</code><br>inline ↓, bloque →</figcaption>
    <div class="box is-vertical-lr" lang="ja">
      <p>一、吾輩は猫である。</p>
      <p>二、名前はまだ無い。</p>
    </div>
  </figure>
</div>

<p class="credit">Natsume Sōseki, <cite lang="ja">吾輩は猫である</cite> (<cite>Soy un gato</cite>, 1905): «Soy un gato. Todavía no tengo nombre».</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.credit {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.credit {
  margin-block-start: 8px;
}

.modes {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: start;
}

.mode {
  margin: 0;
}

.mode figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

/* Medidas LÓGICAS: inline-size es el tamaño en el eje de las líneas y block-size,
   en el eje en que se apilan los párrafos. En horizontal, ancho y alto; en
   vertical, alto y ancho. */
.box {
  inline-size: 150px;
  block-size: 110px;
  padding: 6px;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
  font-size: 1rem;
  line-height: 1.6;
}

.box p {
  margin: 0;
}

.box p + p {
  margin-block-start: 0.5em;   /* separación en el eje de bloque, gire como gire */
}

/* vertical-rl: las líneas van de arriba abajo y cada línea nueva (y cada párrafo)
   se coloca a la IZQUIERDA de la anterior. Es el modo del japonés y del chino
   tradicionales, que se leen en columnas de derecha a izquierda. */
.is-vertical-rl {
  writing-mode: vertical-rl;
}

/* vertical-lr: las líneas también bajan, pero las nuevas se colocan a la DERECHA.
   Lo usa el mongol tradicional; aquí, para comparar. */
.is-vertical-lr {
  writing-mode: vertical-lr;
}
```
