---
example_description: "La unidad fr reparte el espacio libre: contenedor − pistas fijas − gaps, dividido entre la suma de las fr; tres rejillas de 400px con sus cuentas y una regla para comprobarlas"
example_tags: "css|grid|fr|gap|algoritmo|grid-template-columns"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption"><code>1fr 1fr 1fr 1fr</code>, sin gap: libre = 400 → 400 ÷ 4 = <strong>100</strong></p>
<div class="grid is-four">
  <div>1fr · 100</div><div>1fr · 100</div><div>1fr · 100</div><div>1fr · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">Las mismas con <code>gap: 16px</code>: libre = 400 − 3 × 16 = 352 → 352 ÷ 4 = <strong>88</strong></p>
<div class="grid is-four has-gap">
  <div>1fr · 88</div><div>1fr · 88</div><div>1fr · 88</div><div>1fr · 88</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>120px 1fr 2fr</code> con <code>gap: 20px</code>: libre = 400 − 120 − 2 × 20 = 240 → 1fr = 240 ÷ 3 = <strong>80</strong></p>
<div class="grid is-mixed">
  <div class="fixed">120px</div><div>1fr · 80</div><div>2fr · 160</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<table class="math">
  <thead><tr><th scope="col">pista</th><th scope="col">tamaño</th><th scope="col">cálculo</th><th scope="col">ancho</th></tr></thead>
  <tbody>
    <tr><th scope="row">1</th><td>120px</td><td>fija</td><td>120</td></tr>
    <tr><th scope="row">2</th><td>1fr</td><td>1 × 80</td><td>80</td></tr>
    <tr><th scope="row">3</th><td>2fr</td><td>2 × 80</td><td>160</td></tr>
    <tr><th scope="row">gaps</th><td>20px</td><td>2 × 20</td><td>40</td></tr>
    <tr><th scope="row">total</th><td></td><td></td><td>400 ✓</td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);          /* lo rayado es el gap */
}

.ruler {
  display: block;
  margin-top: 3px;
}

/* Sin padding horizontal: el ancho de cada elemento es el de su pista. */
.grid > div {
  padding: 4px 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.grid > .fixed {
  border-color: #b45309;
  background: #fef3c7;
}

/* fr = «fracción del espacio libre». El navegador:
   1. resta al contenedor las pistas fijas y los gaps → espacio libre;
   2. lo divide entre la suma de las fr → cuánto vale 1fr;
   3. da a cada pista sus fr × ese valor. */
.is-four {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.has-gap {
  gap: 16px;             /* el gap se descuenta ANTES de repartir */
}

/* A diferencia de flex-grow, aquí no hay bases que sumar: 2fr mide exactamente
   el doble que 1fr, porque las dos parten de cero. */
.is-mixed {
  grid-template-columns: 120px 1fr 2fr;
  gap: 20px;
}

.math {
  margin-top: 8px;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.math th,
.math td {
  padding: 1px 8px;
  border: 1px solid #cbd5e1;
  text-align: right;
}
```
