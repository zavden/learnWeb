---
example_description: "Si un elemento choca con su max-width o su min-width, el algoritmo lo congela en ese límite y vuelve a repartir el espacio entre los demás"
example_tags: "css|flexbox|min-width|max-width|flex-grow|algoritmo"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Los tres con base 0 y <code>flex-grow: 1</code>; A con <code>max-width: 100px</code></p>
<div class="line is-max">
  <div class="item a">A · 100</div><div class="item b">B · 150</div><div class="item c">C · 150</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
<p class="steps">1.ª vuelta: 400 ÷ 3 = 133,33 cada uno. A se pasa de su máximo → se congela en 100.<br>2.ª vuelta: quedan 400 − 100 = 300 para B y C → 150 cada uno.</p>

<p class="caption">Los mismos, con A en <code>min-width: 200px</code> en lugar del máximo</p>
<div class="line is-min">
  <div class="item a">A · 200</div><div class="item b">B · 100</div><div class="item c">C · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
<p class="steps">1.ª vuelta: 133,33 cada uno. A no llega a su mínimo → se congela en 200.<br>2.ª vuelta: quedan 400 − 200 = 200 para B y C → 100 cada uno.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.steps {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.steps {
  color: #334155;
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

/* Base 0 y flex-grow: 1: todo el contenedor es espacio libre y se reparte a partes
   iguales (el atajo flex: 1 hace esto mismo; lo verás en el ejemplo 7). */
.item {
  flex-grow: 1;
  flex-basis: 0;
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }
.c { background: #a7f3d0; }

/* PASO 4: los límites. Tras cada reparto, el navegador encaja cada tamaño entre su
   min-width y su max-width (min-height/max-height en una columna). Si alguno se ha
   salido, lo CONGELA en el límite y vuelve a empezar el reparto con los demás y con
   el espacio que queda. El bucle termina cuando nadie se sale.
   Por eso un max-width no «roba» espacio: lo que A no puede usar se lo quedan B y C. */
.is-max .a {
  max-width: 100px;
}

.is-min .a {
  min-width: 200px;
}
```
