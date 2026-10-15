---
example_description: "Layout, paint y composite: qué fase repite el navegador según la propiedad que cambia"
example_tags: "render|layout|paint|composite|devtools"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- Pasa el ratón por cada fila: la caja azul cambia; fíjate en su vecina gris.
     Para verlo «por dentro»: DevTools → ⋮ → More tools → Rendering → activa
     «Paint flashing» (pinta de verde lo que se repinta) y repite. -->

<h2>1. width → layout + paint + composite</h2>
<!-- Cambia la geometría: hay que recalcular posiciones; la vecina se desplaza -->
<p class="row"><span class="box layout">cambio width</span><span class="neighbor">vecina</span></p>

<h2>2. background-color → paint + composite</h2>
<!-- Nada se mueve: basta con volver a pintar la caja -->
<p class="row"><span class="box paint">cambio de color</span><span class="neighbor">vecina</span></p>

<h2>3. transform → solo composite</h2>
<!-- transform mueve la caja ya pintada sin tocar el layout: la vecina ni se entera.
     Con will-change la caja tiene su propia capa y ni siquiera se repinta. -->
<p class="row"><span class="box composite">me desplazo</span><span class="neighbor">vecina</span></p>
```

# CSS

```css
/* (El CSS se estudia en el capítulo 3; .row:hover aplica la regla mientras el ratón
   está sobre la fila) */
.box,
.neighbor {
  display: inline-block;
  padding: 8px;
}

.box {
  width: 140px;
  background: #93c5fd;
}

.neighbor {
  background: #d1d5db;
}

.row:hover .layout {
  width: 240px;
}

.row:hover .paint {
  background: #fb923c;
}

.composite {
  will-change: transform;
}

.row:hover .composite {
  transform: translateX(80px);
}
```
