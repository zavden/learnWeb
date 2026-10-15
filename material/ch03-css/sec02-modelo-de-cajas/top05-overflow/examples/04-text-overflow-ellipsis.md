---
example_description: "text-overflow: ellipsis solo funciona con overflow hidden, white-space: nowrap y un ancho limitado; line-clamp recorta varias líneas"
example_tags: "css|overflow|text-overflow|ellipsis|line-clamp|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="title only-ellipsis">❌ Solo text-overflow: ellipsis — Cómo preparar un café de especialidad en casa sin máquina</p>
<p class="title full-recipe">✅ Las tres propiedades juntas — Cómo preparar un café de especialidad en casa sin máquina</p>
<p class="summary">✅ Varias líneas con line-clamp: Molemos el grano justo antes de prepararlo, calentamos el agua a unos 93 grados, mojamos el café para que suelte el gas y vertemos el resto en espiral durante tres minutos.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

p {
  width: 320px;
  padding: 6px 10px;
  background: #bfdbfe;
}

/* 🐛 text-overflow solo dice CÓMO marcar el texto recortado; no provoca el recorte. */
.only-ellipsis {
  text-overflow: ellipsis;
}

/* ✅ La receta completa: una sola línea, recortar lo que sobra y marcarlo con «…». */
.full-recipe {
  white-space: nowrap;          /* impide que el texto salte de línea */
  overflow: hidden;             /* recorta lo que no cabe */
  text-overflow: ellipsis;      /* y lo indica con … */
}

/* Varias líneas: line-clamp (con el prefijo -webkit- y display: -webkit-box, que es
   como lo implementan los navegadores hoy). */
.summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
```
