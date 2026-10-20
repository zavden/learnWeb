---
example_description: "flex-grow: 1 reparte el sobrante y deja más anchos a los textos largos; flex: 1 (= 1 1 0%) parte de base 0 y da anchos iguales, salvo que el padding sea distinto"
example_tags: "css|flexbox|flex|flex-grow|flex-basis|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ <code>flex-grow: 1</code>: base = su texto + un cuarto del sobrante → anchos distintos</p>
<nav class="line is-grow" aria-label="Pestañas, versión flex-grow: 1">
  <a class="item a" href="#">Inicio</a><a class="item b" href="#">Productos destacados</a><a class="item c" href="#">Blog</a><a class="item d" href="#">Contacto</a>
</nav>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>flex: 1</code> (<code>1 1 0%</code>): base 0 → 400 ÷ 4 = <strong>100</strong> cada una</p>
<nav class="line is-flex-1" aria-label="Pestañas, versión flex: 1">
  <a class="item a" href="#">Inicio</a><a class="item b" href="#">Productos destacados</a><a class="item c" href="#">Blog</a><a class="item d" href="#">Contacto</a>
</nav>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">⚠️ <code>flex: 1</code> con 20px de padding a cada lado en B: base de B = 40 → libre 360 → 90 para cada una: 90, <strong>130</strong>, 90, 90</p>
<nav class="line is-flex-1 is-padded" aria-label="Pestañas, versión con padding distinto">
  <a class="item a" href="#">Inicio</a><a class="item b" href="#">Productos destacados</a><a class="item c" href="#">Blog</a><a class="item d" href="#">Contacto</a>
</nav>
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
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.item:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }
.c { background: #a7f3d0; }
.d { background: #fde68a; }

/* 🐛 flex-grow: 1 solo toca el factor de crecimiento: la base sigue en auto, es decir,
   el ancho del texto. Cada pestaña recibe la misma CANTIDAD de espacio libre, pero
   empezaba con un tamaño distinto: «Productos destacados» acaba siendo la más ancha. */
.is-grow .item {
  flex-grow: 1;
}

/* ✅ flex: 1 es flex-grow: 1 + flex-shrink: 1 + flex-basis: 0%. Con base 0, TODO el
   contenedor es espacio libre y se reparte a partes iguales: el texto no cuenta.
   «Productos destacados» no cabe en 100px y se parte en dos líneas. */
.is-flex-1 .item {
  flex: 1;
}

/* ⚠️ La base 0 es la del CONTENIDO: el padding y el borde se suman a ella.
   B parte de 0 + 20 + 20 = 40, el espacio libre es 400 − 40 = 360 y cada una recibe
   90. B acaba con 90 + 40 = 130. flex: 1 iguala el espacio REPARTIDO, no el tamaño
   final. (Y si un contenido no puede encoger, tampoco: lo verás en la lección 4.) */
.is-padded .b {
  padding: 4px 20px;
}
```
