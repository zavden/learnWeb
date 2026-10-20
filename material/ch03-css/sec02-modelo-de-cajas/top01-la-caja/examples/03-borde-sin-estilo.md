---
example_description: "border: 4px #2563eb no dibuja nada: sin border-style el borde no existe y su ancho calculado es 0"
example_tags: "css|modelo-de-cajas|border|border-style"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="card no-style">❌ <code>border: 4px #2563eb</code> → ningún borde</p>
<p class="card longhands">❌ <code>border-width: 4px; border-color: #2563eb</code> → tampoco</p>
<p class="card fixed">✅ <code>border: 4px solid #2563eb</code></p>
<p class="card only-style">✅ <code>border-style: dashed</code> a secas: ancho <code>medium</code> (3px) y color <code>currentColor</code> por defecto</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.card {
  background: #f1f5f9;
  padding: 10px;
  color: #1e3a8a;
}

/* 🐛 El estilo inicial del borde es «none». El atajo border pone A SU VALOR INICIAL
   todo lo que no escribas, así que aquí el estilo queda en none… y un borde
   con estilo none no se dibuja y su ancho CALCULADO es 0 (míralo en DevTools → Computed:
   border-top-width: 0px). La declaración es válida: no hay ningún aviso. */
.no-style {
  border: 4px #2563eb;
}

/* 🐛 Lo mismo con las propiedades sueltas: falta border-style. */
.longhands {
  border-width: 4px;
  border-color: #2563eb;
}

/* ✅ El orden dentro del atajo da igual, pero el estilo no puede faltar. */
.fixed {
  border: 4px solid #2563eb;
}

/* ✅ El estilo es lo único imprescindible: el resto tiene un valor inicial visible. */
.only-style {
  border-style: dashed;
}
```
