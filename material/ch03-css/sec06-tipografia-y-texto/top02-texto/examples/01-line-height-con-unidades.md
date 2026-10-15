---
example_description: "line-height con unidades (1.5em, 150%) se calcula en el padre y los hijos heredan los píxeles: un título de 32px recibe 24px y sus líneas se montan; sin unidad (1.5) se hereda el factor y el título calcula 48px"
example_tags: "css|tipografia|line-height|herencia|valor-computado|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">Las tres recetas tienen <code>font-size: 16px</code> y un título de 32px. Solo cambia cómo se escribe el <code>line-height</code> de la receta. Las franjas marcan las cajas de línea del título.</p>

<div class="cases">
  <section class="case" aria-label="line-height: 1.5em">
    <p class="caption">❌ <code>1.5em</code><br>receta: 16 × 1.5 = <strong>24px</strong><br>el título hereda <strong>24px</strong></p>
    <article class="recipe is-em">
      <h2>Pan de muerto casero</h2>
      <p>Para 8 piezas.</p>
    </article>
  </section>

  <section class="case" aria-label="line-height: 150%">
    <p class="caption">❌ <code>150%</code><br>receta: 16 × 150 % = <strong>24px</strong><br>el título hereda <strong>24px</strong></p>
    <article class="recipe is-percent">
      <h2>Pan de muerto casero</h2>
      <p>Para 8 piezas.</p>
    </article>
  </section>

  <section class="case" aria-label="line-height: 1.5">
    <p class="caption">✅ <code>1.5</code><br>receta: 16 × 1.5 = <strong>24px</strong><br>el título hereda 1.5: 32 × 1.5 = <strong>48px</strong></p>
    <article class="recipe is-number">
      <h2>Pan de muerto casero</h2>
      <p>Para 8 piezas.</p>
    </article>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.cases {
  display: flex;
  gap: 12px;
  align-items: start;
}

.case {
  flex: none;
  inline-size: 124px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.7rem;
}

.recipe {
  font-size: 16px;
  outline: 1px dashed #4338ca;
}

.recipe h2 {
  margin: 0;
  font-size: 32px;
  /* Franjas de 1 línea: 2lh (dos veces el line-height del propio h2) es el
     tamaño del dibujo de dos franjas. */
  background: url("line-bands.svg") 0 0 / 100% 2lh;
}

.recipe p {
  margin: 0;
}

/* 🐛 Con unidades, line-height se convierte en píxeles EN LA RECETA (24px), y lo que
   se hereda es ese valor calculado, no la fórmula. El título hereda 24px para una
   letra de 32px: el interlineado es negativo y las líneas se montan.
   Compruébalo en DevTools: Computed → line-height del h2 = 24px. */
.is-em {
  line-height: 1.5em;
}

.is-percent {
  line-height: 150%;
}

/* ✅ Un número sin unidad se hereda TAL CUAL: cada elemento lo multiplica por su
   propio font-size. Receta: 16 × 1.5 = 24px; título: 32 × 1.5 = 48px.
   (A los títulos grandes les sienta mejor un factor menor, como 1.1 o 1.2;
   escríbelo en el h2, también sin unidad.) */
.is-number {
  line-height: 1.5;
}
```
