---
example_description: "Combinador descendiente (espacio) frente a combinador hijo (>): a cualquier profundidad o solo el nivel directo"
example_tags: "css|selectores|combinadores|descendiente|hijo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="legend">Texto azul ← <code>.article p</code> · Fondo verde ← <code>.article &gt; p</code></div>
<section class="article">
  <p>Hijo directo de .article → <code>.article p</code> ✅ · <code>.article &gt; p</code> ✅</p>
  <blockquote>
    <p>Nieto (dentro de un blockquote) → <code>.article p</code> ✅ · <code>.article &gt; p</code> ❌</p>
  </blockquote>
  <p>Hijo directo → <code>.article p</code> ✅ · <code>.article &gt; p</code> ✅</p>
</section>
<p>Fuera de .article → ninguno de los dos</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* DESCENDIENTE (un espacio): cualquier p DENTRO de .article, a cualquier profundidad */
.article p {
  color: #1d4ed8;
}

/* HIJO (>): solo los p cuyo padre DIRECTO es .article */
.article > p {
  background: #bbf7d0;
}
```
