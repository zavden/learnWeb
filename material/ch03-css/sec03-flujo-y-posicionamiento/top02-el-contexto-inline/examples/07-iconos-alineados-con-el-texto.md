---
example_description: "Alinear un icono con el texto: con baseline queda alto, con middle algo bajo y con un pequeño desplazamiento negativo en em queda centrado con mayúsculas y cifras"
example_tags: "css|contexto-inline|vertical-align|iconos"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="legend">Compara el centro del reloj con el centro de «H» y de las cifras. La raya roja es la línea base.</p>

<p class="row"><span class="baseline-ruler" aria-hidden="true"></span><img class="icon" src="icon-clock.svg" alt="">Hoy, 18:30 <span class="tag">baseline: queda alto</span></p>
<p class="row"><span class="baseline-ruler" aria-hidden="true"></span><img class="icon is-middle" src="icon-clock.svg" alt="">Hoy, 18:30 <span class="tag">middle: algo bajo</span></p>
<p class="row"><span class="baseline-ruler" aria-hidden="true"></span><img class="icon is-offset" src="icon-clock.svg" alt="">Hoy, 18:30 <span class="tag">-0.125em: centrado</span></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend {
  font-size: 0.8rem;
}

.row {
  margin: 0 0 8px;
  font-size: 28px;
  white-space: nowrap;
}

/* El icono mide 1em: crece y encoge con el texto que acompaña. Es decorativo (alt=""):
   el texto ya dice la hora. */
.icon {
  width: 1em;
  height: 1em;
  margin-right: 0.3em;
}

/* baseline (por defecto): el borde inferior del icono se apoya en la línea base,
   así que sube tanto como una mayúscula y un poco más: queda alto. */

/* middle: centra el icono a media altura de la «x» minúscula. Bien con minúsculas;
   con mayúsculas y cifras, que son más altas, queda un poco bajo. */
.is-middle {
  vertical-align: middle;
}

/* Un desplazamiento en em baja el icono 1/8 de su tamaño: su centro coincide con el centro
   de las mayúsculas. Al ser em, funciona con cualquier tamaño de letra. */
.is-offset {
  vertical-align: -0.125em;
}

.tag {
  margin-left: 8px;
  color: #475569;
  font-size: 0.5em;
}

/* Regla visual de la línea base (ejemplo 3). */
.baseline-ruler {
  display: inline-block;
  width: 100%;
  margin-right: -100%;
  border-top: 2px dashed #dc2626;
}
```
