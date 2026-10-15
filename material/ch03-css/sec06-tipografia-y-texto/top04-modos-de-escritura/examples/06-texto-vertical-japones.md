---
example_description: "En japonés vertical, las letras latinas y las cifras se tumban; text-orientation: upright pone de pie una sigla y text-combine-upright: all mete un número de dos cifras en el ancho de un carácter"
example_tags: "css|modos-de-escritura|writing-mode|text-orientation|text-combine-upright|japones"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="label">«La sesión de estudio de CSS es el 13 de octubre», en japonés vertical. Fíjate en «CSS», «10» y «13».</p>

<div class="cases">
  <figure class="case">
    <figcaption>❌ <code>mixed</code> (inicial): tumbadas</figcaption>
    <p class="vertical" lang="ja">CSSの勉強会は10月13日です。</p>
  </figure>

  <figure class="case">
    <figcaption>✅ sigla de pie y números combinados</figcaption>
    <p class="vertical" lang="ja"><span class="upright">CSS</span>の勉強会は<span class="tcy">10</span>月<span class="tcy">13</span>日です。</p>
  </figure>

  <figure class="case">
    <figcaption><code>upright</code> en todo: cada cifra en su casilla</figcaption>
    <p class="vertical is-all-upright" lang="ja">CSSの勉強会は10月13日です。</p>
  </figure>
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
  gap: 16px;
  align-items: start;
}

.case {
  inline-size: 120px;
  margin: 0;
}

.case figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

/* Las propiedades lógicas de un elemento se resuelven con SU modo de escritura:
   en esta caja vertical, inline-size es el alto (y el ancho sale del contenido). */
.vertical {
  inline-size: 220px;
  margin: 0;
  padding: 8px;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
  font-size: 1.25rem;
  writing-mode: vertical-rl;
}

/* text-orientation: mixed (inicial) deja de pie los caracteres japoneses y chinos,
   y TUMBA 90° los de escritura horizontal: letras latinas y cifras. Se leen
   girando la cabeza a la derecha. */

/* Una sigla corta se suele escribir de pie, letra a letra. */
.upright {
  text-orientation: upright;
}

/* Los números de dos cifras se escriben en horizontal dentro del ancho de un solo
   carácter: es el «tate-chū-yoko» (horizontal dentro de vertical).
   text-combine-upright: all comprime todo el elemento en una casilla, así que
   úsalo solo con dos o tres caracteres. */
.tcy {
  text-combine-upright: all;
}

/* upright en todo el párrafo pone de pie cada cifra por separado: «1» y «0» en
   dos casillas. Vale para números sueltos; para fechas, mejor combinar. */
.is-all-upright {
  text-orientation: upright;
}
```
