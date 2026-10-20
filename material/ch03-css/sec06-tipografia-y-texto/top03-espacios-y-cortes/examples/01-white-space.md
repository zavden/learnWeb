---
example_description: "El mismo poema con sus saltos de línea y sus espacios en el HTML, con cinco valores de white-space: qué se junta, qué se conserva y si las líneas se parten al llegar al borde"
example_tags: "css|tipografia|white-space|pre-line|pre-wrap|nowrap"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">En el HTML, el poema tiene un salto al final de cada verso, sangría en los versos pares y tres espacios antes de «eres tú». Las cajas miden 190px.</p>

<div class="cases">
  <figure class="case">
    <figcaption><code>normal</code>: junta espacios y saltos; parte las líneas</figcaption>
<p class="poem is-normal">¿Qué es poesía?, dices mientras clavas
    en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
    Poesía…   eres tú.</p>
  </figure>

  <figure class="case">
    <figcaption><code>pre-line</code>: junta espacios; conserva los saltos</figcaption>
<p class="poem is-pre-line">¿Qué es poesía?, dices mientras clavas
    en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
    Poesía…   eres tú.</p>
  </figure>

  <figure class="case">
    <figcaption><code>pre-wrap</code>: conserva todo; parte las líneas</figcaption>
<p class="poem is-pre-wrap">¿Qué es poesía?, dices mientras clavas
    en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
    Poesía…   eres tú.</p>
  </figure>

  <figure class="case">
    <figcaption><code>pre</code>: conserva todo; no parte (se desplaza)</figcaption>
<p class="poem is-pre">¿Qué es poesía?, dices mientras clavas
    en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
    Poesía…   eres tú.</p>
  </figure>

  <figure class="case">
    <figcaption><code>nowrap</code>: lo junta todo en una línea (se desplaza)</figcaption>
<p class="poem is-nowrap">¿Qué es poesía?, dices mientras clavas
    en mi pupila tu pupila azul.
¿Qué es poesía? ¿Y tú me lo preguntas?
    Poesía…   eres tú.</p>
  </figure>
</div>

<p class="credit">Gustavo Adolfo Bécquer, <cite>Rima XXI</cite> (1871).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.credit {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

.cases {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.case {
  inline-size: 190px;
  margin: 0;
}

.case figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

/* overflow-x: auto: lo que no cabe se desplaza dentro de la caja, sin ensanchar
   la página. */
.poem {
  margin: 0;
  padding: 4px 6px;
  overflow-x: auto;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
  font-family: Georgia, serif;
  font-size: 13px;
  line-height: 1.4;
}

/* white-space decide tres cosas:
   1. ¿Se juntan los espacios y tabuladores seguidos en uno solo?
   2. ¿Los saltos de línea del HTML se convierten en espacios o se conservan?
   3. ¿Se parten las líneas al llegar al borde de la caja? */
.is-normal    { white-space: normal; }    /* sí · espacios · sí */
.is-pre-line  { white-space: pre-line; }  /* sí · se conservan · sí */
.is-pre-wrap  { white-space: pre-wrap; }  /* no · se conservan · sí */
.is-pre       { white-space: pre; }       /* no · se conservan · no */
.is-nowrap    { white-space: nowrap; }    /* sí · espacios · no */
```
