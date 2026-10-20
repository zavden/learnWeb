---
example_description: "flex-grow reparte el espacio libre en proporción a los factores: con 1, 2 y 1, B crece el doble que A, pero no acaba midiendo el doble"
example_tags: "css|flexbox|flex-grow|espacio-libre|algoritmo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Antes de crecer: bases 100, 50 y 50 → libre: 400 − 200 = <strong>200</strong></p>
<div class="line">
  <div class="item a">A · 100</div><div class="item b">B · 50</div><div class="item c">C · 50</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">Con <code>flex-grow</code> 1, 2 y 1: cuatro partes de 200 ÷ 4 = <strong>50</strong></p>
<div class="line is-growing">
  <div class="item a">A · 150</div><div class="item b">B · 150</div><div class="item c">C · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<table class="math">
  <thead><tr><th scope="col"></th><th scope="col">base</th><th scope="col">flex-grow</th><th scope="col">recibe</th><th scope="col">final</th></tr></thead>
  <tbody>
    <tr><th scope="row">A</th><td>100</td><td>1</td><td>1 × 50 = 50</td><td>150</td></tr>
    <tr><th scope="row">B</th><td>50</td><td>2</td><td>2 × 50 = 100</td><td>150</td></tr>
    <tr><th scope="row">C</th><td>50</td><td>1</td><td>1 × 50 = 50</td><td>100</td></tr>
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

.line {
  display: flex;
  width: 400px;
  outline: 2px dashed #7c3aed;
  background: url(free-space.svg);
}

.ruler {
  display: block;
  margin-top: 3px;
}

.item {
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; flex-basis: 100px; }
.b { background: #fbcfe8; flex-basis: 50px; }
.c { background: #a7f3d0; flex-basis: 50px; }

/* PASO 3 (espacio libre positivo): cada elemento recibe
     espacio libre × (su flex-grow ÷ suma de los flex-grow)
   y su tamaño final es su base + lo que recibe.
   flex-grow reparte el ESPACIO LIBRE, no el tamaño: B tiene el doble de flex-grow
   que A y recibe el doble (100 frente a 50), pero acaba midiendo lo mismo que A
   porque empezó con la mitad. */
.is-growing .a { flex-grow: 1; }
.is-growing .b { flex-grow: 2; }
.is-growing .c { flex-grow: 1; }

.math {
  margin-top: 6px;
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
