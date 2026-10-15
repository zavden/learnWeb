---
example_description: "Mezclar comas y barra en rgb() o escribir un hexadecimal con cifras de más invalida el color y la declaración se descarta en silencio"
example_tags: "css|color|errores|rgb"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p class="box bad-mixed">❌ <code>rgb(37, 99, 235 / 0.5)</code> → comas y barra mezcladas: sin fondo</p>
<p class="box good-modern">✅ <code>rgb(37 99 235 / 0.5)</code> → sintaxis moderna, todo con espacios</p>
<p class="box good-legacy">✅ <code>rgba(37, 99, 235, 0.5)</code> → sintaxis antigua, todo con comas</p>
<p class="box bad-hex">❌ <code>#2563eb8</code> → 7 cifras: sin fondo</p>
<p class="box good-hex">✅ <code>#2563eb80</code> → 8 cifras (alfa 80)</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.box {
  padding: 6px 8px;
  margin: 6px 0;
  border: 2px solid #2563eb;
}

/* 🐛 rgb() admite DOS sintaxis, pero no mezcladas:
     moderna: rgb(R G B / A)        antigua: rgb(R, G, B) o rgba(R, G, B, A)
   Mezclarlas da un color inválido → se descarta la declaración (lección 1)
   → el fondo se queda transparente, sin ningún aviso. */
.bad-mixed   { background: rgb(37, 99, 235 / 0.5); }
.good-modern { background: rgb(37 99 235 / 0.5); }
.good-legacy { background: rgba(37, 99, 235, 0.5); }

/* 🐛 Un hexadecimal solo puede tener 3, 4, 6 u 8 cifras */
.bad-hex  { background: #2563eb8; }
.good-hex { background: #2563eb80; }
```
