---
example_description: "El breakpoint lo decide el contenido, no una lista de móviles: la versión en dos columnas de una tarjeta de receta, medida a 420, 300 y 220px, muestra dónde se rompe; la tarjeta real se apila justo por debajo de ese punto (26rem)"
example_tags: "css|responsive|breakpoints|media-queries|mobile-first|contenido"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">1. Mide: la versión en dos columnas, forzada en cajas de ancho fijo (sin media queries).</p>
<div class="samples">
  <article class="recipe is-two-columns" style="width: 420px"><div class="photo" aria-hidden="true">🌶️</div><div><h3>Chiles en nogada</h3><p>Chile poblano relleno de picadillo, bañado en nogada y granada. Plato de temporada (agosto y septiembre).</p></div></article>
  <p class="label">420px: cómodo, unas 40 letras por línea</p>
  <article class="recipe is-two-columns" style="width: 300px"><div class="photo" aria-hidden="true">🌶️</div><div><h3>Chiles en nogada</h3><p>Chile poblano relleno de picadillo, bañado en nogada y granada. Plato de temporada (agosto y septiembre).</p></div></article>
  <p class="label">300px: unas 20 letras por línea; se lee a saltos</p>
  <article class="recipe is-two-columns" style="width: 220px"><div class="photo" aria-hidden="true">🌶️</div><div><h3>Chiles en nogada</h3><p>Chile poblano relleno de picadillo, bañado en nogada y granada.</p></div></article>
  <p class="label">220px: roto, casi una palabra por línea</p>
</div>

<p class="caption">2. Decide: la tarjeta real se apila por debajo de <strong>26rem (416px)</strong> de viewport. En esta tarjeta de 480px va en dos columnas; estrecha la vista previa y verás el cambio.</p>
<article class="recipe"><div class="photo" aria-hidden="true">🌶️</div><div><h3>Chiles en nogada</h3><p>Chile poblano relleno de picadillo, bañado en nogada y granada. Plato de temporada (agosto y septiembre).</p></div></article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.recipe {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #fdba74;
  border-radius: 10px;
  background: #fff7ed;
  font-size: 0.85rem;
}

.recipe h3 { margin: 0 0 4px; font-size: 1rem; }
.recipe p { margin: 0; }

.photo {
  display: grid;
  place-items: center;
  min-height: 5rem;
  border-radius: 8px;
  background: #166534;
  font-size: 2rem;
}

/* Las muestras: dos columnas SIEMPRE, para medir dónde se rompen. */
.is-two-columns {
  grid-template-columns: 8rem 1fr;
}

/* Las cuentas: el texto necesita unos 14rem (≈ 30 letras por línea), la foto
   8rem, el hueco 1rem y el relleno 2rem: 25rem de tarjeta, más los 16px de
   margen del body ≈ 26rem de viewport. Ningún móvil concreto: el contenido. */
@media (width >= 26rem) {
  .recipe {
    grid-template-columns: 8rem 1fr;
  }
}
```
