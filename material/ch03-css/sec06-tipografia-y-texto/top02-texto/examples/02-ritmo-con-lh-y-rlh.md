---
example_description: "Ritmo vertical: con márgenes de 1em el texto se sale de la pauta de renglones; con márgenes en rlh (el line-height de la raíz) cada párrafo y cada título caen sobre la misma pauta"
example_tags: "css|tipografia|line-height|lh|rlh|ritmo-vertical"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="label">Las franjas son la pauta de la página: renglones de 24px (el <code>line-height</code> de la raíz). Fíjate en el texto que va después de cada margen.</p>

<div class="pair">
  <section class="column" aria-label="Márgenes en em">
    <p class="caption">❌ márgenes de <code>1em</code> (16 y 20px)</p>
    <article class="note is-em">
      <h2>Masa madre</h2>
      <p>Mezcla 50&nbsp;g de harina integral con 50&nbsp;g de agua tibia.</p>
      <p>Tápala con un paño y déjala en un lugar templado.</p>
    </article>
  </section>

  <section class="column" aria-label="Márgenes en rlh">
    <p class="caption">✅ márgenes de <code>1rlh</code> (24px)</p>
    <article class="note is-rlh">
      <h2>Masa madre</h2>
      <p>Mezcla 50&nbsp;g de harina integral con 50&nbsp;g de agua tibia.</p>
      <p>Tápala con un paño y déjala en un lugar templado.</p>
    </article>
  </section>
</div>
```

# CSS

```css
/* La pauta de toda la página: 16px × 1.5 = 24px. Es lo que vale 1rlh («root line
   height»: el line-height del elemento raíz) en cualquier elemento. */
:root {
  line-height: 1.5;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
  line-height: 1.4;
}

.pair {
  display: flex;
  gap: 16px;
  align-items: start;
}

.column {
  flex: none;
  inline-size: 180px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.75rem;
}

/* La pauta dibujada: dos renglones de 24px por dibujo. */
.note {
  display: flow-root;      /* contiene los márgenes de dentro (módulo del modelo de cajas) */
  background: url("line-bands.svg") 0 0 / 100% 2rlh;
}

/* Un título más grande ocupa EXACTAMENTE un renglón de la pauta: su line-height
   no es un factor sino 1rlh (24px), aunque su letra mida 20px. */
.note h2 {
  font-size: 1.25rem;
  line-height: 1rlh;
}

/* ❌ 1em de margen: 16px en los párrafos y 20px en el título (su letra es mayor).
   Ninguno es un renglón entero, así que todo lo que viene después de un margen
   queda descolocado respecto a la pauta. */
.is-em h2,
.is-em p {
  margin: 1em 0;
}

/* ✅ Márgenes medidos en renglones: el texto vuelve a caer sobre la pauta.
   lh es el line-height del PROPIO elemento; rlh, el de la raíz: con rlh, el
   título y los párrafos usan la misma medida aunque tengan otro tamaño de letra. */
.is-rlh h2,
.is-rlh p {
  margin: 1rlh 0;
}
```
