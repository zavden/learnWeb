---
example_description: "Una media query aplica reglas solo cuando el viewport cumple una condición: un indicador y una rejilla de productos que pasa de 1 a 2 y 3 columnas a partir de 40rem y 64rem"
example_tags: "css|responsive|media-queries|breakpoints|mobile-first|grid"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">En la tarjeta (480px de ancho): <strong>una columna</strong>. Ensancha la vista previa o ábrela con ↗: desde 40rem (640px), dos columnas; desde 64rem (1024px), tres.</p>
<p class="viewport-badge"></p>

<ul class="products">
  <li><strong>Monstera deliciosa</strong><span>Maceta de 20 cm · 420 MXN</span></li>
  <li><strong>Lengua de suegra</strong><span>Maceta de 15 cm · 260 MXN</span></li>
  <li><strong>Helecho de Boston</strong><span>Colgante · 310 MXN</span></li>
  <li><strong>Suculentas variadas</strong><span>Caja de 6 · 350 MXN</span></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

/* El indicador: el texto y el color salen de la media query que se cumple. */
.viewport-badge {
  display: inline-block;
  margin: 0 0 10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.8rem;
  font-weight: 700;
}

.viewport-badge::after {
  content: "móvil · menos de 40rem";
}

/* Estilos base: para el viewport más estrecho. Una columna. */
.products {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.products li {
  display: grid;
  padding: 10px;
  border: 1px solid #0f766e;
  border-radius: 8px;
  background: #f0fdfa;
  font-size: 0.85rem;
}

/* @media (condición) { reglas }: las reglas de dentro solo cuentan mientras la
   condición se cumple. width es el ancho del viewport: aquí, la vista previa. */
@media (width >= 40rem) {
  .viewport-badge { background: #dbeafe; color: #1e3a8a; }
  .viewport-badge::after { content: "tableta · desde 40rem (640px)"; }
  .products { grid-template-columns: repeat(2, 1fr); }
}

/* Desde 64rem se cumplen LAS DOS media queries; esta va después y gana donde
   chocan (las media queries no suman especificidad: decide el orden). */
@media (width >= 64rem) {
  .viewport-badge { background: #dcfce7; color: #166534; }
  .viewport-badge::after { content: "escritorio · desde 64rem (1024px)"; }
  .products { grid-template-columns: repeat(3, 1fr); }
}
```
