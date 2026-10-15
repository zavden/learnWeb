---
example_description: "Barra lateral y contenido sin media queries: con flex-wrap y un flex-grow enorme en el contenido, van lado a lado si caben y se apilan cuando no"
example_tags: "css|flexbox|flex-wrap|flex-grow|responsive|sidebar|patrones"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="label">La misma ficha en 440px (lado a lado) y en 300px (apilada). ↔ Estrecha la vista previa o ábrela con ↗ y busca el punto en que cambia.</p>

<article class="with-sidebar">
  <div class="sidebar">
    <h3>Ficha rápida</h3>
    <p>Luz: indirecta<br>Riego: cada 7 días<br>Mascotas: tóxica</p>
  </div>
  <div class="main">
    <h3>Monstera deliciosa</h3>
    <p>Sus hojas se abren con la edad. Colócala cerca de una ventana sin sol directo y limpia sus hojas con un paño húmedo una vez al mes.</p>
  </div>
</article>

<article class="with-sidebar is-narrow">
  <div class="sidebar">
    <h3>Ficha rápida</h3>
    <p>Luz: indirecta<br>Riego: cada 7 días<br>Mascotas: tóxica</p>
  </div>
  <div class="main">
    <h3>Monstera deliciosa</h3>
    <p>Sus hojas se abren con la edad. Colócala cerca de una ventana sin sol directo y limpia sus hojas con un paño húmedo una vez al mes.</p>
  </div>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-width: 440px;
  margin-bottom: 10px;
  padding: 6px;
  outline: 2px dashed #7c3aed;
  font-size: 0.8rem;
}

.is-narrow {
  max-width: 300px;
}

.with-sidebar h3 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

.with-sidebar p {
  margin: 0;
}

/* La barra quiere 8rem; el contenido, al menos 15rem.
   ¿Caben los dos en una línea? (8rem + 15rem + el padding de la barra + el gap:
   unos 400px)
   - Sí: van juntos y se reparte lo que sobra. El contenido tiene flex-grow: 999 y la
     barra 1, así que el contenido se lleva 999 de cada 1000 píxeles libres: la barra
     se queda prácticamente en sus 8rem.
   - No: flex-wrap pasa el contenido (el segundo en el HTML) a la línea siguiente.
     Cada uno queda solo en su línea y crece hasta llenarla: la barra, arriba.
   El cambio ocurre según el ancho del CONTENEDOR, no de la pantalla: la misma pieza
   funciona en una columna estrecha o en una página ancha, sin una sola @media. */
.sidebar {
  flex: 1 1 8rem;
  padding: 8px;
  border-radius: 6px;
  background: #f0fdf4;
}

.main {
  flex: 999 1 15rem;
  min-width: 0;              /* por si un día lleva un <pre> o una URL (lección 4) */
}
```
