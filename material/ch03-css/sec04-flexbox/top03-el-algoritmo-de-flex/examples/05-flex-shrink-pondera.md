---
example_description: "flex-shrink no quita lo mismo a todos: el exceso se reparte según flex-shrink × base, así que el elemento más grande es el que más encoge"
example_tags: "css|flexbox|flex-shrink|espacio-libre|algoritmo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Sin encoger (<code>flex-shrink: 0</code>): bases 220 + 132 + 88 = 440 → sobran <strong>40</strong></p>
<div class="line is-rigid">
  <div class="item a">A · 220</div><div class="item b">B · 132</div><div class="item c">C · 88</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>flex-shrink: 1</code> en los tres (inicial): pesos 220, 132 y 88 → quitan 20, 12 y 8</p>
<div class="line">
  <div class="item a">A · 200</div><div class="item b">B · 120</div><div class="item c">C · 80</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>flex-shrink</code> 0, 1 y 1: A no encoge; pesos 132 y 88 → quitan 24 y 16</p>
<div class="line is-a-rigid">
  <div class="item a">A · 220</div><div class="item b">B · 108</div><div class="item c">C · 72</div>
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
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; flex-basis: 220px; }
.b { background: #fbcfe8; flex-basis: 132px; }
.c { background: #a7f3d0; flex-basis: 88px; }

.is-rigid .item {
  flex-shrink: 0;
}

/* PASO 3 (espacio libre negativo): no se reparte por flex-shrink a secas, sino por
   el «factor de encogimiento ponderado»:  peso = flex-shrink × base.
   Cada elemento pierde   exceso × (su peso ÷ suma de los pesos).

   Fila 2:  pesos 220 + 132 + 88 = 440
            A: 40 × 220/440 = 20 → 200    B: 40 × 132/440 = 12 → 120    C: 40 × 88/440 = 8 → 80
   Si se repartiera a partes iguales, cada uno perdería 13,33px: el pequeño encogería
   tanto como el grande. Ponderar por la base hace que todos pierdan el mismo
   PORCENTAJE (aquí, el 9,09 %).

   Fila 3:  A tiene flex-shrink: 0 → peso 0, se queda en 220.
            pesos 132 + 88 = 220     B: 40 × 132/220 = 24 → 108    C: 40 × 88/220 = 16 → 72

   Detalle de la especificación: el peso usa la base SIN padding ni borde. Por eso
   estos elementos no tienen padding horizontal: así las cuentas salen exactas. */
.is-a-rigid .a {
  flex-shrink: 0;
}
```
