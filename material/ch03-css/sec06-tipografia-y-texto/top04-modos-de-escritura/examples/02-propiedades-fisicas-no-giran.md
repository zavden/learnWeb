---
example_description: "Una cita con la barra a la izquierda (border-left, padding-left) y la etiqueta a la derecha (right) se ve al revés en árabe; con border-inline-start, padding-inline-start e inset-inline-end la barra va siempre donde empieza el texto, también en japonés vertical"
example_tags: "css|modos-de-escritura|propiedades-logicas|rtl|dir|border-inline-start|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ Propiedades físicas: en árabe, la barra de la cita queda donde <em>termina</em> el texto, y la etiqueta, donde empieza</p>
<div class="row">
  <blockquote class="quote is-physical">
    <p>El saber es luz.</p>
    <span class="tag">es</span>
  </blockquote>
  <blockquote class="quote is-physical" lang="ar" dir="rtl">
    <p>العلم نور.</p>
    <span class="tag">ar</span>
  </blockquote>
</div>

<p class="caption">✅ Propiedades lógicas: la barra va donde empieza el texto y la etiqueta, donde acaba</p>
<div class="row">
  <blockquote class="quote is-logical">
    <p>El saber es luz.</p>
    <span class="tag">es</span>
  </blockquote>
  <blockquote class="quote is-logical" lang="ar" dir="rtl">
    <p>العلم نور.</p>
    <span class="tag">ar</span>
  </blockquote>
  <blockquote class="quote is-logical is-vertical" lang="ja">
    <p>継続は力なり。</p>
    <span class="tag">ja</span>
  </blockquote>
</div>

<p class="credit">Proverbios: «El saber es luz» (árabe) y «La constancia es fuerza» (japonés).</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.row {
  display: flex;
  gap: 12px;
  align-items: start;
}

.quote {
  position: relative;
  margin: 0;
  background: #e0e7ff;
  font-size: 1.125rem;
}

.quote p {
  margin: 0;
}

.tag {
  position: absolute;
  padding: 0 4px;
  border-radius: 4px;
  background: #3730a3;
  color: #ffffff;
  font-size: 0.7rem;
}

/* ❌ left y right son lados de la PANTALLA. En español, la izquierda es donde
   empieza la línea; en árabe (dir="rtl"), donde termina. La barra queda al final
   de la frase, y la etiqueta y su hueco (padding-right), al principio. */
.is-physical {
  inline-size: 110px;
  padding: 8px 32px 8px 12px;
  border-left: 4px solid #4338ca;
}

.is-physical .tag {
  top: 4px;
  right: 4px;
}

/* ✅ inline-start y inline-end son lados del TEXTO: el principio y el final de la
   línea, sea el idioma que sea. Y en vertical (japonés), el principio de la línea
   es arriba: la barra se coloca encima, sin escribir ni una regla más. */
.is-logical {
  inline-size: 110px;
  padding-block: 8px;
  padding-inline: 12px 32px;          /* inicio, final */
  border-inline-start: 4px solid #4338ca;
}

.is-logical .tag {
  inset-block-start: 4px;
  inset-inline-end: 4px;
}

.is-vertical {
  inline-size: 170px;                 /* en vertical, el alto */
  writing-mode: vertical-rl;
}
```
