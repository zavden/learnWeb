---
example_description: "El truco de depuración * { outline: 1px solid } dibuja todas las cajas sin mover nada; con border, el diseño cambia"
example_tags: "css|modelo-de-cajas|outline|depuracion"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="controls">
  <label><input type="checkbox" id="show-outline"> Ver cajas con <code>outline</code></label>
  <label><input type="checkbox" id="show-border"> Ver cajas con <code>border</code></label>
</p>
<article class="page">
  <h2>Mercado de la Cebada</h2>
  <p>Abierto de <strong>lunes a sábado</strong>, de 9:00 a 14:00 y de 17:00 a 20:30.</p>
  <ul>
    <li>Fruta y verdura de temporada</li>
    <li>Pescado fresco</li>
    <li>Panadería y bollería</li>
  </ul>
</article>
<p class="marker">▲ Vigila esta línea al marcar cada casilla.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.controls label {
  margin-right: 12px;
}

.page {
  max-width: 420px;
}

.marker {
  background: #fef9c3;
  margin: 0;
}

/* ✅ outline dibuja el contorno de CADA caja sin ocupar sitio: el diseño queda idéntico.
   Es el truco más rápido para entender un layout sin abrir DevTools.
   (:has() es de la lección de pseudoclases: «si la casilla está marcada…») */
body:has(#show-outline:checked) .page,
body:has(#show-outline:checked) .page * {
  outline: 1px solid #dc2626;
}

/* Con border, cada caja crece 2px de alto: las cajas anidadas suman, todo baja
   y la línea amarilla se desplaza (un borde también cambia cómo se juntan los márgenes:
   lección 3). Para depurar, mejor algo que no toque el layout. */
body:has(#show-border:checked) .page,
body:has(#show-border:checked) .page * {
  border: 1px solid #2563eb;
}
```
