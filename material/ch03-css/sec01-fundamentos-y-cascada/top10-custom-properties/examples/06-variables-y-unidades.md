---
example_description: "var(--gap)px no funciona: la variable no se pega a la unidad. Se multiplica por 1px con calc()"
example_tags: "css|custom-properties|calc|unidades|errores"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="box bad">❌ <code>padding-left: var(--gap)px</code> → sin relleno</p>
<p class="box good">✅ <code>padding-left: calc(var(--gap) * 1px)</code> → 48px de relleno</p>
<p class="box better">✅ <code>--gap-length: 48px</code> y <code>padding-left: var(--gap-length)</code> → lo más sencillo</p>
```

# CSS

```css
:root {
  --gap: 48;                  /* un número sin unidad */
  --gap-length: 48px;         /* una longitud completa */
}

body {
  font-family: system-ui, sans-serif;
}

.box {
  background: #e0f2fe;
  border-left: 4px solid #0369a1;
}

/* 🐛 var() se sustituye por su valor como una pieza aparte: el resultado es «48 px»,
   un número y una palabra separados, no la longitud 48px. → inválido en tiempo de
   cómputo → unset → padding-left: 0. (Las variables de CSS no son texto que se pega.) */
.bad {
  padding-left: var(--gap)px;
}

/* ✅ Para convertir un número en una longitud, multiplícalo por una unidad */
.good {
  padding-left: calc(var(--gap) * 1px);
}

/* ✅ O guarda la unidad dentro de la variable desde el principio */
.better {
  padding-left: var(--gap-length);
}
```
