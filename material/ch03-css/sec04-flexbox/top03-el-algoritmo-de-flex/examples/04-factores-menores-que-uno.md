---
example_description: "Si los flex-grow de una línea suman menos de 1, solo se reparte esa fracción del espacio libre: flex-grow: 0.5 se queda con la mitad"
example_tags: "css|flexbox|flex-grow|espacio-libre|algoritmo"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p class="caption">Bases 100 y 100 → libre: <strong>200</strong>. A con <code>flex-grow: 1</code>, B con 0: A se lo queda todo</p>
<div class="line">
  <div class="item a is-one">A · 300</div><div class="item b">B · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">A con <code>flex-grow: 0.5</code>: la suma es 0,5 → se reparte 200 × 0,5 = <strong>100</strong> y sobran 100</p>
<div class="line">
  <div class="item a is-half">A · 200</div><div class="item b">B · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">A y B con <code>flex-grow: 0.25</code>: la suma es 0,5 → 100 a repartir, 50 para cada uno</p>
<div class="line">
  <div class="item a is-quarter">A · 150</div><div class="item b is-quarter">B · 150</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
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
  flex-basis: 100px;
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }

/* Con factores que suman 1 o más, se reparte TODO el espacio libre. */
.is-one { flex-grow: 1; }

/* Regla especial: si la suma de los flex-grow de la línea es menor que 1, solo se
   reparte esa fracción del espacio libre (suma × libre) y el resto se queda libre.
   Así flex-grow: 0.5 significa «quédate con la mitad de lo que sobre», y la
   transición de 0 a 1 es gradual, sin saltos. Con flex-shrink pasa lo mismo. */
.is-half { flex-grow: 0.5; }
.is-quarter { flex-grow: 0.25; }
```
