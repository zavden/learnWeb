---
example_description: "Letra capital: con float la inicial grande nunca encaja con las líneas; initial-letter: 3 la hunde exactamente tres líneas, de la altura de las mayúsculas a la línea base de la tercera"
example_tags: "css|tipografia|initial-letter|first-letter|letra-capital"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">❌ <code>::first-letter</code> con <code>float</code> y un <code>font-size</code> a ojo: la E no se apoya en ninguna línea</p>
<p class="opening is-float">En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.</p>

<p class="caption">✅ <code>initial-letter: 3</code>: la E ocupa tres líneas justas, alineada arriba con las mayúsculas y abajo con la línea base</p>
<p class="opening is-initial">En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.</p>
```

# CSS

```css
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-display: swap;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 12px 0 4px;
  font-size: 0.75rem;
}

.opening {
  max-inline-size: 22rem;
  margin: 0;
  font-family: Literata, Georgia, serif;
  line-height: 1.5;
  background: url("line-bands.svg") 0 0 / 100% 2lh;   /* las franjas son las líneas */
}

.opening::first-letter {
  color: #3730a3;
  font-weight: 700;
}

/* ❌ El método clásico: la primera letra flota a la izquierda con un tamaño
   calculado a ojo. Su caja mide lo que dicen su font-size y su line-height, que
   no tienen relación con las líneas del párrafo: queda alta o baja, y cambia con
   cada fuente. */
.is-float::first-letter {
  float: left;
  margin-inline-end: 4px;
  font-size: 4.2em;
  line-height: 1;
}

/* ✅ initial-letter: N hunde la letra N líneas: el navegador calcula el tamaño
   para que su altura de mayúscula vaya de la primera línea a la línea base de la
   N-ésima. Desde Chrome 110. Recuerda que ::first-letter incluye la puntuación de
   delante: en «¿Sabías…?», la capital sería «¿S». */
.is-initial::first-letter {
  initial-letter: 3;
  margin-inline-end: 6px;
}
```
