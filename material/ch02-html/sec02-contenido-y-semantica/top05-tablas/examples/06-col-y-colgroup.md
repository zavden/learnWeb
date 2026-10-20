---
example_description: "colgroup y col permiten dar estilo a columnas enteras, pero solo admiten unas pocas propiedades: background, width, border y visibility"
example_tags: "html|tablas|colgroup|col"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<table>
  <caption>Comparativa de planes</caption>
  <colgroup>
    <col class="feature">
    <col span="2">
    <col class="featured">
  </colgroup>
  <thead>
    <tr><th scope="col">Característica</th><th scope="col">Gratis</th><th scope="col">Básico</th><th scope="col">Pro</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Proyectos</th><td>1</td><td>10</td><td>Ilimitados</td></tr>
    <tr><th scope="row">Almacenamiento</th><td>1 GB</td><td>20 GB</td><td>1 TB</td></tr>
    <tr><th scope="row">Soporte</th><td>Foro</td><td>Correo</td><td>24/7</td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

table {
  border-collapse: collapse;
}

th,
td {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
}

/* Las celdas no son hijas de col, así que la mayoría de propiedades (color, padding,
   font-weight…) NO se aplican desde col. Solo funcionan unas pocas. */
.feature  { width: 160px; }
.featured { background: #dbeafe; border: 3px solid #1d4ed8; }
.featured { color: red; font-weight: 700; }   /* ❌ ignoradas: no llegan a las celdas */
```
