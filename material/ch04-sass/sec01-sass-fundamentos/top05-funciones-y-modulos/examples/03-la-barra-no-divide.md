---
example_description: "La barra / ya no es división en Sass: 32px/2 se queda tal cual (CSS inválido) y $width / 3 divide pero avisa de que dejará de hacerlo. Usa math.div o calc()"
example_tags: "sass|sass-math|division|deprecacion|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="box box-literal">❌ <code>padding: 32px/2</code> → sin padding</div>
<div class="box box-variable">⚠️ <code>width: $width / 3</code> → funciona, con aviso</div>
<div class="box box-ok">✅ <code>math.div(32px, 2)</code> y <code>math.div($width, 3)</code></div>
<p>Mira también <code>compiled.css</code> y los avisos de <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
@use "sass:math";

$width: 600px;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.box {
  margin-bottom: 8px;
  border: 2px solid #0369a1;
  background: #e0f2fe;
}

// 🐛 1) Con dos números escritos a mano, la barra es la de CSS, no una división:
//    en CSS la / separa valores (font: 16px/1.5, grid-area: 1 / 3, aspect-ratio: 16 / 9).
//    Sass copia «32px/2» al CSS; el navegador lo rechaza por inválido → sin padding.
.box-literal {
  padding: 32px/2;
}

// ⚠️ 2) Con una variable, Sass SÍ divide (200px)… pero avisa en sass-output.txt:
//    «Using / for division outside of calc() is deprecated and will be removed
//     in Dart Sass 2.0.0». Es decir: este código dejará de funcionar.
.box-variable {
  width: $width / 3;
  padding: 16px;
}

// ✅ La forma moderna: math.div() divide siempre y no se confunde con la / de CSS.
//    Si la cuenta puede hacerla el navegador, calc() también vale: calc($width / 3).
.box-ok {
  width: math.div($width, 3);
  padding: math.div(32px, 2);
}
```
