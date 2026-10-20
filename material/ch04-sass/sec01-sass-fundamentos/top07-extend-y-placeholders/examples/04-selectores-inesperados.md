---
example_description: "@extend .title también hereda las reglas de .title en otros contextos: .sidebar .title encoge y pone en gris los títulos de las tarjetas del lateral"
example_tags: "sass|extend|selectores|contexto|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="layout">
  <main>
    <h2 class="title">Novedades</h2>
    <article class="card"><h3 class="card-title">Kit de goteo para 20 macetas</h3><p>Todo incluido, sin herramientas.</p></article>
  </main>
  <aside class="sidebar">
    <h2 class="title">Destacados</h2>
    <article class="card"><h3 class="card-title">❌ Mesa de cultivo</h3><p>¿Por qué este título es pequeño y gris?</p></article>
  </aside>
</div>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 16px;
}

.title {
  margin: 0 0 8px;
  font-family: Georgia, serif;
  font-size: 1.4rem;
  color: #14532d;
}

// Los títulos de sección del lateral son etiquetas pequeñas en mayúsculas.
// (En un proyecto real, esta regla podría estar en otro archivo, lejos de aquí.)
.sidebar .title {
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
  color: #475569;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  p {
    margin: 0;
  }
}

// 🐛 «Quiero que el título de la tarjeta se vea como .title».
// Pero @extend no copia «el aspecto de .title»: añade .card-title a TODAS las
// reglas que mencionan .title… incluida «.sidebar .title». En compiled.css:
//   .sidebar .title, .sidebar .card-title { font-size: 0.75rem; … }
// → las tarjetas del lateral heredan el estilo de etiqueta.
.card-title {
  @extend .title;
}

// ✅ Solución: un mixin (o un placeholder %title con SOLO el estilo base, que
// nadie use en reglas de contexto) copia exactamente lo que quieres y nada más.
```
