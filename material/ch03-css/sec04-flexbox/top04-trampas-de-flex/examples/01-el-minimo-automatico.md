---
example_description: "min-width: auto en un elemento flex es un suelo: no encoge por debajo de su contenido (aquí, un logo de 160px); min-width: 0 u overflow: hidden lo quitan"
example_tags: "css|flexbox|min-width|flex-shrink|algoritmo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Bases 200 + 200 + 200 = 600 en 400: faltan 200. C lleva un logo de 160px y <code>min-width: auto</code> (el valor inicial)</p>
<div class="line">
  <div class="item a">A · 120</div><div class="item b">B · 120</div><div class="item c"><img src="logo-cafe-altura.svg" alt="Café Altura" width="160" height="40"></div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
<p class="steps">1.ª vuelta: cada uno pierde 66,67 → 133,33. C no puede bajar de su contenido (160) → se congela en 160.<br>2.ª vuelta: quedan 400 − 160 = 240 para A y B → 120 cada uno.</p>

<p class="caption"><code>min-width: 0</code> en C: sin suelo, 133,33 para cada uno; el logo se sale de C (y del contenedor)</p>
<div class="line is-zero">
  <div class="item a">A · 133,33</div><div class="item b">B · 133,33</div><div class="item c"><img src="logo-cafe-altura.svg" alt="Café Altura" width="160" height="40"></div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>overflow: hidden</code> en C: tampoco hay suelo; el logo se recorta en el borde de C</p>
<div class="line is-hidden">
  <div class="item a">A · 133,33</div><div class="item b">B · 133,33</div><div class="item c"><img src="logo-cafe-altura.svg" alt="Café Altura" width="160" height="40"></div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
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

/* Sin padding horizontal, para que las cuentas salgan exactas (como en la lección 3). */
.item {
  flex: 0 1 200px;
  line-height: 40px;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.item img {
  display: block;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }
.c { background: #a7f3d0; }

/* El valor inicial de min-width es auto. En el flujo normal, auto vale 0. En un
   elemento flex vale «el tamaño mínimo de su CONTENIDO» (su min-content): la palabra
   más larga, la línea más larga de un <pre>, la imagen más ancha… Aquí, 160px.
   Es un min-width de verdad: en el paso 4 del algoritmo (lección 3), C choca con él,
   se congela en 160 y A y B se reparten lo que queda.
   En una columna (flex-direction: column) pasa lo mismo con min-height: auto. */

/* Dos formas de quitar el suelo: */
.is-zero .c {
  min-width: 0;          /* sin mínimo: el contenido que no cabe se desborda */
}

.is-hidden .c {
  overflow: hidden;      /* un contenedor de scroll (hidden, auto, scroll) no tiene
                            mínimo automático: su contenido ya no se puede salir.
                            overflow: clip NO cuenta: no crea un contenedor de scroll. */
}
```
